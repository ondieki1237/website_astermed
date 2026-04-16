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
const START_URL = `${BASE_URL}/products/jjzy/`
const CATEGORY_NAME = 'Training Materials'
const SUBCATEGORY_NAME = 'Emergency Skills Training Models'
const MANUFACTURER = 'Shanghai Kangren Medical Science Instrument Equipment Co.Ltd'
const KNOWN_LEAD_IMAGE_PATTERNS = [/d2a6d3b943ac886\.jpg/i]

const INCLUDE_RE = /(manikin|cpr|training vest|training combination)/i
const EXCLUDE_RE = /(defibrillator|aed|wound assessment|module|digital training system|simulation|simulator|equipment)/i

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

function slugify(input) {
  return cleanText(input)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
}

function translateKnownChineseName(name) {
  const text = cleanText(name)
  const map = {
    'CPR按压板': 'CPR Compression Board',
    '一次性CPR训练屏障消毒面膜（50张/盒）': 'Disposable CPR Training Barrier Face Shield (50 pcs/box)',
  }
  return map[text] || text
}

function isKnownLeadImage(url) {
  const value = String(url || '').trim()
  if (!value) return false
  return KNOWN_LEAD_IMAGE_PATTERNS.some((pattern) => pattern.test(value))
}

function normalizeImageList(images) {
  const cleaned = Array.from(
    new Set(
      (images || [])
        .map((img) => cleanText(img))
        .filter(Boolean)
    )
  )

  if (!cleaned.length) return []

  let normalized = [...cleaned]
  if (normalized.length > 1 && isKnownLeadImage(normalized[0])) {
    normalized = normalized.slice(1)
  }

  return normalized.slice(0, 12)
}

function isManikinTitle(title) {
  const text = cleanText(title)
  if (!text) return false
  return INCLUDE_RE.test(text) && !EXCLUDE_RE.test(text)
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

function extractListing($, sourceUrl) {
  const items = []
  const seen = new Set()

  $('a[href*="/products/jjzy/show"]').each((_, el) => {
    const anchor = $(el)
    const href = absUrl(anchor.attr('href') || '')
    const title = cleanText(anchor.text() || anchor.attr('title') || '')
    if (!href || !href.includes('/products/jjzy/show')) return
    if (seen.has(href)) return
    seen.add(href)

    if (!isManikinTitle(title)) return

    const img = anchor.find('img').first()
    const image = absUrl(img.attr('data-original') || img.attr('src') || '')

    items.push({
      sourceUrl,
      detailUrl: href,
      name: title,
      image,
    })
  })

  const nextPages = []
  $('a[href*="/products/jjzy/list"]').each((_, el) => {
    const href = absUrl($(el).attr('href') || '')
    if (!href) return
    if (!nextPages.includes(href)) nextPages.push(href)
  })

  return { items, nextPages }
}

function extractDetail($, fallback) {
  const title = cleanText(
    $('h1').first().text() ||
      $('meta[property="og:title"]').attr('content') ||
      fallback.name ||
      ''
  )

  const breadcrumb = cleanText($('.site,.bread,.crumb,.breadcrumb').text())
  const category = CATEGORY_NAME
  const subcategory = SUBCATEGORY_NAME || cleanText(breadcrumb)

  const descriptionCandidates = [
    $('.pro-main .content').text(),
    $('.pro-main .editor').text(),
    $('.pro-main .page-editor').text(),
    $('.pro-main').text(),
    $('meta[name="description"]').attr('content') || '',
  ]

  let description = cleanText(descriptionCandidates.find((t) => cleanText(t).length > 60) || '')
  if (!description) description = title || fallback.name || 'Training manikin.'
  if (description.length > 4000) description = description.slice(0, 4000)

  const images = []
  $('.pro-main img, .content img, img').each((_, img) => {
    const src = absUrl($(img).attr('data-original') || $(img).attr('src') || '')
    if (!src) return
    if (src.startsWith('data:image')) return
    if (/logo|icon|ewm|mewm|contact|s_so|ibanner|prolist/i.test(src)) return
    if (!images.includes(src)) images.push(src)
  })

  const specs = {}
  $('table tr').each((_, tr) => {
    const cells = $(tr).find('th,td')
    if (cells.length >= 2) {
      const key = cleanText($(cells[0]).text())
      const value = cleanText($(cells[1]).text())
      if (key && value && key.length < 120 && value.length < 500) {
        specs[key] = value
      }
    }
  })

  const normalizedImages = normalizeImageList(images)
  const translatedTitle = translateKnownChineseName(title || fallback.name)
  const tags = ['Kangren', CATEGORY_NAME, subcategory].filter(Boolean)

  return {
    name: translatedTitle,
    description,
    category,
    subcategory,
    image: normalizedImages[0] || cleanText(fallback.image) || '',
    images: normalizedImages,
    specifications: Object.keys(specs).length ? specs : undefined,
    tags: Array.from(new Set(tags)),
  }
}

async function crawlListingPages() {
  const queue = [START_URL]
  const seen = new Set()
  const byDetail = new Map()

  while (queue.length) {
    const url = queue.shift()
    if (!url || seen.has(url)) continue
    seen.add(url)

    console.log(`Listing: ${url}`)
    const $ = await fetchPage(url)
    const { items, nextPages } = extractListing($, url)

    for (const item of items) {
      byDetail.set(item.detailUrl, item)
    }

    for (const next of nextPages) {
      if (!seen.has(next)) queue.push(next)
    }
  }

  return Array.from(byDetail.values())
}

async function seedProducts(listItems) {
  let created = 0
  let updated = 0
  let skipped = 0
  let failed = 0

  for (let i = 0; i < listItems.length; i += 1) {
    const base = listItems[i]
    try {
      console.log(`Detail ${i + 1}/${listItems.length}: ${base.detailUrl}`)
      const $ = await fetchPage(base.detailUrl)
      const detail = extractDetail($, base)
      const slug = slugify(`kangren-${detail.name}`) || slugify(base.detailUrl)

      if (!detail.name || !isManikinTitle(detail.name)) {
        skipped += 1
        continue
      }

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
        searchText: '',
        slug,
        manufacturerInfo: MANUFACTURER,
        updatedAt: new Date(),
      }
      doc.searchText = buildSearchText(doc)

      const existing = await Product.findOne({ slug })
      await Product.findOneAndUpdate(
        { slug },
        {
          $set: doc,
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        { upsert: true, new: true }
      )

      if (existing) updated += 1
      else created += 1

      await new Promise((resolve) => setTimeout(resolve, 250))
    } catch (err) {
      failed += 1
      console.error(`Failed ${base.detailUrl}:`, err.message)
    }
  }

  return { created, updated, skipped, failed }
}

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set in server/.env')
  }

  console.log('Connecting to MongoDB...')
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('MongoDB connected')

  try {
    const listItems = await crawlListingPages()
    console.log(`Discovered ${listItems.length} manikin-related listing items`) 

    if (!listItems.length) {
      throw new Error('No matching manikin products found')
    }

    const result = await seedProducts(listItems)
    console.log('Import complete:', result)

    const count = await Product.countDocuments({ category: CATEGORY_NAME })
    console.log(`Database now has ${count} products in category "${CATEGORY_NAME}"`)
  } finally {
    await mongoose.disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
