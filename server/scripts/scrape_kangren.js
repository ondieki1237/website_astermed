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
const SUBCATEGORY_NAME = 'Emergency Skills Training Models'
const MANUFACTURER = 'Shanghai Kangren Medical Science Instrument Equipment Co.Ltd'
const KNOWN_LEAD_IMAGE_PATTERNS = [/d2a6d3b943ac886\.jpg/i]

const TRANSLATIONS = {
  'kangren-disposable-cpr-training-barrier-face-shield-50-pcsbox': {
    description: 'Disposable CPR training barrier face shield (50 pcs/box).',
  },
  'kangren-cpr-compression-board': {
    description: 'CPR compression board.',
  },
  '口腔护理（高级成人护理及CPR模拟人）': {
    name: 'Oral Care (Advanced Adult Nursing and CPR Training Manikin)',
    description:
      'Product features: the manikin can lie supine with the knees bent, and after the legs are abducted it can support itself independently. The upper arms and calves rotate freely. This comprehensive nursing and first-aid manikin is 170 cm tall, has blinking eyes, flexible joints, and supports multiple training positions.',
  },
  '高级全功能老年护理人（男性）': {
    name: 'Advanced Full-Function Elderly Care Manikin (Male)',
    description: 'Advanced full-function elderly care manikin (male).',
  },
  '高级全功能老年护理人（女性）': {
    name: 'Advanced Full-Function Elderly Care Manikin (Female)',
    description: 'Advanced full-function elderly care manikin (female).',
  },
  '闭合式四肢骨折固定训练模型': {
    name: 'Closed Limb Fracture Fixation Training Model',
    description: 'Closed limb fracture fixation training model.',
  },
  '高级透明洗胃模型': {
    name: 'Advanced Transparent Gastric Lavage Model',
    description: 'Advanced transparent gastric lavage model.',
  },
  '高级鼻饲管与气管护理模型': {
    name: 'Advanced Nasogastric Tube and Tracheal Care Model',
    description: 'Advanced nasogastric tube and tracheal care model.',
  },
  '高级基础护理实习操作模型': {
    name: 'Advanced Basic Nursing Practice Model',
    description: 'Advanced basic nursing practice model.',
  },
  '高级鼻胃管与气管护理模型': {
    name: 'Advanced Nasogastric and Tracheal Care Model',
    description: 'Advanced nasogastric and tracheal care model.',
  },
  '多功能透明洗胃训练模型': {
    name: 'Multifunctional Transparent Gastric Lavage Training Model',
    description:
      'This model simulates the upper body structure of an adult male. The anatomy includes the nasal cavity, mouth, teeth, tongue, uvula, epiglottis, vocal cords, trachea, bronchi, lungs, esophagus, stomach, liver, and small intestine. It is made of imported materials with a realistic feel, and the stomach section is made of high-strength transparent material for easy observation.',
  },
  '高级吞咽机制模型': {
    name: 'Advanced Swallowing Mechanism Model',
    description: 'Advanced swallowing mechanism model.',
  },
  '高级吸痰练习模型': {
    name: 'Advanced Suctioning Practice Model',
    description: 'Advanced suctioning practice model.',
  },
  '高级肠外营养护理模型': {
    name: 'Advanced Parenteral Nutrition Care Model',
    description: 'Advanced parenteral nutrition care model.',
  },
  '胸椎模型': {
    name: 'Thoracic Spine Model',
    description: 'Thoracic spine model.',
  },
  '颈椎模型': {
    name: 'Cervical Spine Model',
    description: 'Cervical spine model.',
  },
  '脊椎模型（可弯曲）': {
    name: 'Flexible Spine Model',
    description: 'Flexible spine model.',
  },
  '脊椎带骨盆附半腿骨模型（不可弯曲/可弯曲）': {
    name: 'Spine with Pelvis and Half Leg Bone Model (Rigid/Flexible)',
    description: 'Spine with pelvis and half leg bone model (rigid/flexible).',
  },
  '脊椎带骨盆模型（不可弯曲/可弯曲）': {
    name: 'Spine with Pelvis Model (Rigid/Flexible)',
    description: 'Spine with pelvis model (rigid/flexible).',
  },
  '全身骨骼半边肌肉着色模型': {
    name: 'Full Body Skeleton Model with One-Side Muscle Coloring',
    description: 'Full body skeleton model with one-side muscle coloring.',
  },
  '全身骨骼半边肌肉着色附韧带模型': {
    name: 'Full Body Skeleton Model with One-Side Muscle Coloring and Ligaments',
    description: 'Full body skeleton model with one-side muscle coloring and ligaments.',
  },
  '全身骨骼85cm附血管神经模型': {
    name: '85 cm Full Body Skeleton Model with Blood Vessels and Nerves',
    description: '85 cm full body skeleton model with blood vessels and nerves.',
  },
  '一次性CPR训练屏障消毒面膜（50张/盒）': {
    name: 'Disposable CPR Training Barrier Face Shield (50 pcs/box)',
    description: 'Disposable CPR training barrier face shield (50 pcs/box).',
  },
  'CPR按压板': {
    name: 'CPR Compression Board',
    description: 'CPR compression board.',
  },
}
const MAX_PRODUCTS = 30

const INCLUDE_RE = /(manikin|cpr|training vest|training combination|compression board|face shield)/i
const EXCLUDE_RE = /(defibrillator|aed|wound assessment|module|digital training system|simulation|simulator|equipment)/i

