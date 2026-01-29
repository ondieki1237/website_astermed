'use client'

import Header from '@/components/header'
import Footer from '@/components/footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import CategorySidebar from '@/components/category-sidebar'
import { formatPrice } from '@/lib/currency'
import { resolveImageSrc } from '@/lib/image'
import { Star } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  rating: number
  isOnOffer?: boolean
  discountPercentage?: number
}

const CATEGORIES = [
  'All Categories',
  'Diagnostic Equipment',
  'Surgical Supplies',
  'Personal Protection',
  'Patient Care',
  'Laboratory Equipment',
  'Mobility Aids',
]

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Digital Blood Pressure Monitor',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1631217314830-4db48516e8ab?w=400&h=400&fit=crop',
    category: 'Diagnostic Equipment',
    rating: 4.5,
    isOnOffer: true,
    discountPercentage: 20,
  },
  {
    id: '2',
    name: 'Surgical Face Masks (Box of 50)',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5f83f43ce?w=400&h=400&fit=crop',
    category: 'Personal Protection',
    rating: 4.8,
  },
  {
    id: '3',
    name: 'Stethoscope Professional Grade',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1631217314830-4db48516e8ab?w=400&h=400&fit=crop',
    category: 'Diagnostic Equipment',
    rating: 4.9,
    isOnOffer: true,
    discountPercentage: 15,
  },
  {
    id: '4',
    name: 'Thermometer Digital Infrared',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1631217314830-4db48516e8ab?w=400&h=400&fit=crop',
    category: 'Diagnostic Equipment',
    rating: 4.6,
  },
  {
    id: '5',
    name: 'Medical Gloves Latex-Free',
    price: 19.99,
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=400&fit=crop',
    category: 'Personal Protection',
    rating: 4.7,
  },
  {
    id: '6',
    name: 'Hospital Bed Rail Safety',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=400&fit=crop',
    category: 'Patient Care',
    rating: 4.4,
  },
  {
    id: '7',
    name: 'Pulse Oximeter Portable',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1631217314830-4db48516e8ab?w=400&h=400&fit=crop',
    category: 'Diagnostic Equipment',
    rating: 4.8,
  },
  {
    id: '8',
    name: 'Surgical Scissors Set',
    price: 45.99,
    image: 'https://images.unsplash.com/photo-1631217314830-4db48516e8ab?w=400&h=400&fit=crop',
    category: 'Surgical Supplies',
    rating: 4.6,
  },
  {
    id: '9',
    name: 'Laboratory Centrifuge',
    price: 1299.99,
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=400&fit=crop',
    category: 'Laboratory Equipment',
    rating: 4.9,
  },
  {
    id: '10',
    name: 'Wheelchair Standard',
    price: 899.99,
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=400&fit=crop',
    category: 'Mobility Aids',
    rating: 4.7,
  },
  {
    id: '11',
    name: 'Walker Adjustable Aluminum',
    price: 249.99,
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=400&fit=crop',
    category: 'Mobility Aids',
    rating: 4.5,
  },
  {
    id: '12',
    name: 'Crutches Pair',
    price: 99.99,
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=400&fit=crop',
    category: 'Mobility Aids',
    rating: 4.6,
  },
]

export function ProductsContent() {
  const searchParams = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('popular')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const category = searchParams.get('category')
    if (category) {
      setSelectedCategory(decodeURIComponent(category))
    }
    const s = searchParams.get('search')
    if (s) setSearchQuery(decodeURIComponent(s))
  }, [searchParams])

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5088'
        const params = new URLSearchParams()
        params.set('limit', '48')
        if (searchQuery) params.set('search', searchQuery)
        if (selectedCategory && selectedCategory !== 'All Categories') params.set('category', selectedCategory)
        // map sortBy to backend sort query if needed
        const res = await fetch(`${API_BASE}/api/products?${params.toString()}`)
        if (!res.ok) throw new Error('Failed to load')
        const data = await res.json()
        setProducts((data && data.products) ? data.products : data || [])
      } catch (e) {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [selectedCategory, searchQuery, sortBy, searchParams])

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

              <CategorySidebar />

              {/* Price Range */}
              <div className="mb-6">
                <label className="text-sm font-semibold mb-4 block">Price Range</label>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" /> Under $50
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" /> $50 - $200
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" /> $200 - $500
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" /> Over $500
                  </label>
                </div>
              </div>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Sort and View Options */}
            <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground">
                Showing {loading ? '...' : products.length} products
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
                products.map((product: any) => (
                  <Link key={product._id} href={`/products/${product._id}`}>
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
                          <Button size="sm" className="bg-primary hover:bg-primary/90">Add</Button>
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
