'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

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
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [productsByKey, setProductsByKey] = useState<Record<string, ProductItem[]>>({})
  const [loadingKey, setLoadingKey] = useState<string | null>(null)
  const [errorKey, setErrorKey] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const API_BASE = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:5000'
        const res = await fetch(`${API_BASE}/api/categories`)
        if (!res.ok) return
        const data = await res.json()
        setCategories(data || [])
      } catch (e) {
        // ignore
      }
    }
    load()
  }, [])

  return (
    <aside className="w-64 bg-white">
      <div className="p-6">
        <h2 className="text-lg font-bold text-foreground mb-6 tracking-tight">Category</h2>
        <div className="space-y-3">
          {categories.length === 0 && (
            <div className="text-sm text-muted-foreground">No categories yet.</div>
          )}
          {categories.map((category) => (
            <div key={category.name}>
              <button
                onClick={() => {
                  // Toggle expansion for categories with subcategories; otherwise load products inline
                  if (category.subcategories && category.subcategories.length > 0) {
                    setExpandedCategory(expandedCategory === category.name ? null : category.name)
                  } else {
                    // load products for this category and expand
                    const key = category.name
                    setExpandedCategory(category.name)
                    if (productsByKey[key]) return
                    setLoadingKey(key)
                    setErrorKey(null)
                    const API_BASE = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:5000'
                    fetch(`${API_BASE}/api/products?category=${encodeURIComponent(category.name)}&limit=20`)
                      .then(res => res.ok ? res.json() : Promise.reject())
                      .then(data => {
                        const items = data.products || data
                        setProductsByKey(prev => ({ ...prev, [key]: items }))
                      })
                      .catch(() => setErrorKey(key))
                      .finally(() => setLoadingKey(null))
                  }
                }}
                className="w-full flex items-center justify-between bg-primary text-white px-4 py-2.5 font-medium text-sm hover:bg-primary/90 transition tracking-tight"
              >
                <span>{category.name}</span>
                <span className="text-xs">{category.count ?? 0}</span>
              </button>

              {/* If category has subcategories, show them (and allow loading per subcategory) */}
              {expandedCategory === category.name && category.subcategories && category.subcategories.length > 0 && (
                <div className="mt-2 ml-3 space-y-1.5 border-l border-gray-300 pl-3">
                  {category.subcategories.map((sub) => (
                    <div key={sub}>
                      <button
                        className="block text-xs text-gray-600 hover:text-primary font-light transition w-full text-left"
                        onClick={() => {
                          const key = `${category.name}::${sub}`
                          if (productsByKey[key]) {
                            // toggle collapse if already loaded
                            setExpandedCategory(prev => (prev === category.name ? category.name : category.name))
                            return
                          }
                          setLoadingKey(key)
                          setErrorKey(null)
                          const API_BASE = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:5000'
                          fetch(`${API_BASE}/api/products?category=${encodeURIComponent(category.name)}&subcategory=${encodeURIComponent(sub)}&limit=20`)
                            .then(res => res.ok ? res.json() : Promise.reject())
                            .then(data => {
                              const items = data.products || data
                              setProductsByKey(prev => ({ ...prev, [key]: items }))
                            })
                            .catch(() => setErrorKey(key))
                            .finally(() => setLoadingKey(null))
                        }}
                      >
                        {sub}
                      </button>

                      {productsByKey[`${category.name}::${sub}`] && (
                        <div className="mt-2 ml-3 grid grid-cols-1 gap-2">
                          {productsByKey[`${category.name}::${sub}`].map(p => (
                            <div key={p._id} className="text-sm">
                              <Link href={`/products/${p._id}`} className="block truncate text-base font-medium hover:text-primary">
                                {p.name}
                              </Link>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* If category has no subcategories, show inline products when loaded */}
              {expandedCategory === category.name && productsByKey[category.name] && (
                <div className="mt-2 ml-3 grid grid-cols-1 gap-2">
                  {productsByKey[category.name].map(p => (
                    <div key={p._id} className="text-sm">
                      <Link href={`/products/${p._id}`} className="block truncate text-base font-medium hover:text-primary">
                        {p.name}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
              {expandedCategory === category.name && loadingKey === category.name && (
                <div className="mt-2 ml-3 text-sm text-muted-foreground">Loading...</div>
              )}
              {expandedCategory === category.name && errorKey === category.name && (
                <div className="mt-2 ml-3 text-sm text-red-600">Failed to load products</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
