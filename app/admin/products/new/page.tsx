"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5088'

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
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto bg-card p-6 rounded shadow-lg">
        <h1 className="text-3xl font-bold mb-6">Add New Product</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-2 border rounded shadow-sm focus:ring" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-4 py-2 border rounded shadow-sm" placeholder="Short product description" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price (KES)</label>
                <input value={price} onChange={(e) => setPrice(e.target.value)} required type="number" step="0.01" className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stock qty</label>
                <input value={stock} onChange={(e) => setStock(e.target.value)} type="number" className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">In stock</label>
                <div className="mt-2">
                  <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Specifications (paste from Excel)</label>
              <textarea value={specsText} onChange={(e) => setSpecsText(e.target.value)} rows={6} className="w-full px-3 py-2 border rounded" placeholder={'Weight\t1kg\nColor\tBlue'} />
              <p className="text-xs text-muted-foreground mt-1">Paste tab-separated key/value pairs or CSV lines.</p>
            </div>
          </div>

          <div className="md:col-span-1 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <div className="flex gap-2">
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-2 border rounded flex-1">
                  <option value="">Select category</option>
                  {categories.map((c: any) => (
                    <option key={c.name} value={c.name}>{c.name} ({c.count})</option>
                  ))}
                </select>
              </div>
              <input placeholder="Or add new category" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="mt-2 px-3 py-2 border rounded w-full" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Image (JPEG or PNG, max 5MB)</label>
              <input type="file" accept="image/png,image/jpeg" onChange={onFileChange} className="w-full" />
              {preview && <img src={preview} alt="preview" className="mt-3 w-full object-contain rounded" />}
            </div>

            <div className="mt-4">
              {error && <p className="text-sm text-red-600">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}
            </div>

            <div className="flex gap-2 mt-2">
              <button type="submit" disabled={loading} className="w-full btn btn-primary">{loading ? 'Saving...' : 'Create product'}</button>
              <button type="button" className="w-full btn" onClick={() => router.push('/admin')}>Cancel</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
