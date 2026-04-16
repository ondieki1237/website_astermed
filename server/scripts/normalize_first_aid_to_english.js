import dotenv from 'dotenv'
import mongoose from 'mongoose'
import path from 'path'

import Product from '../models/Product.js'

dotenv.config({ path: './.env' })

const CATEGORY_NAME = 'First Aid'
const LOGO_PATTERNS = [
  /cs208157705-bestreat_safety_first_aid_solution_co_ltd\.jpg/i,
  /logo\.gif/i,
  /load_icon\.gif/i,
  /favicon/i,
]

function cleanText(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/\u00A0/g, ' ')
    .trim()
}

function hasNonLatin(text) {
  return /[\u0400-\u04FF\u0370-\u03FF\u3040-\u30FF\uAC00-\uD7AF\u4E00-\u9FFF]/.test(String(text || ''))
}

function titleCase(text) {
  return cleanText(text)
    .toLowerCase()
    .replace(/\b\w/g, (m) => m.toUpperCase())
    .replace(/\bMdr\b/g, 'MDR')
    .replace(/\bDin\b/g, 'DIN')
    .replace(/\bDin(\d+)/gi, 'DIN$1')
    .replace(/\bIso\b/g, 'ISO')
    .replace(/\bCe\b/g, 'CE')
    .replace(/\bPp\b/g, 'PP')
    .replace(/\bXl\b/g, 'XL')
    .replace(/\bXxl\b/g, 'XXL')
    .replace(/\bXxxl\b/g, 'XXXL')
    .replace(/\bHi Vis\b/g, 'Hi Vis')
}

function isLogo(url) {
  const v = cleanText(url)
  if (!v) return false
  return LOGO_PATTERNS.some((re) => re.test(v))
}

function getBestImage(product) {
  const candidates = [
    ...(Array.isArray(product.images) ? product.images : []),
    product.image,
  ]
    .map(cleanText)
    .filter(Boolean)
    .filter((src) => !isLogo(src))

  const deduped = Array.from(new Set(candidates))
  return deduped
}

function extractTitleFromFilename(url) {
  const raw = cleanText(url)
  if (!raw) return ''
  const file = raw.split('/').pop() || ''
  const stem = file.replace(/\.[a-z0-9]+$/i, '')
    .replace(/^p[ystc]?\d+-?/i, '')
    .replace(/^\d+-?/i, '')
  const text = stem
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const words = text
    .split(' ')
    .filter(Boolean)
    .filter((w) => !['bestreat', 'photo', 'img', 'quality', 'factory', 'china', 'hubei', 'co', 'ltd'].includes(w.toLowerCase()))

  return titleCase(words.join(' '))
}

function normalizeName(product) {
  const fromImage = extractTitleFromFilename(getBestImage(product)[0] || '')
  const original = cleanText(product.name)

  if (fromImage) return fromImage

  const cleaned = original
    .replace(/\s+/g, ' ')
    .replace(/\b(quality|factory|from|the)\b/gi, '')
    .replace(/\b(ce|iso|mdr|din|pp|xl|xxl|xxxl)\b/gi, (m) => m.toUpperCase())

  return titleCase(cleaned || original)
}

function normalizeDescription(product, name) {
  return `High-quality ${name || 'First Aid product'} from Bestreat.`
}

function rebuildSearchText(doc) {
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

function score(doc) {
  const reviews = Number(doc.reviewCount || 0)
  const views = Number(doc.views || 0)
  const rating = Number(doc.rating || 0)
  const imageCount = Array.isArray(doc.images) ? doc.images.length : 0
  const created = doc.createdAt ? new Date(doc.createdAt).getTime() : 0
  return (reviews * 1_000_000) + (views * 1_000) + (rating * 100) + (imageCount * 10) + created
}

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set in server/.env')

  console.log('Connecting to MongoDB...')
  await mongoose.connect(uri)
  console.log('MongoDB connected')

  const docs = await Product.find({ category: CATEGORY_NAME }).lean()
  console.log(`Loaded ${docs.length} First Aid products`)

  const updates = []
  for (const doc of docs) {
    const images = getBestImage(doc)
    const name = normalizeName(doc)
    const description = normalizeDescription(doc, name)
    const slug = `bestreat-first-aid-${cleanText(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`

    const next = {
      name,
      description,
      category: CATEGORY_NAME,
      subcategory: doc.subcategory && !hasNonLatin(doc.subcategory) ? titleCase(doc.subcategory) : CATEGORY_NAME,
      image: images[0] || doc.image || '',
      images,
      slug,
      searchText: '',
      updatedAt: new Date(),
    }
    next.searchText = rebuildSearchText({ ...doc, ...next })
    updates.push({ id: doc._id, next })
  }

  let changed = 0
  for (const item of updates) {
    await Product.updateOne({ _id: item.id }, { $set: item.next })
    changed += 1
  }

  const normalized = await Product.find({ category: CATEGORY_NAME }).lean()
  const ranked = normalized
    .sort((a, b) => {
      const diff = score(b) - score(a)
      if (diff !== 0) return diff
      return String(a.name || '').localeCompare(String(b.name || ''))
    })

  const keep = ranked.slice(0, 70)
  const keepIds = new Set(keep.map((d) => String(d._id)))
  const removeIds = ranked.filter((d) => !keepIds.has(String(d._id))).map((d) => d._id)

  if (removeIds.length) {
    await Product.deleteMany({ _id: { $in: removeIds } })
  }

  const finalCount = await Product.countDocuments({ category: CATEGORY_NAME })
  const sample = await Product.find({ category: CATEGORY_NAME }).select('name description image images slug').limit(5).lean()

  console.log({ changed, removed: removeIds.length, finalCount })
  console.log(JSON.stringify(sample, null, 2))

  await mongoose.disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
