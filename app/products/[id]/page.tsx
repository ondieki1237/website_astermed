 'use client'

import Header from '@/components/header'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Star, Heart, Share2, CheckCircle, Truck, Shield, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import useCart from '@/hooks/use-cart'
import { formatPrice } from '@/lib/currency'
import { resolveImageSrc } from '@/lib/image'
import { getApiBase } from '@/lib/api'

interface Product {
  _id: string
  name: string
  price: number
  discountPrice?: number
  discountPercentage?: number
  image?: string
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

export default function ProductDetailPage() {
  const params = useParams()
  const id = params?.id
  const [product, setProduct] = useState<Product | null>(null)
  const [similarProducts, setSimilarProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // UI state/hooks should be declared before any early returns
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()
  const [selectedImage, setSelectedImage] = useState(0)
  const [liked, setLiked] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewForm, setReviewForm] = useState({ username: '', rating: 5, comment: '' })

  useEffect(() => {
    if (!id) return
    const API_BASE = getApiBase()
    setLoading(true)
    fetch(`${API_BASE}/api/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Product not found')
        return res.json()
      })
      .then((data) => {
        // API returns { product, similarProducts, analytics }
        setProduct(data.product || data)
        setSimilarProducts(data.similarProducts || [])
      })
      .catch((err) => {
        console.error(err)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-8">Loading...</div>
  if (!product) return <div className="p-8">Product not found</div>
 

  const handleShare = async () => {
    try {
      const url = window.location.href
      if (navigator.share) {
        await navigator.share({ title: product!.name, text: product!.description, url })
      } else {
        await navigator.clipboard.writeText(url)
        alert('Product link copied to clipboard')
      }
    } catch (e) {
      alert('Unable to share the product')
    }
  }

  async function submitReview() {
    if (!product) return
    setReviewSubmitting(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
      const API_BASE = (process.env.NEXT_PUBLIC_API_URL as string) || 'https://astermed.codewithseth.co.ke'
      const res = await fetch(`${API_BASE}/api/products/${product._id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ username: reviewForm.username || 'Anonymous', rating: reviewForm.rating, comment: reviewForm.comment }),
      })
      if (!res.ok) throw new Error('Failed')
      const updated = await res.json()
      // server returns updated product
      setProduct(updated)
      setShowReviewModal(false)
      setReviewForm({ username: '', rating: 5, comment: '' })
    } catch (e) {
      alert('Failed to submit review')
    } finally {
      setReviewSubmitting(false)
    }
  }

  const discountedPrice = product && product.discountPercentage
    ? product.price * (1 - product.discountPercentage / 100)
    : (product ? product.price : 0)

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-[#f9fbff] to-white">
      <Header />

      <main className="flex-1 px-4 md:px-8 py-8 pt-24 lg:pt-28">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex gap-2 text-sm mb-8 items-center">
            <Link href="/" className="text-gray-500 hover:text-[#1f2a7c] transition-colors">Home</Link>
            <span className="text-gray-300">•</span>
            <Link href="/products" className="text-gray-500 hover:text-[#1f2a7c] transition-colors">Products</Link>
            <span className="text-gray-300">•</span>
            <span className="text-[#1f2a7c] font-medium truncate max-w-xs">{product!.name}</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 mb-16">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative bg-gradient-to-br from-white to-[#f9fbff] rounded-2xl overflow-hidden aspect-square flex items-center justify-center p-8 shadow-xl border border-gray-100 group">
                <img
                  src={resolveImageSrc(product!.images?.[selectedImage] || product!.image)}
                  alt={product!.name}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
                {product!.discountPercentage && (
                  <div className="absolute top-6 right-6 bg-gradient-to-br from-[#e53935] to-[#d32f2f] text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-lg shadow-xl animate-pulse">
                    -{product!.discountPercentage}%
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {product!.images && product!.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                      {product!.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        selectedImage === idx 
                          ? 'border-[#1f2a7c] shadow-lg shadow-[#1f2a7c]/20 scale-105' 
                          : 'border-gray-200 hover:border-[#1f2a7c]/50 hover:shadow-md'
                      }`}
                    >
                          <img src={resolveImageSrc(img)} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Category Badge */}
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-[#1f2a7c]/10 to-[#2535a0]/10 text-[#1f2a7c] rounded-full text-sm font-semibold">
                {product!.category}
              </div>

              {/* Title */}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">{product!.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(product!.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">{product!.rating} ({product!.reviewCount} reviews)</span>
              </div>

              {/* Price */}
              <div className="p-6 bg-gradient-to-br from-[#f9fbff] to-white rounded-2xl border border-gray-100 shadow-lg">
                <div className="flex items-baseline gap-4">
                  <p className="text-4xl font-bold text-[#1f2a7c]">{formatPrice(discountedPrice)}</p>
                  {product!.discountPercentage && (
                    <div>
                      <p className="text-xl line-through text-gray-400">{formatPrice(product!.price)}</p>
                      <p className="text-sm text-[#e53935] font-semibold">Save {product!.discountPercentage}%</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100">
                {product!.stock > 0 ? (
                  <>
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-green-700">In Stock</p>
                      <p className="text-xs text-gray-600">{product!.stock} units available</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <span className="text-sm font-semibold text-red-600">Out of Stock</span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed">{product!.description}</p>

              {/* Quantity & Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center border-2 border-gray-200 rounded-xl bg-white shadow-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-5 py-3 hover:bg-gray-50 transition-colors text-lg font-semibold text-gray-600"
                  >
                    −
                  </button>
                  <span className="px-6 py-3 font-bold text-lg min-w-[60px] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-5 py-3 hover:bg-gray-50 transition-colors text-lg font-semibold text-gray-600"
                  >
                    +
                  </button>
                </div>

                <Button
                  onClick={() =>
                    addItem(
                      {
                        id: product!._id,
                        name: product!.name,
                        price: discountedPrice,
                        image: product!.image,
                        quantity,
                      },
                      quantity
                    )
                  }
                  className="flex-1 bg-gradient-to-r from-[#1f2a7c] to-[#2535a0] hover:shadow-xl hover:scale-105 transition-all duration-200 text-white py-6 text-lg font-bold rounded-xl"
                >
                  Add to Cart
                </Button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setLiked(!liked)}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-[#1f2a7c] transition-all duration-200 flex items-center justify-center gap-2 group"
                >
                  <Heart className={`w-5 h-5 transition-all duration-200 ${liked ? 'fill-[#e53935] text-[#e53935]' : 'text-gray-600 group-hover:text-[#e53935]'}`} />
                  <span className="font-medium text-sm">{liked ? 'Saved' : 'Save'}</span>
                </button>

                <button onClick={handleShare} className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-[#1f2a7c] transition-all duration-200 flex items-center justify-center gap-2 group">
                  <Share2 className="w-5 h-5 text-gray-600 group-hover:text-[#1f2a7c] transition-colors" />
                  <span className="font-medium text-sm">Share</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 p-6 bg-gradient-to-br from-white to-[#f9fbff] rounded-2xl border border-gray-100 shadow-md">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#1f2a7c]/10 to-[#2535a0]/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Truck className="w-6 h-6 text-[#1f2a7c]" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">Fast Shipping</p>
                    <p className="text-xs text-gray-600">2-3 business days</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#1f2a7c]/10 to-[#2535a0]/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Shield className="w-6 h-6 text-[#1f2a7c]" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">Secure Payment</p>
                    <p className="text-xs text-gray-600">Verified seller</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#1f2a7c]/10 to-[#2535a0]/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <RotateCcw className="w-6 h-6 text-[#1f2a7c]" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">Easy Returns</p>
                    <p className="text-xs text-gray-600">30 days policy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="mb-16 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="flex gap-0 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              {['description', 'specifications', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-8 border-b-2 transition-all duration-200 font-semibold text-sm capitalize relative ${
                    activeTab === tab 
                      ? 'border-[#1f2a7c] text-[#1f2a7c] bg-white' 
                      : 'border-transparent text-gray-500 hover:text-[#1f2a7c] hover:bg-white/50'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#1f2a7c] to-[#e53935]"></div>
                  )}
                </button>
              ))}
            </div>

            <div className="p-8">
            {/* Description Tab */}
            {activeTab === 'description' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="font-bold text-xl mb-4 text-gray-900">Product Features</h3>
                  <ul className="space-y-3">
                    {product!.features?.map((feature, idx) => (
                      <li key={idx} className="flex gap-3">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="font-bold text-xl mb-4 text-gray-900">Warranty & Support</h3>
                  <p className="text-gray-700 leading-relaxed">{product!.warranty}</p>
                </div>
              </div>
            )}

            {/* Specifications Tab */}
            {activeTab === 'specifications' && (
              <div className="animate-fade-in">
                <table className="w-full">
                  <tbody>
                    {Object.entries(product!.specifications || {}).map(([key, value]) => (
                      <tr key={key} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 font-semibold text-gray-700 w-1/3">{key}</td>
                        <td className="py-4 text-gray-600">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="font-bold text-xl mb-6 text-gray-900">Customer Reviews</h3>
                  <div className="space-y-4">
                    {product!.reviews && product!.reviews.length > 0 ? (
                      product!.reviews.map((review: any, idx: number) => (
                        <div key={idx} className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow bg-gradient-to-br from-white to-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-semibold text-gray-900">{review.username || 'Customer'}</p>
                              <div className="flex items-center gap-1 mt-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(review.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                ))}
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">{new Date(review.createdAt || Date.now()).toLocaleDateString()}</span>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <p className="text-lg mb-2">No reviews yet</p>
                        <p className="text-sm">Be the first to review this product!</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Write Review */}
                <Button className="bg-gradient-to-r from-[#1f2a7c] to-[#2535a0] hover:shadow-xl transition-all duration-200 text-white font-bold rounded-xl" onClick={() => setShowReviewModal(true)}>Write a Review</Button>
              </div>
            )}
            </div>
          </div>

          {/* Similar Products */}
          <div>
            <h2 className="text-2xl font-bold mb-6 tracking-tight">Similar Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {similarProducts.map((product) => (
                <Link key={product._id} href={`/products/${product._id}`}>
                  <Card className="border border-gray-300 rounded-xl overflow-hidden hover:shadow-md transition cursor-pointer h-full flex flex-col">
                    <div className="relative aspect-square overflow-hidden bg-gray-100 flex items-center justify-center">
                          <img
                            src={resolveImageSrc(product!.image)}
                            alt={product!.name}
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

      {/* Sticky Add to Cart bar for quick purchase */}
      <div className="fixed left-4 right-4 bottom-4 z-50 lg:left-auto lg:right-12 lg:bottom-8">
        <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-lg p-3 shadow-lg flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src={resolveImageSrc(product!.image)} alt={product!.name} className="w-16 h-16 object-cover rounded" />
            <div>
              <div className="text-sm font-medium">{product!.name}</div>
              <div className="text-sm text-gray-600">{formatPrice(discountedPrice)}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => addItem({ id: product!._id, name: product!.name, price: discountedPrice, image: product!.image }, quantity)} className="bg-primary text-white px-4 py-2 rounded-md">Add to Cart</button>
            <Link href={`/products/${product!._id}`} className="border border-gray-300 px-4 py-2 rounded-md">View</Link>
          </div>
        </div>
      </div>

      <Footer />

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg w-full max-w-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Write a Review</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-gray-500">Close</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm block mb-1">Name</label>
                <input value={reviewForm.username} onChange={(e) => setReviewForm(f => ({ ...f, username: e.target.value }))} className="w-full border px-3 py-2 rounded" />
              </div>
              <div>
                <label className="text-sm block mb-1">Rating</label>
                <select value={String(reviewForm.rating)} onChange={(e) => setReviewForm(f => ({ ...f, rating: parseInt(e.target.value, 10) }))} className="w-24 border px-3 py-2 rounded">
                  {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} stars</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm block mb-1">Comment</label>
                <textarea value={reviewForm.comment} onChange={(e) => setReviewForm(f => ({ ...f, comment: e.target.value }))} className="w-full border px-3 py-2 rounded" rows={5} />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setShowReviewModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button onClick={submitReview} disabled={reviewSubmitting} className="px-4 py-2 bg-primary text-white rounded">{reviewSubmitting ? 'Submitting...' : 'Submit Review'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
