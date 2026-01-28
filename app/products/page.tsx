import { Suspense } from 'react'
import { ProductsContent } from './client'

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsContent />
    </Suspense>
  )
}
