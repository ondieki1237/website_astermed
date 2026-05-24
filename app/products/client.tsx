'use client'

import Header from '@/components/header'
import Footer from '@/components/footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { formatPrice } from '@/lib/currency'
import { resolveImageSrc } from '@/lib/image'
import { Star } from 'lucide-react'
import type { CatalogCategory, CatalogProduct } from '@/lib/static-catalog'

interface Product {
  _id: string
  id: string
  name: string
  price: number
  image: string
  category: string
  rating: number
  isOnOffer?: boolean
  discountPercentage?: number
}

interface ProductsContentProps {
  initialProducts: CatalogProduct[]
  initialCategories: CatalogCategory[]
  initialCategory?: string
  initialSearch?: string
}

export function ProductsContent({
  initialProducts,
  initialCategories,
  initialCategory = 'All Categories',
  initialSearch = '',
}: ProductsContentProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [sortBy, setSortBy] = useState('popular')
  const categories = ['All Categories', ...initialCategories.map((category) => category.name)]

  const products = useMemo(() => {
    const filtered = initialProducts.filter((product) => {
      const matchesCategory =
        selectedCategory === 'All Categories' || product.category === selectedCategory
      const haystack = [
        product.name,
        product.description,
        product.category,
        product.subcategory,
        ...(product.tags || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      const matchesSearch = !searchQuery.trim() || haystack.includes(searchQuery.trim().toLowerCase())
      return matchesCategory && matchesSearch
    })

    return [...filtered].sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
      if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0)
      if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0)
      return (b.reviewCount || 0) - (a.reviewCount || 0) || (b.views || 0) - (a.views || 0)
    })
  }, [initialProducts, searchQuery, selectedCategory, sortBy])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Medical Supplies</h1>
          <p className="text-muted-foreground">Browse our complete catalog of medical equipment and supplies</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <Card className="p-6 border-none shadow-md">
              <h3 className="font-bold text-lg mb-4">Filters</h3>

              {/* Search */}
              <div className="mb-6">
                <label className="text-sm font-semibold mb-2 block">Search</label>
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-input border-border"
                />
              </div>

              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Sort and View Options */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-muted-foreground">
                Showing {products.length} products
              </p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Products */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.length > 0 ? (
                products.map((product) => (
                  <Link key={product._id} href={`/products/${product.slug || product.id || product._id}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition transform hover:scale-105 h-full cursor-pointer">
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        <img src={resolveImageSrc(product.image)} alt={product.name} className="w-full h-full object-cover" />
                        {product.isOnOffer && (
                          <div className="absolute top-3 right-3 bg-accent text-white px-3 py-1 rounded-lg font-bold">
                            -{product.discountPercentage}%
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-muted-foreground mb-2">{product.category}</p>
                        <h3 className="font-bold text-lg mb-2 line-clamp-2">{product.name}</h3>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center">
                            {Array(5).fill(0).map((_, i) => (
                              <span
                                key={i}
                                className={i < Math.floor(product.rating) ? 'text-accent' : 'text-muted'}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">({product.rating})</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            {product.isOnOffer ? (
                              <>
                                <p className="text-lg font-bold text-accent">
                                  {formatPrice(product.price * (1 - (product.discountPercentage || 0) / 100))}
                                </p>
                                <p className="text-sm line-through text-muted-foreground">{formatPrice(product.price)}</p>
                              </>
                            ) : (
                              <p className="text-lg font-bold">{formatPrice(product.price)}</p>
                            )}
                          </div>
                          <span className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
                            View
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No products found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
