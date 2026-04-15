import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import * as cheerio from 'cheerio'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

import Product from '../models/Product.js'
import Category from '../models/Category.js'

puppeteer.use(StealthPlugin())

const BASE_URL = 'https://www.vimeldental.com'
const START_URL = `${BASE_URL}/dental-materials.html`
const DEFAULT_CATEGORY = 'Dental Materials'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const SERVER_DIR = path.resolve(__dirname, '..')

dotenv.config({ path: path.join(SERVER_DIR, '.env') })

function absUrl(url) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('//')) return `https:${url}`
  if (url.startsWith('/')) return `${BASE_URL}${url}`
  return `${BASE_URL}/${url.replace(/^\/+/, '')}`
}

function cleanText(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/\u00A0/g, ' ')
    .trim()
}

function isPlaceholderLeadImage(url) {
  const v = String(url || '')
  if (!v) return false
  if (v.includes('a5454b1e584da4640a7c049a9b5d474f.png')) return true
  if (v.includes('image/resize,m_pad,h_100,w_138') && v.toLowerCase().endsWith('.png?x-oss-process=image/format,webp,image/resize,m_pad,h_100,w_138,color_FFFFFF&1')) return true
  return false
}

function normalizeVimelImageQuality(url) {
  let v = String(url || '')
  if (!v) return ''

  // Vimel image URLs often include low-res OSS resize parameters (h_120,w_120 or h_142,w_142).
  // Upgrade all collected variants to a consistent higher quality similar to the lead image.
  v = v.replace(/h_(100|120|142|250),w_(100|120|138|142|250)/g, 'h_460,w_460')
  return v
}

function slugFromUrl(url) {
  try {
    const pathname = new URL(url).pathname
    const file = pathname.split('/').pop() || ''
    return file.replace(/\.html?$/i, '').trim()
  } catch {
    return ''
  }
}

function extractListPage($, sourceUrl) {
  const products = []

  $('.pro-list .pro-item').each((_, el) => {
    const anchor = $(el).find('.item-title a').first()
    const href = absUrl(anchor.attr('href') || '')
    const name = cleanText(anchor.text() || anchor.attr('title') || '')

    const img = $(el).find('.item-pic img').first()
    const image = absUrl(img.attr('data-original') || img.attr('src') || '')

    if (!href || !name) return

    products.push({
      sourceUrl,
      detailUrl: href,
      name,
      image,
      category: DEFAULT_CATEGORY,
    })
  })

  const nextCandidates = [
    $('.pages-btn a.show_text.Next').attr('href'),
    $('.pages-btn a[title="next"]').attr('href'),
    $('link[rel="next"]').attr('href'),
  ]

  const nextHref = nextCandidates.find(Boolean)
  return {
    products,
    nextPage: nextHref ? absUrl(nextHref) : null,
  }
}

function extractDetailPage($, fallback) {
  const title = cleanText(
    $('h1').first().text() ||
      $('meta[property="og:title"]').attr('content') ||
      fallback.name ||
      ''
  )

  const breadcrumbLinks = $('.bread-href a')
  const breadcrumbCategory = cleanText(
    breadcrumbLinks.length >= 3 ? $(breadcrumbLinks[breadcrumbLinks.length - 1]).text() : ''
  )
  const category =
    cleanText(breadcrumbCategory).toLowerCase().includes('dental materials')
      ? DEFAULT_CATEGORY
      : fallback.category || DEFAULT_CATEGORY

  const descriptionCandidates = [
    $('.pro-main .editor').first().text(),
    $('.pro-main .page-editor').first().text(),
    $('.pro-main .pro-des').first().text(),
    $('meta[name="description"]').attr('content') || '',
  ]

  let description = cleanText(descriptionCandidates.find((t) => cleanText(t).length > 40) || '')
  if (!description) {
    description = `${title || fallback.name} imported from Vimel Dental.`
  }
  if (description.length > 3000) {
    description = description.slice(0, 3000)
  }

  const images = []
  $('.pro-main img, .item-pic img, .pro-slide img, img').each((_, img) => {
    const src = normalizeVimelImageQuality(
      absUrl($(img).attr('data-original') || $(img).attr('src') || '')
    )
    if (!src) return
    if (src.startsWith('data:image')) return
    if (src.includes('/static/images/youtube-default')) return
    if (src.includes('/index/common/verify/')) return
    if (!images.includes(src)) images.push(src)
  })

  const filteredImages = images.filter((src) => !isPlaceholderLeadImage(src))
  const prioritizedImages = filteredImages.length
    ? [
        ...filteredImages.filter((src) => src.includes('h_460,w_460')),
        ...filteredImages.filter((src) => !src.includes('h_460,w_460')),
      ]
    : []

  const normalizedImages = Array.from(new Set(prioritizedImages)).slice(0, 12)

  const tags = []
  $('.tags a, .tag a').each((_, a) => {
    const t = cleanText($(a).text())
    if (t && !tags.includes(t)) tags.push(t)
  })

  const specifications = {}

  $('table tr').each((_, tr) => {
    const cells = $(tr).find('th,td')
    if (cells.length >= 2) {
      const key = cleanText($(cells[0]).text())
      const value = cleanText($(cells[1]).text())
      if (key && value && key.length <= 120 && value.length <= 500) {
        specifications[key] = value
      }
    }
  })

  const textLines = cleanText($('.pro-main').text())
    .split(/(?<=:)|\n|\r/)
    .map((line) => cleanText(line))
    .filter(Boolean)

  for (const line of textLines) {
    const m = line.match(/^([A-Za-z0-9\-\s\/()]{2,60}):\s*(.{1,300})$/)
    if (!m) continue
    const key = cleanText(m[1])
    const value = cleanText(m[2])
    if (key && value && !specifications[key]) {
      specifications[key] = value
    }
  }

  return {
    name: title || fallback.name,
    category,
    description,
    image: normalizedImages[0] || fallback.image || '',
    images: normalizedImages,
    tags,
    specifications,
  }
}

