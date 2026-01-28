'use client'

import Header from '@/components/header'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Star, Heart, Share2, CheckCircle, Truck, Shield, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import useCart from '@/hooks/use-cart'
import { formatPrice } from '@/lib/currency'

interface Product {
  id: string
  name: string
  price: number
  discountPrice?: number
  discountPercentage?: number
  image: string
  images?: string[]
  category: string
  rating: number
  reviewCount: number
  stock: number
  description: string
  features?: string[]
  specifications?: Record<string, string>
  warranty?: string
  manufacturerInfo?: string
}

const PRODUCT: Product = {
  id: '1',
  name: 'Fetal Doppler Ultrasound',
  price: 45000,
  discountPercentage: 20,
  discountPrice: 36000,
  image: 'https://images.unsplash.com/photo-1631217314830-4db48516e8ab?w=800&h=800&fit=crop',
  images: [
    'https://images.unsplash.com/photo-1631217314830-4db48516e8ab?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=800&fit=crop',
  ],
  category: 'Diagnostic Equipment',
  rating: 4.5,
  reviewCount: 128,
  stock: 45,
  description: 'Professional grade fetal doppler for detecting fetal heartbeat. Features advanced ultrasound technology with clear audio output.',
  features: [
    'Professional grade ultrasound probe',
    'Clear digital display',
    'Built-in speaker with volume control',
    'Automatic frequency tuning',
    'Low power consumption',
    'Portable and lightweight',
  ],
  specifications: {
    'Operating Frequency': '2 MHz',
    'Display': 'Digital LED',
    'Battery Life': '12 hours',
    'Weight': '250g',
    'Power': 'AC/Battery',
    'Warranty': '2 years',
  },
  warranty: '2 Year Manufacturer Warranty',
  manufacturerInfo: 'Made by premium medical equipment manufacturer',
}

const SIMILAR_PRODUCTS: Product[] = [
  {
    id: '2',
    name: 'Fetal Doppler',
    price: 35000,
    discountPercentage: 15,
    image: 'https://images.unsplash.com/photo-1631217314830-4db48516e8ab?w=300&h=300&fit=crop',
    category: 'Diagnostic Equipment',
    rating: 4.3,
    reviewCount: 95,
    stock: 20,
    description: 'Professional fetal doppler',
  },
  {
    id: '3',
    name: 'Fetal Doppler Pro',
    price: 55000,
    discountPercentage: 10,
    image: 'https://images.unsplash.com/photo-1631217314830-4db48516e8ab?w=300&h=300&fit=crop',
    category: 'Diagnostic Equipment',
    rating: 4.8,
    reviewCount: 156,
    stock: 15,
    description: 'Advanced fetal doppler with LED screen',
  },
  {
    id: '4',
    name: 'Portable Ultrasound',
    price: 95000,
    discountPercentage: 5,
    image: 'https://images.unsplash.com/photo-1631217314830-4db48516e8ab?w=300&h=300&fit=crop',
    category: 'Diagnostic Equipment',
    rating: 4.6,
    reviewCount: 203,
    stock: 8,
    description: 'Portable ultrasound system',
  },
]

