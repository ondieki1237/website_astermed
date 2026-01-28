'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Edit, Trash2, BarChart3, FileText, Briefcase, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  isOnOffer: boolean
  offerEndDate?: string
}

interface Blog {
  id: string
  title: string
  author: string
  published: boolean
  createdAt: string
}

interface News {
  id: string
  title: string
  published: boolean
  featured: boolean
}

interface Job {
  id: string
  title: string
  department: string
  status: 'open' | 'closed'
}

export default function AdminDashboard() {
  const router = useRouter()

  useEffect(() => {
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) router.push('/admin/login')
    } catch (e) {
      router.push('/admin/login')
    }
  }, [])
  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'Blood Pressure Monitor', price: 89.99, stock: 45, isOnOffer: true, offerEndDate: '2024-02-15' },
    { id: '2', name: 'Surgical Masks', price: 24.99, stock: 200, isOnOffer: false },
  ])

  const [blogs, setBlogs] = useState<Blog[]>([
    { id: '1', title: 'Tips for Home Healthcare', author: 'Dr. Smith', published: true, createdAt: '2024-01-20' },
  ])

  const [news, setNews] = useState<News[]>([
    { id: '1', title: 'New Product Launch', published: true, featured: true },
  ])

  const [jobs, setJobs] = useState<Job[]>([
    { id: '1', title: 'Sales Manager', department: 'Sales', status: 'open' },
  ])

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">AsterMed Admin Dashboard</h1>
          <Button variant="outline" className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent">
            Logout
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 border-none shadow-md">
            <BarChart3 className="w-8 h-8 text-accent mb-2" />
            <p className="text-muted-foreground text-sm">Total Products</p>
            <p className="text-3xl font-bold">{products.length}</p>
          </Card>
          <Card className="p-6 border-none shadow-md">
            <FileText className="w-8 h-8 text-accent mb-2" />
            <p className="text-muted-foreground text-sm">Blog Posts</p>
            <p className="text-3xl font-bold">{blogs.length}</p>
          </Card>
          <Card className="p-6 border-none shadow-md">
            <AlertCircle className="w-8 h-8 text-accent mb-2" />
            <p className="text-muted-foreground text-sm">Active Offers</p>
            <p className="text-3xl font-bold">{products.filter(p => p.isOnOffer).length}</p>
          </Card>
          <Card className="p-6 border-none shadow-md">
            <Briefcase className="w-8 h-8 text-accent mb-2" />
            <p className="text-muted-foreground text-sm">Open Jobs</p>
            <p className="text-3xl font-bold">{jobs.filter(j => j.status === 'open').length}</p>
          </Card>
        </div>

        {/* Admin Sections */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full md:grid-cols-4">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="offers">Offers</TabsTrigger>
            <TabsTrigger value="blogs">Blogs & News</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Manage Products</h2>
              <Link href="/admin/products/new">
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" /> Add Product
                </Button>
              </Link>
            </div>
            <Card className="p-6 border-none shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Price</th>
                      <th className="text-left py-3 px-4">Stock</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id} className="border-b hover:bg-secondary/50">
                        <td className="py-3 px-4 font-medium">{product.name}</td>
                        <td className="py-3 px-4">${product.price}</td>
                        <td className="py-3 px-4">{product.stock}</td>
                        <td className="py-3 px-4">
                          {product.isOnOffer && (
                            <span className="bg-accent text-white text-xs px-2 py-1 rounded">On Offer</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-accent hover:text-red-700 bg-transparent">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Offers Tab */}
          <TabsContent value="offers" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Manage Offers</h2>
              <Link href="/admin/offers/new">
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" /> Create Offer
                </Button>
              </Link>
            </div>
            <Card className="p-6 border-none shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 px-4">Product</th>
                      <th className="text-left py-3 px-4">Discount</th>
                      <th className="text-left py-3 px-4">Start Date</th>
                      <th className="text-left py-3 px-4">End Date</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.filter(p => p.isOnOffer).map(product => (
                      <tr key={product.id} className="border-b hover:bg-secondary/50">
                        <td className="py-3 px-4 font-medium">{product.name}</td>
                        <td className="py-3 px-4">20%</td>
                        <td className="py-3 px-4">2024-01-15</td>
                        <td className="py-3 px-4">{product.offerEndDate}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-accent bg-transparent">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Blogs & News Tab */}
          <TabsContent value="blogs" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Blog Posts & News</h2>
              <div className="flex gap-2">
                <Link href="/admin/blogs/new">
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" /> New Blog
                  </Button>
                </Link>
                <Link href="/admin/news/new">
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" /> New News
                  </Button>
                </Link>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 border-none shadow-md">
                <h3 className="text-lg font-bold mb-4">Blog Posts</h3>
                <div className="space-y-3">
                  {blogs.map(blog => (
                    <div key={blog.id} className="border rounded p-4 hover:bg-secondary/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{blog.title}</p>
                          <p className="text-xs text-muted-foreground">By {blog.author}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${blog.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {blog.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-accent bg-transparent">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-6 border-none shadow-md">
                <h3 className="text-lg font-bold mb-4">News</h3>
                <div className="space-y-3">
                  {news.map(item => (
                    <div key={item.id} className="border rounded p-4 hover:bg-secondary/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{item.title}</p>
                          {item.featured && <p className="text-xs text-accent">Featured</p>}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${item.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {item.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-accent bg-transparent">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Job Postings</h2>
              <Link href="/admin/jobs/new">
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" /> Post Job
                </Button>
              </Link>
            </div>
            <Card className="p-6 border-none shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 px-4">Title</th>
                      <th className="text-left py-3 px-4">Department</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map(job => (
                      <tr key={job.id} className="border-b hover:bg-secondary/50">
                        <td className="py-3 px-4 font-medium">{job.title}</td>
                        <td className="py-3 px-4">{job.department}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded ${job.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-accent bg-transparent">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
