import ProductDetailClient from './client'
import { getStaticProductById, getStaticProducts } from '@/lib/static-catalog'

interface Product {
  _id: string
  id: string
  slug: string
  name: string
  category: string
}

interface ProductDetailPageProps {
  params: {
    id: string
  } | Promise<{
    id: string
  }>
}

// Generate static params for all products at build time
export async function generateStaticParams() {
  return getStaticProducts().map((product) => ({
    id: product.slug || product.id || product._id,
  }))
}

function normalizeSlug(value: string) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const resolvedParams = await params
  const routeId = decodeURIComponent(resolvedParams.id)
  const product =
    getStaticProductById(routeId) ||
    getStaticProducts().find((item) => normalizeSlug(item.slug || item.id || item._id) === normalizeSlug(routeId)) ||
    null
  const similarProducts = product
    ? getStaticProducts().filter((item) => item._id !== product._id && item.category === product.category).slice(0, 12)
    : []

  return <ProductDetailClient initialProduct={product} initialSimilarProducts={similarProducts} />
}
