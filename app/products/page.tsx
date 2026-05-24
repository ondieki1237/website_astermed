import { Suspense } from 'react'
import { ProductsContent } from './client'
import { getStaticCategories, getStaticProducts } from '@/lib/static-catalog'

interface ProductsPageProps {
  searchParams?: {
    category?: string
    search?: string
  }
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsContent
        initialProducts={getStaticProducts()}
        initialCategories={getStaticCategories()}
        initialCategory={typeof searchParams?.category === 'string' ? decodeURIComponent(searchParams.category) : 'All Categories'}
        initialSearch={typeof searchParams?.search === 'string' ? decodeURIComponent(searchParams.search) : ''}
      />
    </Suspense>
  )
}
