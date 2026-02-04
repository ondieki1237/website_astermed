'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface Category {
  _id: string
  name: string
  count?: number
  subcategories?: string[]
}

interface ProductItem {
  _id: string
  name: string
  price: number
  image?: string
}

export default function CategorySidebar() {
  const [categories, setCategories] = useState<Category[]>([])
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [expandedSub, setExpandedSub] = useState<string | null>(null)
  const [productsByKey, setProductsByKey] = useState<Record<string, ProductItem[]>>({})
  const [loadingKey, setLoadingKey] = useState<string | null>(null)
  const [errorKey, setErrorKey] = useState<string | null>(null)

  const API_BASE =
    (process.env.NEXT_PUBLIC_API_URL as string) || 'https://astermed.codewithseth.co.ke'

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/categories`)
        if (!res.ok) return
        const data = await res.json()
        setCategories(data || [])
      } catch {
        // silent fail
      }
    }
    loadCategories()
  }, [API_BASE])

  const loadProducts = async (key: string, url: string) => {
    if (productsByKey[key]) return
    setLoadingKey(key)
    setErrorKey(null)

    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setProductsByKey(prev => ({
        ...prev,
        [key]: data.products || data,
      }))
    } catch {
      setErrorKey(key)
    } finally {
      setLoadingKey(null)
    }
  }

  return (
    <aside className="lg:w-64 bg-white rounded-2xl shadow-lg border border-gray-100 h-full overflow-hidden">
      <div className="p-4">
        <h2 className="text-lg font-bold mb-4 tracking-tight text-[#d0dc36] flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-[#d0dc36] to-[#e53935] rounded-full"></div>
          Categories
        </h2>

        <div className="space-y-2">
          {categories.map(category => {
            const isOpen = expandedCategory === category.name

            return (
              <div key={category._id} className="animate-fade-in">
                {/* CATEGORY BUTTON */}
                <button
                  onClick={() => {
                    setExpandedCategory(isOpen ? null : category.name)
                    setExpandedSub(null)

                    if (!category.subcategories?.length) {
                      loadProducts(
                        category.name,
                        `${API_BASE}/api/products?category=${encodeURIComponent(
                          category.name
                        )}&limit=20`
                      )
                    }
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isOpen 
                      ? 'bg-gradient-to-r from-[#d0dc36] to-[#c5d030] text-white shadow-lg shadow-[#d0dc36]/20' 
                      : 'bg-gradient-to-r from-gray-50 to-white text-gray-700 hover:from-[#f9fbff] hover:to-[#eef2ff] hover:text-[#d0dc36] hover:shadow-md'
                  }`}
                >
                  <span className="truncate">{category.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isOpen ? 'bg-white/20' : 'bg-gray-200'
                    }`}>
                      {category.count ?? 0}
                    </span>
                    <ChevronDown size={16} className={`${isOpen ? 'rotate-180' : ''} transition-transform duration-200`} />
                  </div>
                </button>

                {/* SUBCATEGORIES */}
                {isOpen && category.subcategories && category.subcategories.length > 0 && (
                  <div className="mt-3 ml-4 pl-4 border-l-2 border-gray-200 space-y-2 animate-slide-in-left">
                    {category.subcategories.map(sub => {
                      const key = `${category.name}::${sub}`
                      const subOpen = expandedSub === key

                      return (
                        <div key={sub}>
                          <button
                            onClick={() => {
                              setExpandedSub(subOpen ? null : key)
                              loadProducts(
                                key,
                                `${API_BASE}/api/products?category=${encodeURIComponent(
                                  category.name
                                )}&subcategory=${encodeURIComponent(
                                  sub
                                )}&limit=20`
                              )
                            }}
                            className={`w-full text-left text-sm py-2 px-3 rounded-lg transition-all duration-200 font-medium
                              ${subOpen
                                ? 'text-[#d0dc36] bg-[#f9fbff] shadow-sm'
                                : 'text-gray-600 hover:text-[#d0dc36] hover:bg-gray-50'
                              }`}
                          >
                            {sub}
                          </button>

                          {/* PRODUCTS */}
                          {subOpen && (
                            <div className="mt-2 ml-3 space-y-1.5 animate-fade-in">
                              {loadingKey === key && (
                                <p className="text-xs text-gray-500 px-3 py-2">
                                  Loading products...
                                </p>
                              )}

                              {errorKey === key && (
                                <p className="text-xs text-red-600 px-3 py-2">
                                  Failed to load products
                                </p>
                              )}

                              {productsByKey[key]?.map(product => (
                                <Link
                                  key={product._id}
                                  href={`/products/${product._id}`}
                                  className="block text-xs truncate hover:text-[#d0dc36] text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all duration-200"
                                >
                                  {product.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* PRODUCTS (NO SUBCATEGORIES) */}
                {isOpen &&
                  !category.subcategories?.length &&
                  productsByKey[category.name] && (
                    <div className="mt-2 ml-2 space-y-1 animate-fade-in">
                      {productsByKey[category.name].map(product => (
                        <Link
                          key={product._id}
                          href={`/products/${product._id}`}
                          className="block text-xs truncate hover:text-[#d0dc36] text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all duration-200"
                        >
                          {product.name}
                        </Link>
                      ))}
                    </div>
                  )}

                {isOpen && loadingKey === category.name && (
                  <p className="mt-2 ml-2 text-xs text-gray-500 px-3 py-2">
                    Loading products...
                  </p>
                )}

                {isOpen && errorKey === category.name && (
                  <p className="mt-2 ml-2 text-xs text-red-600 px-3 py-2">
                    Failed to load products
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
