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
    const API_BASE = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:5000'
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
      const API_BASE = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:5000'
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
            <span className="text-foreground">{product!.name}</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Product Images */}
            <div>
              <div className="relative mb-4 bg-gray-50 rounded-lg overflow-hidden aspect-square flex items-center justify-center">
                <img
                  src={resolveImageSrc(product!.images?.[selectedImage] || product!.image)}
                  alt={product!.name}
                  className="w-full h-full object-cover"
                />
                {product!.discountPercentage && (
                  <div className="absolute top-4 right-4 bg-accent text-white rounded-full w-14 h-14 flex items-center justify-center font-bold text-lg">
                    {product!.discountPercentage}%
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {product!.images && product!.images.length > 1 && (
                <div className="flex gap-2">
                      {product!.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                        selectedImage === idx ? 'border-primary' : 'border-gray-200'
                      }`}
                    >
                          <img src={resolveImageSrc(img)} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              {/* Category & Rating */}
              <p className="text-xs text-gray-500 mb-2">{product!.category}</p>

              {/* Title */}
              <h1 className="text-3xl font-bold mb-4">{product!.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product!.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">{product!.rating} ({product!.reviewCount} reviews)</span>
              </div>

              {/* Price */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-baseline gap-3">
                  <p className="text-3xl font-bold text-primary">{formatPrice(discountedPrice)}</p>
                  {product!.discountPercentage && (
                    <p className="text-lg line-through text-gray-400">{formatPrice(product!.price)}</p>
                  )}
                </div>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 mb-6">
                {product!.stock > 0 ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-green-600">In Stock ({product!.stock} available)</span>
                  </>
                ) : (
                  <span className="text-sm text-red-600">Out of Stock</span>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">{product!.description}</p>

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
                        id: product!._id,
                        name: product!.name,
                        price: discountedPrice,
                        image: product!.image,
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
                    {product!.features?.map((feature, idx) => (
                      <li key={idx} className="flex gap-3 text-sm">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-3">Warranty & Support</h3>
                  <p className="text-sm text-gray-600">{product!.warranty}</p>
                </div>
              </div>
            )}

            {/* Specifications Tab */}
            {activeTab === 'specifications' && (
              <div>
                <table className="w-full">
                  <tbody>
                    {Object.entries(product!.specifications || {}).map(([key, value]) => (
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
                    {product!.reviews && product!.reviews.length > 0 ? (
                      product!.reviews.map((review: any, idx: number) => (
                        <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-semibold text-sm">{review.username || 'Customer'}</p>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`w-3 h-3 ${i < Math.floor(review.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                ))}
                              </div>
                            </div>
                            <span className="text-xs text-gray-500">{new Date(review.createdAt || Date.now()).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-gray-600">{review.comment}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">No reviews yet.</div>
                    )}
                  </div>
                </div>

                {/* Write Review (requires auth) */}
                <Button className="bg-primary hover:bg-primary/90" onClick={() => setShowReviewModal(true)}>Write a Review</Button>
              </div>
            )}
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
