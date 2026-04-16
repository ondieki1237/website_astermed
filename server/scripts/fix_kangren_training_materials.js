import dotenv from 'dotenv'
import mongoose from 'mongoose'

import Product from '../models/Product.js'

dotenv.config({ path: './.env' })

const CATEGORY_NAME = 'Training Materials'
const SUBCATEGORY_EN = 'Emergency Skills Training Models'
const KNOWN_LEAD_IMAGE_PATTERNS = [/d2a6d3b943ac886\.jpg/i]

function cleanText(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/\u00A0/g, ' ')
    .trim()
}

function translateKnownChineseName(name) {
  const value = cleanText(name)
  const map = {
    'CPR按压板': 'CPR Compression Board',
    '一次性CPR训练屏障消毒面膜（50张/盒）': 'Disposable CPR Training Barrier Face Shield (50 pcs/box)',
  }
  return map[value] || value
}

function containsChinese(value) {
  return /[\u3400-\u9FBF]/.test(String(value || ''))
}

function isKnownLeadImage(url) {
  const value = cleanText(url)
  if (!value) return false
  return KNOWN_LEAD_IMAGE_PATTERNS.some((pattern) => pattern.test(value))
}

function normalizeImages(images) {
  const deduped = Array.from(new Set((images || []).map((img) => cleanText(img)).filter(Boolean)))
  if (!deduped.length) return []

  let result = [...deduped]
  if (result.length > 1 && isKnownLeadImage(result[0])) {
    result = result.slice(1)
  }
  return result
}

function cleanDescription(description) {
  const value = cleanText(description)
  return cleanText(value.replace(/\s*imported from kangren\.?/gi, ''))
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

async function run() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set in server/.env')

  console.log('Connecting to MongoDB...')
  await mongoose.connect(uri)
  console.log('MongoDB connected')

  const query = {
    category: CATEGORY_NAME,
    manufacturerInfo: /Kangren/i,
  }

  const products = await Product.find(query)
  console.log(`Found ${products.length} products to normalize`) 

  let updated = 0
  let translatedNames = 0
  let translatedSubcategories = 0
  let descriptionsCleaned = 0
  let leadImagesRemoved = 0

  for (const product of products) {
    const originalName = cleanText(product.name)
    const translatedName = translateKnownChineseName(originalName)
    if (translatedName !== originalName) translatedNames += 1

    const originalSub = cleanText(product.subcategory)
    const nextSub = containsChinese(originalSub) || !originalSub ? SUBCATEGORY_EN : originalSub
    if (nextSub !== originalSub) translatedSubcategories += 1

    const originalDescription = cleanText(product.description)
    const nextDescription = cleanDescription(originalDescription)
    if (nextDescription !== originalDescription) descriptionsCleaned += 1

    const originalImages = Array.isArray(product.images) ? product.images : []
    const hadLeadImage = originalImages.length > 1 && isKnownLeadImage(originalImages[0])
    if (hadLeadImage) leadImagesRemoved += 1

    const nextImages = normalizeImages(originalImages)
    const nextImage = nextImages[0] || cleanText(product.image)

    product.name = translatedName
    product.subcategory = nextSub
    product.description = nextDescription || translatedName || product.description
    product.images = nextImages
    product.image = nextImage
    product.searchText = buildSearchText(product)
    product.updatedAt = new Date()

    await product.save()
    updated += 1
  }

  console.log('Normalization complete:', {
    updated,
    translatedNames,
    translatedSubcategories,
    descriptionsCleaned,
    leadImagesRemoved,
  })

  await mongoose.disconnect()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
