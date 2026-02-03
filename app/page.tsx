'use client'

import Header from '@/components/header'
import Footer from '@/components/footer'
import CategorySidebar from '@/components/category-sidebar'
import Link from 'next/link'
import { formatPrice } from '@/lib/currency'
import { resolveImageSrc } from '@/lib/image'
import { getApiBase } from '@/lib/api'
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
        const API_BASE = getApiBase()
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-[#f9fbff] to-white">
      <Header />

      <main className="flex-1 flex gap-4 px-4 py-4 pt-20 lg:pt-24 max-w-[1800px] mx-auto w-full">
        {/* Sidebar */}
        <div className="hidden lg:block flex-shrink-0">
          <CategorySidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1f2a7c] via-[#2a3a8c] to-[#1f2a7c] p-8 lg:p-12 shadow-xl">
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
            <div className="relative z-10">
              <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
                Premium Medical Supplies
              </h1>
              <p className="text-lg text-white/90 mb-6 max-w-2xl">
                Trusted healthcare equipment and supplies for professionals worldwide
              </p>
              <div className="flex gap-4">
                <Link href="/products" className="bg-[#e53935] hover:bg-[#d32f2f] text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg">
                  Shop Now
                </Link>
                <Link href="/news" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-6 py-3 rounded-lg font-semibold transition-all border border-white/30">
                  Contact Us
                </Link>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -right-8 -top-8 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute -left-8 -bottom-8 w-64 h-64 bg-[#e53935]/10 rounded-full blur-3xl"></div>
          </div>

          {/* Products Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[#1f2a7c] tracking-tight">
                Featured Products
              </h2>
              {usedFallback && (
                <Link href="/products" className="text-sm text-[#1f2a7c] hover:text-[#162060] font-medium transition-colors">
                  View All →
                </Link>
              )}
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block w-12 h-12 border-4 border-[#1f2a7c]/20 border-t-[#1f2a7c] rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500 mt-4">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                <p className="text-gray-500">No products available</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {products.map((product) => (
                <div key={product.id || product._id}>
                  <div
                    onClick={() => router.push(`/products/${product._id || product.id}`)}
                    className="bg-white border border-gray-100 rounded-xl overflow-hidden
                  hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#1f2a7c]/10 hover:border-[#1f2a7c]/30
                  transition-all duration-300 cursor-pointer flex flex-col h-full group"
                  >
                    {/* Image – Fixed height aspect-square */}
                    <div className="relative w-full aspect-square bg-gradient-to-br from-[#f3f6ff] to-white flex items-center justify-center p-3 overflow-hidden">
                      <img
                        src={resolveImageSrc(product.image)}
                        alt={product.name}
                        className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-110"
                      />

                      {product.isOnOffer && (
                        <div className="absolute top-2 right-2 bg-gradient-to-br from-[#e53935] to-[#d32f2f] text-white
                      rounded-full w-12 h-12 flex items-center justify-center
                      font-bold text-xs shadow-lg animate-pulse">
                          -{product.discountPercentage}%
                        </div>
                      )}
                    </div>

                    {/* Info – consistent padding and fixed bottom area */}
                    <div className="p-3 flex flex-col flex-1">
                      <h3 className="font-semibold text-[#1f2a7c] text-xs leading-snug mb-2 line-clamp-2 min-h-[32px]">
                        {product.name}
                      </h3>

                      <div className="mt-auto pt-2">
                        <div className="flex items-center justify-center gap-2 mb-3">
                          {product.isOnOffer ? (
                            <>
                              <span className="text-xs line-through text-gray-400">
                                {formatPrice(product.price)}
                              </span>
                              <span className="text-base font-bold text-[#1f2a7c]">
                                {formatPrice(
                                  product.price * (1 - (product.discountPercentage || 0) / 100)
                                )}
                              </span>
                            </>
                          ) : (
                            <span className="text-base font-bold text-[#1f2a7c]">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>

                          <div className="flex gap-2">
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
                            className="flex-1 bg-gradient-to-r from-[#1f2a7c] to-[#2a3a8c] text-white text-xs font-bold px-3 py-2 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
                          >
                            Add to Cart
                          </button>

                          <Link
                            href={`/products/${product._id || product.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center justify-center border-2 border-[#1f2a7c] text-[#1f2a7c] text-xs font-bold px-3 py-2 rounded-lg hover:bg-[#1f2a7c] hover:text-white transition-all duration-200"
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
        </div>
      </div>
    </main>

    <Footer />
  </div>
)
}
