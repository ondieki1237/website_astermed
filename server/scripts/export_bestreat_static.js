import axios from 'axios'
import * as cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const SERVER_DIR = path.resolve(__dirname, '..')
const OUT_DIR = path.resolve(SERVER_DIR, '..', 'data')

const BASE_URL = 'https://www.bestreatkit.com'
const CATEGORY_SOURCES = [
  { name: 'First Aid', url: `${BASE_URL}/supplier-4788237-first-aid` },
  { name: 'Wound Care', url: `${BASE_URL}/supplier-4788270-wound-care` },
]

const IMG_RE = /^https?:\/\/img\.bestreatkit\.com\/photo\//i
const LOGO_RE = /logo\.gif|load_icon\.gif|favicon|sprite|logo/i

function cleanText(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/\u00A0/g, ' ')
    .trim()
}

function absUrl(url) {
  if (!url) return ''
  const v = cleanText(url)
  if (!v) return ''
  if (v.startsWith('http://') || v.startsWith('https://')) return v
  if (v.startsWith('//')) return `https:${v}`
  if (v.startsWith('/')) return `${BASE_URL}${v}`
  return `${BASE_URL}/${v.replace(/^\/+/, '')}`
}

function upgradeImage(url) {
  let v = absUrl(url)
  if (!v) return ''
  if (v.includes('/photo/py')) v = v.replace('/photo/py', '/photo/ps')
  if (v.includes('/photo/pt')) v = v.replace('/photo/pt', '/photo/ps')
  return v
}

function isValidImage(url) {
  const v = cleanText(url)
  if (!v) return false
  if (v.startsWith('data:image')) return false
  if (LOGO_RE.test(v)) return false
  return IMG_RE.test(v) || v.includes('/photo/')
}

function extractListing($, categoryName) {
  const items = []
  const seen = new Set()
  const cardSelector = 'div.item_p_box, .item_p_box'

  $(cardSelector).each((_, el) => {
    const card = $(el)
    const anchor = card.find('h2 a[href*="/sale-"]').first().length
      ? card.find('h2 a[href*="/sale-"]').first()
      : card.find('a[href*="/sale-"]').first()

    const href = absUrl(anchor.attr('href') || '')
    const name = cleanText(anchor.text() || anchor.attr('title') || '')
    if (!href || !name || seen.has(href)) return
    seen.add(href)

    const img = card.find('img').first()
    const image = upgradeImage(img.attr('data-original') || img.attr('src') || img.attr('data-src') || '')

    items.push({ detailUrl: href, name, image, category: categoryName })
  })

  const nextPages = []
  $('a[href]').each((_, el) => {
    const href = absUrl($(el).attr('href') || '')
    if (!href) return
    const base = categoryName === 'First Aid' ? 'supplier-4788237' : 'supplier-4788270'
    if (!href.includes(base)) return
    if (/p\d+/i.test(href) || /page=\d+/i.test(href)) {
      if (!nextPages.includes(href)) nextPages.push(href)
    }
  })

  return { items, nextPages }
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

function extractDetail($, fallback) {
  const title = cleanText(
    $('meta[property="og:title"]').attr('content') ||
      $('h1').first().text() ||
      $('title').first().text() ||
      fallback.name ||
      ''
  )

  const descriptionCandidates = [
    cleanText($('meta[property="og:description"]').attr('content') || ''),
    cleanText($('meta[name="description"]').attr('content') || ''),
    cleanText($('.detail-info').text()),
    cleanText($('.product-description').text()),
    cleanText($('.content').text()),
  ]

  const asciiDescription = descriptionCandidates.find((t) => t && t.length > 40) || ''
  const description = asciiDescription
    ? `High-quality ${title || fallback.name} from Bestreat.`
    : `High-quality ${title || fallback.name} from Bestreat.`

  const ogImage = upgradeImage($('meta[property="og:image"]').attr('content') || '')
  const images = []
  $('img').each((_, img) => {
    const src = upgradeImage(
      $(img).attr('data-original') || $(img).attr('data-src') || $(img).attr('src') || ''
    )
    if (!isValidImage(src)) return
    if (!images.includes(src)) images.push(src)
  })

  const filteredImages = images.filter((src) => !/cs208157705-bestreat_safety_first_aid_solution_co_ltd\.jpg/i.test(src))
  const normalizedImages = Array.from(new Set([ogImage, ...filteredImages].filter(Boolean)))

  const name = title || fallback.name
  const slug = `bestreat-${fallback.category.toLowerCase().replace(/\s+/g, '-')}-${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')}`

  const specs = {}
  $('table tr').each((_, tr) => {
    const cells = $(tr).find('th,td')
    if (cells.length >= 2) {
      const key = cleanText($(cells[0]).text())
      const value = cleanText($(cells[1]).text())
      if (key && value) specs[key] = value
    }
  })

  return {
    name,
    description,
    category: fallback.category,
    subcategory: fallback.category,
    image: normalizedImages[0] || fallback.image || '',
    images: normalizedImages.slice(0, 12),
    slug,
    specifications: Object.keys(specs).length ? specs : undefined,
    tags: ['Bestreat', fallback.category],
    manufacturerInfo: 'Bestreat Safety First Aid Solution Co.,Ltd',
    rating: 0,
    reviewCount: 0,
    views: 0,
    price: 0,
    stock: 100,
    inStock: true,
  }
}

async function crawlCategory(seed) {
  const seenPages = new Set()
  const queue = [seed.url]
  const byDetail = new Map()

  while (queue.length) {
    const url = queue.shift()
    if (!url || seenPages.has(url)) continue
    seenPages.add(url)
    console.log(`Listing page [${seed.name}]: ${url}`)
    const $ = await fetchPage(url)
    const { items, nextPages } = extractListing($, seed.name)

    for (const item of items) byDetail.set(item.detailUrl, item)
    for (const next of nextPages) if (!seenPages.has(next)) queue.push(next)
  }

  const details = []
  const listItems = Array.from(byDetail.values())
  for (let i = 0; i < listItems.length; i += 1) {
    const base = listItems[i]
    console.log(`Detail ${i + 1}/${listItems.length}: ${base.detailUrl}`)
    const $ = await fetchPage(base.detailUrl)
    details.push(extractDetail($, base))
    await new Promise((r) => setTimeout(r, 100))
  }

  return details
}

async function main() {
  const all = []
  for (const seed of CATEGORY_SOURCES) {
    const products = await crawlCategory(seed)
    console.log(`Crawled ${products.length} products for ${seed.name}`)
    all.push(...products)
  }

  const deduped = Array.from(new Map(all.map((p) => [p.slug, p])).values())
  const categories = Array.from(new Set(deduped.map((p) => p.category))).map((name) => ({
    name,
    count: deduped.filter((p) => p.category === name).length,
    subcategories: [],
  }))

  fs.mkdirSync(OUT_DIR, { recursive: true })
  fs.writeFileSync(path.join(OUT_DIR, 'bestreat-products.json'), JSON.stringify({ products: deduped, categories }, null, 2))
  console.log(`Wrote ${deduped.length} products to ${path.join(OUT_DIR, 'bestreat-products.json')}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
