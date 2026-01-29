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
    (process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:5000'

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
    <aside className="w-64 bg-white border-r">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-5 tracking-tight">
          Categories
        </h2>

        <div className="space-y-3">
          {categories.map(category => {
            const isOpen = expandedCategory === category.name

            return (
              <div key={category._id}>
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
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-md text-sm font-medium transition
                    ${
                      isOpen
                        ? 'bg-primary text-white'
                        : 'bg-muted hover:bg-muted/70'
                    }`}
                >
                  <span>{category.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs opacity-80">
                      {category.count ?? 0}
                    </span>
                    {isOpen ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </div>
                </button>

                {/* SUBCATEGORIES */}
                {isOpen && category.subcategories?.length > 0 && (
                  <div className="mt-2 ml-3 pl-3 border-l space-y-2">
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
                            className={`w-full text-left text-xs py-1 transition font-medium
                              ${
                                subOpen
                                  ? 'text-primary'
                                  : 'text-muted-foreground hover:text-primary'
                              }`}
                          >
                            {sub}
                          </button>

                          {/* PRODUCTS */}
                          {subOpen && (
                            <div className="mt-2 ml-3 space-y-1">
                              {loadingKey === key && (
                                <p className="text-xs text-muted-foreground">
                                  Loading…
                                </p>
                              )}

                              {errorKey === key && (
                                <p className="text-xs text-red-600">
                                  Failed to load products
                                </p>
                              )}

                              {productsByKey[key]?.map(product => (
                                <Link
                                  key={product._id}
                                  href={`/products/${product._id}`}
                                  className="block text-sm truncate hover:text-primary"
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
                    <div className="mt-2 ml-3 space-y-1">
                      {productsByKey[category.name].map(product => (
                        <Link
                          key={product._id}
                          href={`/products/${product._id}`}
                          className="block text-sm truncate hover:text-primary"
                        >
                          {product.name}
                        </Link>
                      ))}
                    </div>
                  )}

                {isOpen && loadingKey === category.name && (
                  <p className="mt-2 ml-3 text-xs text-muted-foreground">
                    Loading…
                  </p>
                )}

                {isOpen && errorKey === category.name && (
                  <p className="mt-2 ml-3 text-xs text-red-600">
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
