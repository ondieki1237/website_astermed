import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Product from '../models/Product.js'

dotenv.config({ path: './.env' })

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error('MONGODB_URI not set in server/.env')
  process.exit(1)
}

async function run() {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    console.log('Connected to MongoDB')

    const indexes = await Product.collection.indexes()
    console.log('Existing indexes:', indexes.map(i => ({ name: i.name, key: i.key, sparse: i.sparse })))

    const skuIndex = indexes.find(i => i.key && i.key.sku === 1)
    if (!skuIndex) {
      console.log('No sku index found — nothing to do')
      process.exit(0)
    }

    if (skuIndex.sparse) {
      console.log('sku index is already sparse — nothing to do')
      process.exit(0)
    }

    console.log('Dropping non-sparse sku index:', skuIndex.name)
    await Product.collection.dropIndex(skuIndex.name)
    console.log('Dropped index. Recreating sparse unique index on sku...')
    await Product.collection.createIndex({ sku: 1 }, { unique: true, sparse: true })
    console.log('Recreated sparse unique index on sku')
    process.exit(0)
  } catch (err) {
    console.error('Error:', err && err.message ? err.message : err)
    process.exit(1)
  }
}

run()