const SUBCATEGORY_LABEL_MAP = {
  '急救专业技能训练模型': 'Emergency Skills Training Models',
  '护理专业技能训练模型': 'Nursing Skills Training Models',
  '临床综合专科技能训练模型': 'Clinical Comprehensive Specialty Training Models',
  '妇幼专科技能训练模型': 'Maternal and Child Specialty Training Models',
  '临床诊断专业技能训练模型': 'Clinical Diagnostic Skills Training Models',
  '医学多媒体系列': 'Medical Multimedia Series',
  '虚拟医学技能训练系统': 'Virtual Medical Skills Training Systems',
  '高级人体解剖医学训练模型': 'Advanced Human Anatomy Medical Training Models',
  '中医专科医学训练模型': 'Traditional Chinese Medicine Training Models',
  '医学急救培训器材': 'Medical Emergency Training Equipment',
  '口腔专科医学训练模型': 'Oral Specialty Medical Training Models',
  '医学彩色教学挂图及软件': 'Medical Teaching Charts and Software',
}

const SUBCATEGORY_CODE_MAP = {
  jjzy: 'Emergency Skills Training Models',
  hlzy: 'Nursing Skills Training Models',
  lczh: 'Clinical Comprehensive Specialty Training Models',
  fyzk: 'Maternal and Child Specialty Training Models',
  lczd: 'Clinical Diagnostic Skills Training Models',
  yxdmt: 'Medical Multimedia Series',
  xnyx: 'Virtual Medical Skills Training Systems',
  gjrt: 'Advanced Human Anatomy Medical Training Models',
  zyzk: 'Traditional Chinese Medicine Training Models',
  yxjj: 'Medical Emergency Training Equipment',
  kqzk: 'Oral Specialty Medical Training Models',
  yxcs: 'Medical Teaching Charts and Software',
}

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
  return TRANSLATIONS[text]?.name || text
}

function translateKnownChineseDescription(name, description) {
  const text = cleanText(name)
  const mapped = TRANSLATIONS[text]
  if (mapped?.description) return mapped.description
  return cleanText(description)
}

function toEnglishSubcategory(raw) {
  const text = cleanText(raw)
  if (!text) return SUBCATEGORY_NAME
  return SUBCATEGORY_LABEL_MAP[text] || text
}

function subcategoryFromUrl(detailUrl, breadcrumbText) {
  const codeMatch = String(detailUrl || '').match(/\/products\/([a-z0-9]+)\//i)
  if (codeMatch && codeMatch[1]) {
    const code = codeMatch[1].toLowerCase()
    if (SUBCATEGORY_CODE_MAP[code]) return SUBCATEGORY_CODE_MAP[code]
  }
  return toEnglishSubcategory(breadcrumbText)
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

  $('a[href*="/products/"][href*="/show"]').each((_, el) => {
    const anchor = $(el)
    const href = absUrl(anchor.attr('href') || '')
    const title = cleanText(anchor.text() || anchor.attr('title') || '')
    if (!href || !/\/products\/[^/]+\/show\d+\.html$/i.test(href)) return
    if (seen.has(href)) return
    seen.add(href)

    if (!isManikinTitle(title)) return

    const img = anchor.find('img').first().length
      ? anchor.find('img').first()
      : anchor.closest('li,div').find('img').first()
    const image = absUrl(img.attr('data-original') || img.attr('src') || '')

    items.push({
      sourceUrl,
      detailUrl: href,
      name: title,
      image,
    })
  })

  const nextPages = []
  $('a[href*="/products/list"], a[href*="/products/"][href*="/list"], a[href^="/products/"]').each((_, el) => {
    const href = absUrl($(el).attr('href') || '')
    if (!href) return
    if (!/\/products\/(list\d+\.html|[a-z0-9]+\/?|[a-z0-9]+\/list\d+\.html)$/i.test(href)) return
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
  const breadcrumbCategory = cleanText($('.site a, .bread a, .crumb a, .breadcrumb a').last().text())
  const category = CATEGORY_NAME
  const subcategory = subcategoryFromUrl(fallback.detailUrl, breadcrumbCategory || breadcrumb)

  const descriptionCandidates = [
    $('.pro-main .content').text(),
    $('.pro-main .editor').text(),
    $('.pro-main .page-editor').text(),
    $('.pro-main').text(),
    $('meta[name="description"]').attr('content') || '',
  ]

  let description = cleanText(descriptionCandidates.find((t) => cleanText(t).length > 60) || '')
  description = translateKnownChineseDescription(title || fallback.name, description)
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

async function keepTopRatedProducts(limit = MAX_PRODUCTS) {
  const ranked = await Product.find({
    category: CATEGORY_NAME,
    manufacturerInfo: /Kangren/i,
  })
    .sort({ rating: -1, reviewCount: -1, views: -1, updatedAt: -1, _id: 1 })
    .select('_id')
    .lean()

  const keepIds = ranked.slice(0, limit).map((doc) => doc._id)
  const removeIds = ranked.slice(limit).map((doc) => doc._id)

  if (!removeIds.length) return { kept: keepIds.length, removed: 0 }

  const result = await Product.deleteMany({ _id: { $in: removeIds } })
  return { kept: keepIds.length, removed: result.deletedCount || 0 }
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

    const topResult = await keepTopRatedProducts(MAX_PRODUCTS)
    const count = await Product.countDocuments({ category: CATEGORY_NAME, manufacturerInfo: /Kangren/i })
    console.log('Top products enforcement:', topResult)
    console.log(`Database now has ${count} Kangren products in category "${CATEGORY_NAME}"`)
  } finally {
    await mongoose.disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
