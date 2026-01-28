import dotenv from 'dotenv'
import path from 'path'
import connectDB from '../config/db.js'
import Product from '../models/Product.js'
import Category from '../models/Category.js'

// Load .env from the server directory explicitly
dotenv.config({ path: path.join(process.cwd(), 'server', '.env') })

async function main() {
  await connectDB()
  console.log('Syncing categories from products...')
  const cats = await Product.distinct('category')
  const trimmed = cats.map(c => (c || '').toString().trim()).filter(Boolean)
  const unique = Array.from(new Set(trimmed))
  let created = 0
  for (const name of unique) {
    const exists = await Category.findOne({ name })
    if (!exists) {
      await new Category({ name }).save()
      created++
      console.log('Created category:', name)
    }
  }
  console.log(`Done. Categories found: ${unique.length}, created: ${created}`)
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
