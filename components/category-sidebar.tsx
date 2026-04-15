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
    <aside className="w-full bg-white border border-gray-200 rounded-sm overflow-hidden h-fit shadow-sm">
      <div className="bg-[#5A946A] p-4 border-b border-[#487a55]">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          Product Categories
        </h2>
      </div>

      <div className="flex flex-col">
        {categories.map(category => {
          const isOpen = expandedCategory === category.name

          return (
            <div key={category._id} className="border-b border-gray-100 last:border-0">
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
                className={`w-full flex items-center justify-between px-4 py-3 text-[13px] font-bold uppercase transition-colors ${
                  isOpen 
                    ? 'bg-[#5A946A] text-white' 
                    : 'bg-white text-gray-800 hover:text-[#5A946A] hover:bg-gray-50'
                }`}
              >
                <span className="truncate">{category.name}</span>
                <div className="flex items-center gap-2">
                  {category.count !== undefined && category.count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-sm bg-black/10`}>
                      {category.count}
                    </span>
                  )}
                  {category.subcategories && category.subcategories.length > 0 && (
                    <ChevronDown size={14} className={`${isOpen ? 'rotate-180' : ''} transition-transform duration-200`} />
                  )}
                </div>
              </button>

              {/* SUBCATEGORIES */}
              {isOpen && category.subcategories && category.subcategories.length > 0 && (
                <div className="bg-gray-50 flex flex-col py-2 border-t border-[#487a55]">
                  {category.subcategories.map(sub => {
                    const key = `${category.name}::${sub}`
                    const subOpen = expandedSub === key

                    return (
                      <div key={sub} className="flex flex-col">
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
                          className={`w-full text-left text-[12px] py-2 px-6 transition-colors font-semibold flex items-center gap-2
                            ${subOpen
                              ? 'text-[#5A946A] bg-gray-100'
                              : 'text-gray-600 hover:text-[#5A946A] hover:bg-white'
                            }`}
                        >
                          <ChevronRight size={12} className={subOpen ? "rotate-90 text-[#5A946A]" : "text-gray-400"} />
                          {sub}
                        </button>

                        {/* PRODUCTS */}
                        {subOpen && (
                          <div className="bg-white flex flex-col py-1 ml-6 border-l border-gray-200">
                            {loadingKey === key && (
                              <p className="text-[11px] text-gray-500 px-4 py-2">
                                Loading products...
                              </p>
                            )}

                            {errorKey === key && (
                              <p className="text-[11px] text-red-600 px-4 py-2">
                                Failed to load products
                              </p>
                            )}

                            {productsByKey[key]?.map(product => (
                              <Link
                                key={product._id}
                                href={`/products/${product._id}`}
                                className="block text-[11px] truncate text-gray-600 px-4 py-1.5 hover:text-[#5A946A] hover:bg-gray-50 transition-colors"
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
                  <div className="bg-gray-50 flex flex-col py-2 border-t border-black/10">
                    {productsByKey[category.name].map(product => (
                      <Link
                        key={product._id}
                        href={`/products/${product._id}`}
                        className="block text-[11px] truncate text-gray-600 px-6 py-1.5 hover:text-[#5A946A] hover:bg-white transition-colors"
                      >
                        • {product.name}
                      </Link>
                    ))}
                  </div>
                )}

              {isOpen && !category.subcategories?.length && loadingKey === category.name && (
                <p className="bg-gray-50 text-[11px] text-gray-500 px-6 py-3 border-t border-black/10">
                  Loading products...
                </p>
              )}

              {isOpen && !category.subcategories?.length && errorKey === category.name && (
                <p className="bg-gray-50 text-[11px] text-red-600 px-6 py-3 border-t border-black/10">
                  Failed to load products
                </p>
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}
