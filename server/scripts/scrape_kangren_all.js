import axios from 'axios'
import * as cheerio from 'cheerio'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'

import Product from '../models/Product.js'
import Category from '../models/Category.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const SERVER_DIR = path.resolve(__dirname, '..')

dotenv.config({ path: path.join(SERVER_DIR, '.env') })

const BASE_URL = 'http://shkangren.net'
const START_URL = `${BASE_URL}/products/`
const CATEGORY_NAME = 'Training Materials'
const MANUFACTURER = 'Shanghai Kangren Medical Science Instrument Equipment Co.Ltd'

const SUBCATEGORY_MAP = {
  jjzy: 'Emergency Skills Training Models',
  hlzy: 'Nursing Skills Training Models',
  lczh: 'Clinical Comprehensive Specialty Training Models',
  fyzk: 'Maternal and Child Specialty Training Models',
  lczd: 'Clinical Diagnostic Skills Training Models',
  yxdmt: 'Medical Multimedia Series',
  xnyx: 'Virtual Medical Skills Training Systems',
  gjrt: 'Advanced Human Anatomy Medical Training Models',
  zyzk: 'Traditional Chinese Medicine Specialty Training Models',
  yxjj: 'Medical First Aid Training Equipment',
  kqzk: 'Oral Specialty Medical Training Models',
  yxcs: 'Medical Color Teaching Charts and Software',
}

const KNOWN_LEAD_IMAGE_PATTERNS = [/d2a6d3b943ac886\.jpg/i]

function absUrl(url) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('//')) return `http:${url}`
  if (url.startsWith('/')) return `${BASE_URL}${url}`
  return `${BASE_URL}/${url.replace(/^\/+/, '')}`
}

function cleanText(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/\u00A0/g, ' ')
    .trim()
}

function translateKnownChineseName(name) {
  const text = cleanText(name)
  const map = {
    CPR按压板: 'CPR Compression Board',
    '一次性CPR训练屏障消毒面膜（50张/盒）': 'Disposable CPR Training Barrier Face Shield (50 pcs/box)',
  }
  return map[text] || text
}

function isKnownLeadImage(url) {
  const value = cleanText(url)
  if (!value) return false
  return KNOWN_LEAD_IMAGE_PATTERNS.some((pattern) => pattern.test(value))
}

function normalizeImages(images) {
  const unique = Array.from(new Set((images || []).map((img) => cleanText(img)).filter(Boolean)))
  if (!unique.length) return []

  let normalized = [...unique]
  if (normalized.length > 1 && isKnownLeadImage(normalized[0])) {
    normalized = normalized.slice(1)
  }

  return normalized.slice(0, 12)
}

function buildSearchText(doc) {
  const parts = []
  if (doc.name) parts.push(doc.name)
  if (doc.description) parts.push(doc.description)
  if (doc.category) parts.push(doc.category)
  if (doc.subcategory) parts.push(doc.subcategory)
  if (Array.isArray(doc.tags)) parts.push(doc.tags.join(' '))
  if (doc.specifications && typeof doc.specifications === 'object') {
    parts.push(Object.entries(doc.specifications).map(([k, v]) => `${k} ${v}`).join(' '))
  }
  return cleanText(parts.join(' '))
}

