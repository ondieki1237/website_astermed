'use client'

import Header from '@/components/header'
import Footer from '@/components/footer'
import CategorySidebar from '@/components/category-sidebar'
import Link from 'next/link'
import { formatPrice } from '@/lib/currency'
import { resolveImageSrc } from '@/lib/image'
import { getApiBase } from '@/lib/api'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [usedFallback, setUsedFallback] = useState(false)
  const router = useRouter()
  const whatsappNumber = '254746999725'

  const orderViaWhatsApp = (product: any) => {
    const productId = product?._id || product?.id
    const productUrl = `${window.location.origin}/products/${productId}`
    const message = `Hello AsterMed, I'd like to order ${product?.name || 'this product'}.\n${productUrl}`
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

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
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 flex gap-6 px-4 xl:px-8 py-6 pt-28 md:pt-32 lg:pt-28 max-w-[1400px] mx-auto w-full">
        {/* Sidebar */}
        <div className="hidden lg:block w-[260px] flex-shrink-0">
          <CategorySidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-8">
          {/* Hero Banner */}
          <div className="relative bg-[#5A946A] p-4 md:p-6 lg:p-8 shadow-sm border border-[#487a55] rounded-sm">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
            <div className="relative z-10 flex flex-col items-start">
              <h1 className="hidden lg:block text-2xl md:text-3xl lg:text-4xl font-black text-white mb-2 tracking-wider uppercase leading-tight">
                AsterMed Medical Supplies
              </h1>
              <p className="text-sm md:text-base text-white/95 mb-4 max-w-xl font-medium leading-relaxed">
                Premium healthcare equipment and materials for professionals worldwide. Fast, reliable, and authentic.
              </p>
              <div className="flex gap-2">
                <Link href="/products" className="bg-[#2D2D2D] hover:bg-black text-white px-4 py-1.5 text-[10px] font-bold transition-colors uppercase tracking-wider shadow-sm">
                  Shop Now
                </Link>
                <Link href="/news" className="bg-white hover:bg-gray-100 text-[#2D2D2D] px-4 py-1.5 text-[10px] font-bold transition-colors uppercase tracking-wider shadow-sm">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
          {/* Products Section */}
          <div className="bg-white">
            <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 tracking-tight uppercase border-l-4 border-[#5A946A] pl-3 leading-none">
                Featured Products
              </h2>
              {usedFallback && (
                <Link href="/products" className="text-sm text-[#5A946A] hover:text-gray-900 font-medium transition-colors">
                  View All Products →
                </Link>
              )}
            </div>

            {loading ? (
              <div className="text-center py-24">
                <div className="inline-block w-8 h-8 border-2 border-gray-200 border-t-[#5A946A] rounded-full animate-spin"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 border border-gray-200 bg-gray-50">
                <p className="text-gray-500 text-sm">No products available at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
                {products.map((product) => (
                  <div key={product.id || product._id} className="group">
                    <div
                      onClick={() => router.push(`/products/${product._id || product.id}`)}
                      className="bg-white border border-gray-200 hover:border-[#5A946A] transition-colors cursor-pointer flex flex-col h-full rounded-sm"
                    >
                      {/* Image Frame */}
                      <div className="relative w-full aspect-square bg-[#f8f9fa] flex items-center justify-center p-4 border-b border-gray-100">
                        <img
                          src={resolveImageSrc(product.image)}
                          alt={product.name}
                          className="max-w-full max-h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                        />

                        {product.isOnOffer && (
                          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider">
                            Sale {product.discountPercentage}%
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-medium text-gray-800 text-[13px] leading-snug mb-3 line-clamp-2 min-h-[36px] group-hover:text-[#5A946A] transition-colors">
                          {product.name}
                        </h3>

                        <div className="mt-auto flex flex-col gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              orderViaWhatsApp(product)
                            }}
                            className="w-full bg-[#5A946A] text-white text-[11px] font-bold uppercase tracking-wide py-2.5 hover:bg-[#487a55] transition-colors rounded-sm"
                          >
                            Order via WhatsApp
                          </button>
                          <Link
                            href={`/products/${product._id || product.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-gray-100 text-gray-700 text-[11px] font-bold uppercase tracking-wide py-2.5 text-center hover:bg-gray-200 transition-colors rounded-sm"
                          >
                            View Details
                          </Link>
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