export default function ProductDetailPage() {
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()
  const [selectedImage, setSelectedImage] = useState(0)
  const [liked, setLiked] = useState(false)
  const [activeTab, setActiveTab] = useState('description')

  const handleShare = async () => {
    try {
      const url = window.location.href
      if (navigator.share) {
        await navigator.share({ title: PRODUCT.name, text: PRODUCT.description, url })
      } else {
        await navigator.clipboard.writeText(url)
        alert('Product link copied to clipboard')
      }
    } catch (e) {
      alert('Unable to share the product')
    }
  }

  const discountedPrice = PRODUCT.discountPercentage
    ? PRODUCT.price * (1 - PRODUCT.discountPercentage / 100)
    : PRODUCT.price

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex gap-2 text-xs mb-8">
            <Link href="/" className="text-gray-500 hover:text-primary">Home</Link>
            <span className="text-gray-300">/</span>
            <Link href="/products" className="text-gray-500 hover:text-primary">Products</Link>
            <span className="text-gray-300">/</span>
            <span className="text-foreground">{PRODUCT.name}</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Product Images */}
            <div>
              <div className="relative mb-4 bg-gray-50 rounded-lg overflow-hidden aspect-square flex items-center justify-center">
                <img
                  src={PRODUCT.images?.[selectedImage] || PRODUCT.image}
                  alt={PRODUCT.name}
                  className="w-full h-full object-cover"
                />
                {PRODUCT.discountPercentage && (
                  <div className="absolute top-4 right-4 bg-accent text-white rounded-full w-14 h-14 flex items-center justify-center font-bold text-lg">
                    {PRODUCT.discountPercentage}%
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {PRODUCT.images && PRODUCT.images.length > 1 && (
                <div className="flex gap-2">
                  {PRODUCT.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                        selectedImage === idx ? 'border-primary' : 'border-gray-200'
                      }`}
                    >
                      <img src={img || "/placeholder.svg"} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              {/* Category & Rating */}
              <p className="text-xs text-gray-500 mb-2">{PRODUCT.category}</p>

              {/* Title */}
              <h1 className="text-3xl font-bold mb-4">{PRODUCT.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(PRODUCT.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">{PRODUCT.rating} ({PRODUCT.reviewCount} reviews)</span>
              </div>

              {/* Price */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-baseline gap-3">
                  <p className="text-3xl font-bold text-primary">{formatPrice(discountedPrice)}</p>
                  {PRODUCT.discountPercentage && (
                    <p className="text-lg line-through text-gray-400">{formatPrice(PRODUCT.price)}</p>
                  )}
                </div>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 mb-6">
                {PRODUCT.stock > 0 ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-green-600">In Stock ({PRODUCT.stock} available)</span>
                  </>
                ) : (
                  <span className="text-sm text-red-600">Out of Stock</span>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">{PRODUCT.description}</p>

              {/* Quantity & Actions */}
              <div className="flex gap-4 mb-6">
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-100"
                  >
                    −
                  </button>
                  <span className="px-6 py-2 font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>

                <Button
                  onClick={() =>
                    addItem(
                      {
                        id: PRODUCT.id,
                        name: PRODUCT.name,
                        price: discountedPrice,
                        image: PRODUCT.image,
                        quantity,
                      },
                      quantity
                    )
                  }
                  className="flex-1 bg-primary hover:bg-primary/90 text-white"
                >
                  Add to Cart
                </Button>

                <button
                  onClick={() => setLiked(!liked)}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <Heart className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </button>

                <button onClick={handleShare} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" />
                  <div className="text-xs">
                    <p className="font-semibold">Fast Shipping</p>
                    <p className="text-gray-600">2-3 days</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <div className="text-xs">
                    <p className="font-semibold">Secure</p>
                    <p className="text-gray-600">Verified seller</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-primary" />
                  <div className="text-xs">
                    <p className="font-semibold">Returns</p>
                    <p className="text-gray-600">30 days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="mb-16">
            <div className="flex gap-8 border-b mb-6">
              {['description', 'specifications', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-1 border-b-2 transition font-medium text-sm capitalize ${
                    activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Description Tab */}
            {activeTab === 'description' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-lg mb-3">Product Features</h3>
                  <ul className="space-y-2">
                    {PRODUCT.features?.map((feature, idx) => (
                      <li key={idx} className="flex gap-3 text-sm">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-3">Warranty & Support</h3>
                  <p className="text-sm text-gray-600">{PRODUCT.warranty}</p>
                </div>
              </div>
            )}

            {/* Specifications Tab */}
            {activeTab === 'specifications' && (
              <div>
                <table className="w-full">
                  <tbody>
                    {Object.entries(PRODUCT.specifications || {}).map(([key, value]) => (
                      <tr key={key} className="border-b">
                        <td className="py-3 font-semibold text-sm text-gray-700 w-40">{key}</td>
                        <td className="py-3 text-sm text-gray-600">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-lg mb-4">Customer Reviews</h3>
                  <div className="space-y-4">
                    {[1, 2, 3].map((review) => (
                      <div key={review} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold text-sm">Customer {review}</p>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">2 weeks ago</span>
                        </div>
                        <p className="text-sm text-gray-600">Great product! Very satisfied with the quality.</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Write Review */}
                <Button className="bg-primary hover:bg-primary/90">Write a Review</Button>
              </div>
            )}
          </div>

          {/* Similar Products */}
          <div>
            <h2 className="text-2xl font-bold mb-6 tracking-tight">Similar Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {SIMILAR_PRODUCTS.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <Card className="border border-gray-300 rounded-xl overflow-hidden hover:shadow-md transition cursor-pointer h-full flex flex-col">
                    <div className="relative aspect-square overflow-hidden bg-gray-100 flex items-center justify-center">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {product.discountPercentage && (
                        <div className="absolute top-3 right-3 bg-accent text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-xs">
                          {product.discountPercentage}%
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <p className="text-xs text-gray-500 mb-1">{product.category}</p>
                      <h3 className="font-medium text-gray-800 text-xs mb-3 tracking-tight">{product.name}</h3>
                      <div className="flex items-center gap-1 mb-3">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">({product.reviewCount})</span>
                      </div>
                      <div className="flex-1" />
                      <p className="text-sm font-bold text-primary">
                        {formatPrice(product.price * (1 - (product.discountPercentage || 0) / 100))}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
