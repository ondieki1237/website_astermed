'use client'

import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { getApiBase } from '@/lib/api'
import { resolveImageSrc } from '@/lib/image'

interface Category {
  _id: string
  name: string
  count?: number
}

interface Product {
  _id: string
  name: string
  price: number
  image?: string
}

export default function CategoryDropdownNav() {
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [products, setProducts] = useState<Record<string, Product[]>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const API_BASE = getApiBase()
        const res = await fetch(`${API_BASE}/api/categories`)
        if (!res.ok) return
        const data = await res.json()
        setCategories(data || [])
      } catch (error) {
        console.error('Failed to load categories', error)
      }
    }
    loadCategories()
  }, [])

  const loadProducts = async (categoryName: string) => {
    if (products[categoryName]) {
      setActiveCategory(categoryName)
      return
    }

    setLoading(prev => ({ ...prev, [categoryName]: true }))
    try {
      const API_BASE = getApiBase()
      const res = await fetch(
        `${API_BASE}/api/products?category=${encodeURIComponent(categoryName)}&limit=10`
      )
      if (!res.ok) throw new Error('Failed to load products')
      const data = await res.json()
      setProducts(prev => ({
        ...prev,
        [categoryName]: data.products || data,
      }))
      setActiveCategory(categoryName)
    } catch (error) {
      console.error('Failed to load products for category', categoryName, error)
    } finally {
      setLoading(prev => ({ ...prev, [categoryName]: false }))
    }
  }

  if (categories.length === 0) return null

  return (
    <div className="flex items-center justify-center overflow-x-auto px-4 xl:px-8">
      <div className="flex gap-1 py-2 flex-wrap justify-center max-w-[1400px] w-full">
            {categories.map(category => (
              <div
                key={category._id}
                className="relative group"
                onMouseEnter={() => loadProducts(category.name)}
                onMouseLeave={() => setActiveCategory(null)}
              >
                {/* Category Button */}
                <button
                  className="px-4 py-3 text-[13px] font-bold text-white hover:text-white hover:bg-white/15 transition-colors whitespace-nowrap flex items-center gap-1.5 uppercase tracking-wider"
                >
                  {category.name}
                  <ChevronDown className="w-3 h-3" />
                </button>

                {/* Dropdown Products */}
                <div className="absolute left-0 top-full hidden group-hover:block bg-white border border-gray-200 shadow-2xl rounded-sm z-50 min-w-[320px] max-w-[400px]">
                  <div className="p-4">
                    <h3 className="font-bold text-[12px] text-gray-700 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">
                      Top Products
                    </h3>

                    {loading[category.name] ? (
                      <div className="text-center py-6">
                        <div className="inline-block w-5 h-5 border-2 border-gray-200 border-t-[#5A946A] rounded-full animate-spin"></div>
                      </div>
                    ) : products[category.name]?.length > 0 ? (
                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {products[category.name].map(product => (
                          <Link
                            key={product._id}
                            href={`/products/${product._id}`}
                            className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded transition-colors"
                          >
                            <div className="w-12 h-12 bg-[#f8f9fa] rounded flex items-center justify-center flex-shrink-0 border border-gray-100">
                              <img
                                src={resolveImageSrc(product.image)}
                                alt={product.name}
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-semibold text-gray-800 line-clamp-2">
                                {product.name}
                              </p>
                              <p className="text-[10px] text-[#5A946A] font-bold mt-0.5">
                                View details →
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-6 text-[11px] text-gray-500">
                        No products available
                      </p>
                    )}

                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <Link
                        href={`/products?category=${encodeURIComponent(category.name)}`}
                        className="block text-center text-[11px] font-bold text-[#5A946A] hover:text-[#487a55] transition-colors py-2"
                      >
                        View All in {category.name} →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

  )
}
