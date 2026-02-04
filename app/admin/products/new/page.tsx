"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://astermed.codewithseth.co.ke'

export default function NewProductPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [stock, setStock] = useState('0')
  const [inStock, setInStock] = useState(true)
  const [specsText, setSpecsText] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [categories, setCategories] = useState<Array<{ name: string }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (!imageFile) return setPreview(null)
    const url = URL.createObjectURL(imageFile)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [imageFile])

  async function fetchCategories() {
    try {
      const res = await fetch(`${API_BASE}/api/categories`)
      if (!res.ok) return
      const data = await res.json()
      setCategories(data || [])
    } catch (e) {
      // ignore
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError('')
    const f = e.target.files && e.target.files[0]
    if (!f) return setImageFile(null)
    if (!['image/jpeg', 'image/png'].includes(f.type)) {
      setError('Image must be JPEG or PNG')
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('Image must be <= 5MB')
      return
    }
    setImageFile(f)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
      if (!token) throw new Error('Admin not authenticated')

      // basic client-side validation
      if (!name.trim()) throw new Error('Name is required')
      if (!description.trim()) throw new Error('Description is required')
      if (!price || Number(price) <= 0) throw new Error('Valid price is required')
      if (!category && !newCategory) throw new Error('Category is required')

      const form = new FormData()
      form.append('description', description)
      form.append('name', name)
      form.append('price', price)
      form.append('category', newCategory || category)
      form.append('stock', stock)
      form.append('inStock', String(inStock))
      form.append('specsText', specsText)
      if (imageFile) form.append('image', imageFile)

      const res = await fetch(`${API_BASE}/api/products`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || (data && data.errors ? JSON.stringify(data.errors) : 'Failed to create product'))
      setSuccess('Product created')
      // redirect to admin product list or product page
      router.push('/admin')
    } catch (err: any) {
      setError(err.message || 'Create failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/products')}
            className="px-4 py-2 rounded-xl border-2 border-[#d0dc36] text-[#d0dc36] hover:bg-[#d0dc36] hover:text-white transition-all font-medium"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#d0dc36] to-[#c5d030] bg-clip-text text-transparent">
              Add New Product
            </h1>
            <p className="text-gray-600 mt-2">Create a new product for your store</p>
          </div>
        </div>

        {/* Form Layout */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="bg-white rounded-2xl shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-[#d0dc36]">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Name <span className="text-[#e53935]">*</span>
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#d0dc36] focus:ring-2 focus:ring-[#d0dc36]/20 outline-none transition-all"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description <span className="text-[#e53935]">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#d0dc36] focus:ring-2 focus:ring-[#d0dc36]/20 outline-none transition-all resize-none"
                    placeholder="Enter product description"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Stock */}
            <Card className="bg-white rounded-2xl shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-[#d0dc36]">Pricing & Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Price (Ksh) <span className="text-[#e53935]">*</span>
                    </label>
                    <input
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                      type="number"
                      step="0.01"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#d0dc36] focus:ring-2 focus:ring-[#d0dc36]/20 outline-none transition-all"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Stock Quantity
                    </label>
                    <input
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      type="number"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#d0dc36] focus:ring-2 focus:ring-[#d0dc36]/20 outline-none transition-all"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Availability
                    </label>
                    <div className="flex items-center h-[52px] px-4 border-2 border-gray-200 rounded-xl bg-gray-50">
                      <input
                        type="checkbox"
                        checked={inStock}
                        onChange={(e) => setInStock(e.target.checked)}
                        className="w-5 h-5 text-[#d0dc36] border-gray-300 rounded focus:ring-[#d0dc36]"
                      />
                      <label className="ml-3 text-sm font-medium text-gray-700">
                        In Stock
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card className="bg-white rounded-2xl shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-[#d0dc36]">Specifications (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={specsText}
                  onChange={(e) => setSpecsText(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#d0dc36] focus:ring-2 focus:ring-[#d0dc36]/20 outline-none transition-all resize-none font-mono text-sm"
                  placeholder={'Weight\t1kg\nColor\tBlue\nMaterial\tStainless Steel'}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Paste tab-separated key/value pairs or CSV lines from Excel.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Category & Image */}
          <div className="space-y-6">
            {/* Category */}
            <Card className="bg-white rounded-2xl shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-[#d0dc36]">Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#d0dc36] focus:ring-2 focus:ring-[#d0dc36]/20 outline-none transition-all"
                  >
                    <option value="">Select a category</option>
                    {categories.map((c: any) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Or Create New
                  </label>
                  <input
                    placeholder="New category name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#d0dc36] focus:ring-2 focus:ring-[#d0dc36]/20 outline-none transition-all"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Image Upload */}
            <Card className="bg-white rounded-2xl shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-[#d0dc36]">Product Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#d0dc36] transition-all">
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={onFileChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    {preview ? (
                      <div className="space-y-4">
                        <img
                          src={preview}
                          alt="preview"
                          className="max-h-48 mx-auto object-contain rounded-lg"
                        />
                        <p className="text-sm text-[#d0dc36] font-medium">
                          Click to change
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#d0dc36] to-[#c5d030] rounded-full flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </div>
                        <p className="text-[#d0dc36] font-medium">
                          Upload Image
                        </p>
                        <p className="text-xs text-gray-500">
                          JPEG or PNG, max 5MB
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Messages & Actions */}
            <Card className="bg-white rounded-2xl shadow-lg border-0">
              <CardContent className="p-6 space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-[#e53935] rounded-xl">
                    <p className="text-sm text-[#e53935] font-medium">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="p-3 bg-green-50 border border-green-500 rounded-xl">
                    <p className="text-sm text-green-700 font-medium">{success}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#d0dc36] to-[#c5d030] text-white py-4 px-6 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  {loading ? 'Creating...' : 'Create Product'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/admin/products')}
                  className="w-full bg-white border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  )
}
