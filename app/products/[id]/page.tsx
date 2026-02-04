import ProductDetailClient from './client'

interface Product {
  _id: string
  name: string
  price: number
  discountPrice?: number
  discountPercentage?: number
  image?: string
  images?: string[]
  category: string
  rating: number
  reviewCount: number
  stock: number
  description: string
  features?: string[]
  specifications?: Record<string, string>
  warranty?: string
  manufacturerInfo?: string
}

// Generate static params for all products at build time
export async function generateStaticParams() {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://astermed.codewithseth.co.ke'
    const res = await fetch(`${API_BASE}/api/products`, { cache: 'no-store' })
    const products = await res.json()
    
    return products.map((product: Product) => ({
      id: product._id,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

export default function ProductDetailPage() {
  return <ProductDetailClient />
}