function buildSearchText(doc) {
  const parts = []
  if (doc.name) parts.push(doc.name)
  if (doc.description) parts.push(doc.description)
  if (doc.category) parts.push(doc.category)
  if (doc.tags && Array.isArray(doc.tags)) parts.push(doc.tags.join(' '))
  if (doc.specifications && typeof doc.specifications === 'object') {
    parts.push(Object.entries(doc.specifications).map(([k, v]) => `${k} ${v}`).join(' '))
  }
  return cleanText(parts.join(' '))
}

async function ensureCategory(name) {
  const clean = cleanText(name || DEFAULT_CATEGORY)
  if (!clean) return
  await Category.findOneAndUpdate(
    { name: clean },
    { $setOnInsert: { name: clean } },
    { upsert: true, new: true }
  )
}

async function crawlListingPages(browser) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1366, height: 900 })
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  )

  const seenPages = new Set()
  const queue = [START_URL]
  const byDetail = new Map()

  while (queue.length) {
    const url = queue.shift()
    if (!url || seenPages.has(url)) continue
    seenPages.add(url)

    console.log(`Listing page: ${url}`)
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 })

    const html = await page.content()
    const $ = cheerio.load(html)
    const { products, nextPage } = extractListPage($, url)

    for (const product of products) {
      byDetail.set(product.detailUrl, product)
    }

    if (nextPage && !seenPages.has(nextPage)) {
      queue.push(nextPage)
    }
  }

  await page.close()
  return Array.from(byDetail.values())
}

async function seedProducts(browser, listProducts) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1366, height: 900 })
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  )

  let created = 0
  let updated = 0
  let failed = 0

  for (let index = 0; index < listProducts.length; index += 1) {
    const base = listProducts[index]
    try {
      console.log(`Detail ${index + 1}/${listProducts.length}: ${base.detailUrl}`)
      await page.goto(base.detailUrl, { waitUntil: 'networkidle2', timeout: 90000 })

      const html = await page.content()
      const $ = cheerio.load(html)
      const detail = extractDetailPage($, base)

      const slug = slugFromUrl(base.detailUrl) || cleanText(detail.name).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const category = cleanText(detail.category || DEFAULT_CATEGORY)

      await ensureCategory(category)

      const doc = {
        name: detail.name,
        description: detail.description,
        category,
        price: 0,
        stock: 100,
        inStock: true,
        image: detail.image,
        images: detail.images,
        specifications: Object.keys(detail.specifications || {}).length ? detail.specifications : undefined,
        tags: Array.from(new Set([...(detail.tags || []), DEFAULT_CATEGORY, 'Vimel Dental'])),
        slug,
        manufacturerInfo: 'Foshan Vimel Dental Equipment Co., Ltd',
        searchText: '',
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

  await page.close()
  return { created, updated, failed }
}

async function run() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set in server/.env')

  console.log('Connecting to MongoDB...')
  await mongoose.connect(uri)
  console.log('MongoDB connected')

  console.log('Launching browser...')
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const listProducts = await crawlListingPages(browser)
    console.log(`Discovered ${listProducts.length} listing products`)

    if (!listProducts.length) {
      throw new Error('No products discovered from listing pages')
    }

    const result = await seedProducts(browser, listProducts)
    console.log('Seeding complete:', result)

    const dbCount = await Product.countDocuments({ category: DEFAULT_CATEGORY })
    console.log(`Database currently has ${dbCount} products in category "${DEFAULT_CATEGORY}"`)
  } finally {
    await browser.close()
    await mongoose.disconnect()
  }
}

run().catch((err) => {
  console.error('Unhandled scraper error:', err)
  process.exit(1)
})
