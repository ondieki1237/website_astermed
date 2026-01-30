'use client'

import Header from '@/components/header'
import Footer from '@/components/footer'
import CategorySidebar from '@/components/category-sidebar'
import Link from 'next/link'
import { formatPrice } from '@/lib/currency'
import { resolveImageSrc } from '@/lib/image'
import useCart from '@/hooks/use-cart'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { addItem } = useCart()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [usedFallback, setUsedFallback] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const API_BASE = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:5088'
        // First try to load featured (offers)
        const fRes = await fetch(`${API_BASE}/api/products/featured`)
        if (!fRes.ok) throw new Error('failed to load featured')
        const featured = await fRes.json()
        if (mounted && Array.isArray(featured) && featured.length > 0) {
          setProducts(featured.map((p: any) => ({ ...p, id: p._id || p.id })))
          setUsedFallback(false)
        } else {
          // fallback: recent products (limit 18)
          const rRes = await fetch(`${API_BASE}/api/products?limit=18&sort=-createdAt`)
          if (!rRes.ok) throw new Error('failed to load recent')
          const rData = await rRes.json()
          const recent = rData.products || []
          if (mounted) {
            setProducts(recent.map((p: any) => ({ ...p, id: p._id || p.id })))
            setUsedFallback(true)
          }
        }
      } catch (err) {
        console.error('Failed to load homepage products', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 flex gap-8 bg-white px-6 py-6">
        {/* Sidebar */}
        <div className="hidden lg:block flex-shrink-0">
          <CategorySidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <h2 className="text-2xl lg:text-xl font-bold text-foreground mb-6 tracking-tight">Our Top Products:</h2>

          {/* Products Grid - 2 columns on phones, up to 4 on large screens */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-3">
            {products.map((product) => (
              <div key={product.id || product._id} className="h-full">
                <div onClick={() => router.push(`/products/${product._id || product.id}`)} className="bg-white border border-gray-300 rounded-xl overflow-hidden hover:-translate-y-1 hover:shadow-md transition-transform duration-200 cursor-pointer h-full flex flex-col">
                  {/* Image Container */}
                  <div className="relative aspect-square overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img
                      src={resolveImageSrc(product.image)}
                      alt={product.name}
                      className="w-full h-full object-contain p-4 lg:p-2"
                    />
                    {product.isOnOffer && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 lg:w-6 lg:h-6 flex items-center justify-center font-bold text-xs lg:text-[9px] shadow-md">
                        -{product.discountPercentage}%
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-3 lg:p-2 flex flex-col flex-1">
                    <h3 className="font-medium text-gray-800 text-sm lg:text-xs mb-1 truncate">{product.name}</h3>
                    <p className="text-xs lg:text-[10px] text-gray-600 mb-2 line-clamp-1">{product.category || ''}</p>

                    {/* Price and actions */}
                    <div className="mt-auto">
                      <div className="flex items-end justify-center gap-2 mb-3">
                        {product.isOnOffer ? (
                          <>
                            <p className="text-[10px] lg:text-[10px] line-through text-gray-400">{formatPrice(product.price)}</p>
                            <p className="text-sm lg:text-xs font-bold text-primary">{formatPrice(product.price * (1 - (product.discountPercentage || 0) / 100))}</p>
                          </>
                        ) : (
                          <p className="text-sm lg:text-xs font-bold text-primary">{formatPrice(product.price)}</p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button onClick={(e) => { e.stopPropagation(); addItem({ id: product._id || product.id, name: product.name, price: product.price, image: product.image }, 1) }} className="flex-1 bg-primary text-white text-xs px-2 py-1 lg:px-1 lg:py-0.5 rounded-sm hover:bg-primary/90">Add</button>
                        <Link href={`/products/${product._id || product.id}`} onClick={(e) => e.stopPropagation()} className="flex-1 border border-gray-300 text-center text-xs px-2 py-1 lg:px-1 lg:py-0.5 rounded-sm hover:bg-gray-50">View</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View More when showing recent fallback */}
          {usedFallback && (
            <div className="mt-6 text-center">
              <Link href="/products" className="inline-block bg-primary text-white px-4 py-2 rounded-md">View More</Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
