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
        const API_BASE = (process.env.NEXT_PUBLIC_API_URL as string) || 'https://astermed.codewithseth.co.ke'
        // First try to load featured (offers) - limit to 12 for square grid
        const fRes = await fetch(`${API_BASE}/api/products/featured?limit=12`)
        if (!fRes.ok) throw new Error('failed to load featured')
        const featured = await fRes.json()
        if (mounted && Array.isArray(featured) && featured.length > 0) {
          setProducts(featured.map((p: any) => ({ ...p, id: p._id || p.id })))
          setUsedFallback(false)
        } else {
          // fallback: recent products (limit 12 for 4x3 grid)
          const rRes = await fetch(`${API_BASE}/api/products?limit=12&sort=-createdAt`)
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

      <main className="flex-1 flex gap-2 bg-[#f9fbff] px-2 py-2">
        {/* Sidebar */}
        <div className="hidden lg:block flex-shrink-0">
          <CategorySidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <h2 className="text-[13px] font-bold text-[#1f2a7c] mb-1 tracking-tight">
            Our Top Products:
          </h2>

          {loading ? (
            <div className="text-center py-12 text-sm text-gray-500">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-500">No products available</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {products.map((product) => (
                <div key={product.id || product._id}>
                  <div
                    onClick={() => router.push(`/products/${product._id || product.id}`)}
                    className="bg-white border border-[#dbe3ff] rounded-md overflow-hidden
                  hover:-translate-y-0.5 hover:shadow-[0_3px_10px_rgba(31,42,124,0.12)]
                  transition-all duration-200 cursor-pointer flex flex-col h-full"
                  >
                    {/* Image – Fixed height aspect-square */}
                    <div className="relative w-full aspect-square bg-[#f3f6ff] flex items-center justify-center p-1">
                      <img
                        src={resolveImageSrc(product.image)}
                        alt={product.name}
                        className="max-w-full max-h-full object-contain"
                      />

                      {product.isOnOffer && (
                        <div className="absolute top-1 right-1 bg-[#e53935] text-white
                      rounded-full w-5 h-5 flex items-center justify-center
                      font-bold text-[8px] shadow">
                          -{product.discountPercentage}%
                        </div>
                      )}
                    </div>

                    {/* Info – consistent padding and fixed bottom area */}
                    <div className="p-1 flex flex-col flex-1 min-h-[64px]">
                      <h3 className="font-semibold text-[#1f2a7c] text-[9px] leading-tight mb-1 line-clamp-2 text-center h-[20px]">
                        {product.name}
                      </h3>

                      <div className="mt-auto pt-1 border-t border-gray-50">
                        <div className="flex items-center justify-center gap-1.5 mb-1.5">
                          {product.isOnOffer ? (
                            <>
                              <span className="text-[7.5px] line-through text-gray-400">
                                {formatPrice(product.price)}
                              </span>
                              <span className="text-[10px] font-extrabold text-[#1f2a7c]">
                                {formatPrice(
                                  product.price * (1 - (product.discountPercentage || 0) / 100)
                                )}
                              </span>
                            </>
                          ) : (
                            <span className="text-[10px] font-extrabold text-[#1f2a7c]">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>

                          <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              addItem(
                                {
                                  id: product._id || product.id,
                                  name: product.name,
                                  price: product.price,
                                  image: product.image,
                                  quantity: 1,
                                },
                                1
                              )
                            }}
                            className="flex-1 bg-[#1f2a7c] text-white text-[8px] font-bold px-1 py-1 rounded-sm hover:bg-[#162060] transition-colors h-[24px] overflow-hidden truncate"
                          >
                            Add
                          </button>

                          <Link
                            href={`/products/${product._id || product.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 border border-[#c7d2fe] text-[#1f2a7c] text-center text-[8px] font-bold px-1 py-1 rounded-sm hover:bg-[#eef2ff] transition-colors h-[24px] flex items-center justify-center"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View More Button - Navigates to full product catalog */}
          {usedFallback && (
            <div className="mt-4 text-center">
              <Link
                href="/products"
                className="inline-block bg-[#1f2a7c] text-white px-4 py-1.5 rounded-md text-[10px] hover:bg-[#162060] transition-colors"
              >
                View More
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
