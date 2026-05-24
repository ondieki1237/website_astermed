import fs from 'fs'
import path from 'path'

export interface CatalogProduct {
  _id: string
  id: string
  name: string
  description: string
  category: string
  subcategory?: string
  image?: string
  images?: string[]
  slug: string
  price: number
  stock: number
  rating: number
  reviewCount: number
  views: number
  isOnOffer?: boolean
  discountPercentage?: number
  manufacturerInfo?: string
  specifications?: Record<string, string>
  tags?: string[]
  inStock?: boolean
}

export interface CatalogCategory {
  _id: string
  name: string
  count: number
  subcategories: string[]
}

type RawCatalog = {
  products?: Array<Partial<CatalogProduct> & Record<string, unknown>>
}

const DATA_FILE = path.join(process.cwd(), 'data', 'bestreat-products.json')

let cachedProducts: CatalogProduct[] | null = null
let cachedCategories: CatalogCategory[] | null = null

function slugify(value: string) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeProduct(raw: Partial<CatalogProduct> & Record<string, unknown>, index: number): CatalogProduct {
  const name = String(raw.name || `Product ${index + 1}`)
  const slug = String(raw.slug || raw.id || raw._id || slugify(name) || `product-${index + 1}`)
  const id = String(raw.id || raw._id || slug)

  return {
    _id: id,
    id,
    name,
    description: String(raw.description || `High-quality ${name} from AsterMed.`),
    category: String(raw.category || 'Uncategorized'),
    subcategory: raw.subcategory ? String(raw.subcategory) : undefined,
    image: raw.image ? String(raw.image) : undefined,
    images: Array.isArray(raw.images) ? raw.images.map((img) => String(img)).filter(Boolean) : undefined,
    slug,
    price: typeof raw.price === 'number' ? raw.price : Number(raw.price || 0),
    stock: typeof raw.stock === 'number' ? raw.stock : Number(raw.stock || 0),
    rating: typeof raw.rating === 'number' ? raw.rating : Number(raw.rating || 0),
    reviewCount: typeof raw.reviewCount === 'number' ? raw.reviewCount : Number(raw.reviewCount || 0),
    views: typeof raw.views === 'number' ? raw.views : Number(raw.views || 0),
    isOnOffer: Boolean(raw.isOnOffer),
    discountPercentage: typeof raw.discountPercentage === 'number' ? raw.discountPercentage : undefined,
    manufacturerInfo: raw.manufacturerInfo ? String(raw.manufacturerInfo) : undefined,
    specifications:
      raw.specifications && typeof raw.specifications === 'object' && !Array.isArray(raw.specifications)
        ? (raw.specifications as Record<string, string>)
        : undefined,
    tags: Array.isArray(raw.tags) ? raw.tags.map((tag) => String(tag)).filter(Boolean) : undefined,
    inStock: typeof raw.inStock === 'boolean' ? raw.inStock : undefined,
  }
}

function readProducts(): CatalogProduct[] {
  if (cachedProducts) return cachedProducts

  if (!fs.existsSync(DATA_FILE)) {
    cachedProducts = []
    return cachedProducts
  }

  const raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) as RawCatalog
  cachedProducts = Array.isArray(raw.products)
    ? raw.products.map((product, index) => normalizeProduct(product, index))
    : []
  return cachedProducts
}

function readCategories(): CatalogCategory[] {
  if (cachedCategories) return cachedCategories

  const categoryMap = new Map<string, CatalogCategory>()

  for (const product of readProducts()) {
    const name = String(product.category || 'Uncategorized')
    const subcategory = String(product.subcategory || '').trim()
    if (!categoryMap.has(name)) {
      categoryMap.set(name, {
        _id: slugify(name) || name,
        name,
        count: 0,
        subcategories: [],
      })
    }

    const category = categoryMap.get(name)!
    category.count += 1
    if (subcategory && !category.subcategories.includes(subcategory)) {
      category.subcategories.push(subcategory)
    }
  }

  cachedCategories = Array.from(categoryMap.values()).sort((a, b) => b.count - a.count)
  return cachedCategories
}

export function getStaticProducts() {
  return readProducts()
}

export function getStaticCategories() {
  return readCategories()
}

export function getStaticProductById(id: string) {
  const target = String(id || '')
  return getStaticProducts().find((product) => product.id === target || product._id === target || product.slug === target) || null
}

export function getStaticProductsByCategory(categoryName: string, limit = 20) {
  const normalized = String(categoryName || '').trim().toLowerCase()
  return getStaticProducts()
    .filter((product) => String(product.category || '').trim().toLowerCase() === normalized)
    .slice(0, limit)
}

export function searchStaticProducts(query: string, limit = 20) {
  const term = String(query || '').trim().toLowerCase()
  const products = getStaticProducts()
  if (!term) return products.slice(0, limit)

  return products
    .filter((product) => {
      const haystack = [product.name, product.description, product.category, product.subcategory, ...(product.tags || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(term)
    })
    .slice(0, limit)
}

export function getFeaturedStaticProducts(limit = 12) {
  const products = [...getStaticProducts()].sort((a, b) => {
    const scoreA = (a.rating || 0) * 10 + (a.reviewCount || 0) + (a.views || 0) / 1000
    const scoreB = (b.rating || 0) * 10 + (b.reviewCount || 0) + (b.views || 0) / 1000
    return scoreB - scoreA
  })

  const selected: CatalogProduct[] = []
  const buckets = new Map<string, CatalogProduct[]>()

  for (const product of products) {
    const key = product.category || 'Other'
    if (!buckets.has(key)) buckets.set(key, [])
    buckets.get(key)!.push(product)
  }

  const bucketList = Array.from(buckets.values())
  let index = 0
  while (selected.length < limit && bucketList.some((bucket) => bucket.length > 0)) {
    const bucket = bucketList[index % bucketList.length]
    const next = bucket.shift()
    if (next) selected.push(next)
    index += 1
  }

  return selected.slice(0, limit)
}