function parseDetailMeta(detailUrl) {
  const url = String(detailUrl || '')
  const codeMatch = url.match(/\/products\/([^/]+)\//i)
  const showMatch = url.match(/show(\d+)\.html/i)
  const code = codeMatch ? codeMatch[1].toLowerCase() : ''
  const showId = showMatch ? showMatch[1] : ''
  return { code, showId }
}

function subcategoryFromCode(code) {
  if (!code) return 'General Training Materials'
  return SUBCATEGORY_MAP[code] || 'General Training Materials'
}

async function ensureCategory(name) {
  const clean = cleanText(name)
  if (!clean) return
  await Category.findOneAndUpdate(
    { name: clean },
    { $setOnInsert: { name: clean } },
    { upsert: true, new: true }
  )
}

async function fetchPage(url) {
  const res = await axios.get(url, {
    timeout: 90000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  })
  return cheerio.load(res.data)
}

function extractFromListPage($, sourceUrl) {
  const detailItems = []
  const listPages = []
  const seenDetails = new Set()
  const seenPages = new Set()

  $('a[href]').each((_, el) => {
    const hrefRaw = $(el).attr('href') || ''
    const href = absUrl(hrefRaw)
    if (!href) return

    if (/\/products\/list\d+\.html$/i.test(href)) {
      if (!seenPages.has(href)) {
        seenPages.add(href)
        listPages.push(href)
      }
      return
    }

    if (!/\/products\/[a-z0-9]+\/show\d+\.html$/i.test(href)) return
    if (seenDetails.has(href)) return

    seenDetails.add(href)

    const title = cleanText($(el).text() || $(el).attr('title') || '')
    const img = $(el).find('img').first()
    const image = absUrl(img.attr('src') || img.attr('data-original') || '')

    const { code, showId } = parseDetailMeta(href)
    detailItems.push({
      sourceUrl,
      detailUrl: href,
      code,
      showId,
      name: title,
      image,
    })
  })

  return { detailItems, listPages }
}

function extractDetail($, base) {
  const rawTitle = cleanText(
    $('h1').first().text() ||
      $('.pro-main h2').first().text() ||
      $('meta[property="og:title"]').attr('content') ||
      base.name ||
      ''
  )

  const title = translateKnownChineseName(rawTitle)

  const descriptionCandidates = [
    $('.pro-main .content').text(),
    $('.pro-main .editor').text(),
    $('.pro-main .page-editor').text(),
    $('.pro-main').text(),
    $('meta[name="description"]').attr('content') || '',
  ]

  let description = cleanText(descriptionCandidates.find((t) => cleanText(t).length > 60) || '')
  if (!description) description = title || 'Training material product'
  description = cleanText(description.replace(/\s*imported from kangren\.?/gi, ''))
  if (description.length > 4000) description = description.slice(0, 4000)

  const images = []
  $('.pro-main img, .content img, .editor img, img').each((_, img) => {
    const src = absUrl($(img).attr('data-original') || $(img).attr('src') || '')
    if (!src) return
    if (src.startsWith('data:image')) return
    if (/logo|icon|ewm|mewm|contact|s_so|ibanner|prolist/i.test(src)) return
    if (!images.includes(src)) images.push(src)
  })

  const normalizedImages = normalizeImages(images)

  const specs = {}
  $('table tr').each((_, tr) => {
    const cells = $(tr).find('th,td')
    if (cells.length >= 2) {
      const key = cleanText($(cells[0]).text())
      const value = cleanText($(cells[1]).text())
      if (key && value && key.length <= 120 && value.length <= 500) {
        specs[key] = value
      }
    }
  })

  const subcategory = subcategoryFromCode(base.code)
  const tags = ['Kangren', CATEGORY_NAME, subcategory].filter(Boolean)

  return {
    name: title || base.name || `Kangren Product ${base.showId || ''}`,
    description,
    category: CATEGORY_NAME,
    subcategory,
    image: normalizedImages[0] || cleanText(base.image),
    images: normalizedImages,
    specifications: Object.keys(specs).length ? specs : undefined,
    tags: Array.from(new Set(tags)),
  }
}

async function crawlAllListPages() {
  const queue = [START_URL]
  const seenPages = new Set()
  const byDetail = new Map()

  while (queue.length) {
    const url = queue.shift()
    if (!url || seenPages.has(url)) continue
    seenPages.add(url)

    console.log(`List page: ${url}`)
    const $ = await fetchPage(url)
    const { detailItems, listPages } = extractFromListPage($, url)

    for (const item of detailItems) {
      byDetail.set(item.detailUrl, item)
    }

    for (const listPage of listPages) {
      if (!seenPages.has(listPage)) queue.push(listPage)
    }
  }

  return {
    listPageCount: seenPages.size,
    detailItems: Array.from(byDetail.values()),
  }
}

async function seedProducts(detailItems) {
  let created = 0
  let updated = 0
  let failed = 0

  for (let i = 0; i < detailItems.length; i += 1) {
    const base = detailItems[i]

    try {
      console.log(`Detail ${i + 1}/${detailItems.length}: ${base.detailUrl}`)
      const $ = await fetchPage(base.detailUrl)
      const detail = extractDetail($, base)

      const stableSlug = `kangren-${base.code || 'general'}-${base.showId || i}`

      await ensureCategory(detail.category)

      const doc = {
        name: detail.name,
        description: detail.description,
        category: detail.category,
        subcategory: detail.subcategory,
        price: 0,
        stock: 100,
        inStock: true,
        image: detail.image,
        images: detail.images,
        specifications: detail.specifications,
        tags: detail.tags,
        manufacturerInfo: MANUFACTURER,
        slug: stableSlug,
        searchText: '',
        updatedAt: new Date(),
      }

      doc.searchText = buildSearchText(doc)

      const existing = await Product.findOne({ slug: stableSlug })

      await Product.findOneAndUpdate(
        { slug: stableSlug },
        {
          $set: doc,
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true, new: true }
      )

      if (existing) updated += 1
      else created += 1

      await new Promise((resolve) => setTimeout(resolve, 120))
    } catch (err) {
      failed += 1
      console.error(`Failed ${base.detailUrl}:`, err.message)
    }
  }

  return { created, updated, failed }
}

async function run() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set in server/.env')

  console.log('Connecting to MongoDB...')
  await mongoose.connect(uri)
  console.log('MongoDB connected')

  try {
    const { listPageCount, detailItems } = await crawlAllListPages()
    console.log(`Discovered ${listPageCount} product list pages and ${detailItems.length} unique detail products`)

    if (!detailItems.length) {
      throw new Error('No products discovered from Kangren list pages')
    }

    const result = await seedProducts(detailItems)
    console.log('Import complete:', result)

    const count = await Product.countDocuments({ manufacturerInfo: /Kangren/i })
    console.log(`Database now has ${count} Kangren products`)
  } finally {
    await mongoose.disconnect()
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
