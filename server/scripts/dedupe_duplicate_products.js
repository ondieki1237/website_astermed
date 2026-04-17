import dotenv from 'dotenv'
import mongoose from 'mongoose'

import Product from '../models/Product.js'

dotenv.config({ path: './.env' })

function cleanText(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeKey(product) {
  return `${cleanText(product.category).toLowerCase()}||${cleanText(product.name).toLowerCase()}`
}

function score(product) {
  const reviews = Number(product.reviewCount || 0)
  const views = Number(product.views || 0)
  const rating = Number(product.rating || 0)
  const images = Array.isArray(product.images) ? product.images.length : 0
  const created = product.createdAt ? new Date(product.createdAt).getTime() : 0
  return (reviews * 1_000_000) + (views * 1_000) + (rating * 100) + (images * 10) + created
}

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set in server/.env')

  console.log('Connecting to MongoDB...')
  await mongoose.connect(uri)
  console.log('MongoDB connected')

  const docs = await Product.find({}).lean()
  const groups = new Map()

  for (const doc of docs) {
    const key = normalizeKey(doc)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(doc)
  }

  const duplicateGroups = [...groups.entries()].filter(([, arr]) => arr.length > 1)
  console.log(`Found ${duplicateGroups.length} duplicate groups`)

  let removed = 0
  for (const [key, arr] of duplicateGroups) {
    const ordered = arr.sort((a, b) => {
      const diff = score(b) - score(a)
      if (diff !== 0) return diff
      return String(a._id).localeCompare(String(b._id))
    })

    const keep = ordered[0]
    const dropIds = ordered.slice(1).map((d) => d._id)
    if (dropIds.length) {
      await Product.deleteMany({ _id: { $in: dropIds } })
      removed += dropIds.length
    }

    console.log(`Kept: ${keep.name} | removed ${dropIds.length}`)
  }

  const remaining = await Product.countDocuments({})
  console.log({ removed, remaining })

  await mongoose.disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
