import axios from 'axios'
import * as cheerio from 'cheerio'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import path from 'path'
import { fileURLToPath } from 'url'

import Product from '../models/Product.js'
import Category from '../models/Category.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const SERVER_DIR = path.resolve(__dirname, '..')

dotenv.config({ path: path.join(SERVER_DIR, '.env') })

const BASE_URL = 'https://www.bestreatkit.com'
const CATEGORY_SOURCES = [
  { name: 'First Aid', url: `${BASE_URL}/supplier-4788237-first-aid` },
  { name: 'Wound Care', url: `${BASE_URL}/supplier-4788270-wound-care` },
]

const IMG_RE = /^https?:\/\/img\.bestreatkit\.com\/photo\//i
const BESTREAT_LEAD_RE = /\/photo\/py/i
const BESTREAT_THUMB_RE = /\/photo\/pt/i
const LOGO_RE = /logo\.gif|load_icon\.gif|favicon|sprite|logo/i

function absUrl(url) {
  if (!url) return ''
  const v = String(url).trim()
  if (!v) return ''
  if (v.startsWith('http://') || v.startsWith('https://')) return v
  if (v.startsWith('//')) return `https:${v}`
  if (v.startsWith('/')) return `${BASE_URL}${v}`
  return `${BASE_URL}/${v.replace(/^\/+/, '')}`
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

function upgradeImage(url) {
  let v = cleanText(url)
  if (!v) return ''
  v = absUrl(v)
  if (!v) return ''
  if (BESTREAT_LEAD_RE.test(v)) {
    v = v.replace('/photo/py', '/photo/ps')
  }
  if (BESTREAT_THUMB_RE.test(v)) {
    v = v.replace('/photo/pt', '/photo/ps')
  }
  return v
}

function isValidImage(url) {
  const v = cleanText(url)
  if (!v) return false
  if (v.startsWith('data:image')) return false
  if (LOGO_RE.test(v)) return false
  if (!IMG_RE.test(v) && !v.includes('/photo/')) return false
  return true
}

function extractTitleFromAnchor($, el) {
  const anchor = $(el)
  const direct = cleanText(anchor.text())
  if (direct && !/^chat now$/i.test(direct)) return direct

  const parentText = cleanText(anchor.parent().text())
  if (parentText && parentText.length > 10) return parentText

  const prev = cleanText(anchor.prev().text())
  if (prev && prev.length > 10) return prev

  return ''
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

function extractListing($, sourceUrl, categoryName) {
  const products = []
  const seen = new Set()
  const cardSelector = 'div.item_p_box, .item_p_box, .product-item, .item, .pro-item'

  $(cardSelector).each((_, cardEl) => {
    const card = $(cardEl)
    const titleAnchor = card.find('h2 a[href*="/sale-"]').first().length
      ? card.find('h2 a[href*="/sale-"]').first()
      : card.find('a[href*="/sale-"]').first()

    const href = absUrl(titleAnchor.attr('href') || '')
    if (!href || seen.has(href)) return
    seen.add(href)

    const name = cleanText(titleAnchor.text() || titleAnchor.attr('title') || '')
    if (!name || name.length < 6) return

    const img = card.find('img').first()
    const thumb = upgradeImage(img.attr('data-original') || img.attr('data-src') || img.attr('src') || '')

    products.push({
      sourceUrl,
      detailUrl: href,
      name,
      image: thumb,
      category: categoryName,
    })
  })

  const nextPages = []
  $('a[href]').each((_, el) => {
    const href = absUrl($(el).attr('href') || '')
    if (!href) return
    const base = categoryName === 'First Aid' ? 'supplier-4788237' : 'supplier-4788270'
    if (!href.includes(base)) return
    if (/p\d+/i.test(href) || /page=\d+/i.test(href) || /-first-aid$/i.test(href) || /-wound-care$/i.test(href)) {
      if (!nextPages.includes(href)) nextPages.push(href)
    }
  })

  return { products, nextPages }
}

function extractDetail($, fallback) {
  const title = cleanText(
    $('meta[property="og:title"]').attr('content') ||
      $('h1').first().text() ||
      $('title').first().text() ||
      fallback.name ||
      ''
  )

  const metaDescription = cleanText(
    $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      ''
  )

  const descriptionCandidates = [
    metaDescription,
    $('.detail-info').text(),
    $('.product-description').text(),
    $('.content').text(),
    $('body').text(),
  ]

  let description = cleanText(descriptionCandidates.find((t) => cleanText(t).length > 80) || '')
  if (description.length > 5000) description = description.slice(0, 5000)

  const ogImage = upgradeImage($('meta[property="og:image"]').attr('content') || '')
  const images = []

  $('img').each((_, img) => {
    const src = upgradeImage(
      $(img).attr('data-src') || $(img).attr('src') || $(img).attr('data-original') || ''
    )
    if (!isValidImage(src)) return
    images.push(src)
  })

  const filtered = Array.from(new Set(images.filter(isValidImage)))
  const photoImages = filtered.filter((src) => /\/photo\//i.test(src))
  const normalizedImages = Array.from(new Set([ogImage, ...photoImages, ...filtered].filter(Boolean)))

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

  const tags = ['Bestreat', fallback.category, 'First Aid Supplier'].filter(Boolean)

  return {
    name: title || fallback.name,
    description: description || title || fallback.name,
    category: fallback.category,
    image: normalizedImages[0] || ogImage || fallback.image || '',
    images: normalizedImages.slice(0, 12),
    specifications: Object.keys(specs).length ? specs : undefined,
    tags: Array.from(new Set(tags)),
  }
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

async function crawlSeed(seed) {
  const queue = [seed.url]
  const seenPages = new Set()
  const byDetail = new Map()

  while (queue.length) {
    const url = queue.shift()
    if (!url || seenPages.has(url)) continue
    seenPages.add(url)

    console.log(`Listing page [${seed.name}]: ${url}`)
    const $ = await fetchPage(url)
    const { products, nextPages } = extractListing($, url, seed.name)

    for (const product of products) {
      byDetail.set(product.detailUrl, { ...product, category: seed.name })
    }

    for (const next of nextPages) {
      if (!seenPages.has(next)) queue.push(next)
    }
  }

  return Array.from(byDetail.values())
}

async function importProducts(listItems) {
  let created = 0
  let updated = 0
  let failed = 0

  for (let i = 0; i < listItems.length; i += 1) {
    const base = listItems[i]
    try {
      console.log(`Detail ${i + 1}/${listItems.length}: ${base.detailUrl}`)
      const $ = await fetchPage(base.detailUrl)
      const detail = extractDetail($, base)
      const slug = slugify(`bestreat-${detail.category}-${detail.name}`) || slugify(base.detailUrl)

      await ensureCategory(detail.category)

      const doc = {
        name: detail.name,
        description: detail.description,
        category: detail.category,
        subcategory: detail.category,
        price: 0,
        stock: 100,
        inStock: true,
        image: detail.image,
        images: detail.images,
        specifications: detail.specifications,
        tags: detail.tags,
        searchText: '',
        slug,
        manufacturerInfo: 'Bestreat Safety First Aid Solution Co.,Ltd',
        updatedAt: new Date(),
      }

      doc.searchText = cleanText([
        doc.name,
        doc.description,
        doc.category,
        doc.subcategory,
        ...(Array.isArray(doc.tags) ? doc.tags : []),
        doc.specifications && typeof doc.specifications === 'object'
          ? Object.entries(doc.specifications).map(([k, v]) => `${k} ${v}`).join(' ')
          : '',
      ].join(' '))

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

      await new Promise((resolve) => setTimeout(resolve, 200))
    } catch (err) {
      failed += 1
      console.error(`Failed ${base.detailUrl}:`, err.message)
    }
  }

  return { created, updated, failed }
}

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set in server/.env')

  console.log('Connecting to MongoDB...')
  await mongoose.connect(uri)
  console.log('MongoDB connected')

  try {
    const discovered = []
    for (const seed of CATEGORY_SOURCES) {
      const items = await crawlSeed(seed)
      console.log(`Discovered ${items.length} items in ${seed.name}`)
      discovered.push(...items)
    }

    const unique = Array.from(new Map(discovered.map((p) => [p.detailUrl, p])).values())
    console.log(`Unique products discovered: ${unique.length}`)

    const result = await importProducts(unique)
    console.log('Import complete:', result)

    for (const seed of CATEGORY_SOURCES) {
      const count = await Product.countDocuments({ category: seed.name })
      console.log(`Category ${seed.name}: ${count} products`)
    }
  } finally {
    await mongoose.disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
