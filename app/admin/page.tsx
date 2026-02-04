'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ShoppingCart, 
  Users, 
  Package, 
  DollarSign, 
  AlertCircle,
  Eye,
  ShoppingBag,
  Clock,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/currency'

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  totalCustomers: number
  pendingOrders: number
  completedOrders: number
  abandonedCarts: number
  lowStockProducts: number
  topProducts: Array<{
    _id: string
    name: string
    views: number
    orderCount: number
    revenue: number
  }>
  recentOrders: Array<{
    _id: string
    orderNumber: string
    customer: { name: string; email: string }
    total: number
    status: string
    createdAt: string
  }>
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://astermed.codewithseth.co.ke'

  useEffect(() => {
    const check = async () => {
      try {
        const token = localStorage.getItem('admin_token')
        if (!token) return router.push('/admin/login')
        
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        
        if (res.status === 401) {
          localStorage.removeItem('admin_token')
          return router.push('/admin/login')
        }
        
        await loadDashboardStats()
      } catch (e) {
        localStorage.removeItem('admin_token')
        return router.push('/admin/login')
      }
    }
    check()
  }, [])

  async function loadDashboardStats() {
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) return

      const res = await fetch(`${API_BASE}/api/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (e) {
      console.error('Failed to load dashboard stats', e)
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    try { localStorage.removeItem('admin_token') } catch (e) {}
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-gray-200 border-t-[#d0dc36] rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-40 bg-[#d0dc36] text-white shadow">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">AsterMed Admin Dashboard</h1>
          </div>
          <Button 
            onClick={handleLogout} 
            variant="outline" 
            className="text-white border-white hover:bg-white hover:text-[#d0dc36] bg-transparent"
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-white border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-gray-600 text-sm mb-1">Total Revenue</p>
            <p className="text-3xl font-semibold text-gray-900">{formatPrice(stats?.totalRevenue || 0)}</p>
          </Card>

          <Card className="p-6 bg-white border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <ShoppingCart className="w-8 h-8 text-[#d0dc36]" />
            </div>
            <p className="text-gray-600 text-sm mb-1">Total Orders</p>
            <p className="text-3xl font-semibold text-gray-900">{stats?.totalOrders || 0}</p>
          </Card>

          <Card className="p-6 bg-white border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <Users className="w-8 h-8 text-[#c5d030]" />
            </div>
            <p className="text-gray-600 text-sm mb-1">Total Customers</p>
            <p className="text-3xl font-semibold text-gray-900">{stats?.totalCustomers || 0}</p>
          </Card>

          <Card className="p-6 bg-white border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <Package className="w-8 h-8 text-[#d0dc36]" />
            </div>
            <p className="text-gray-600 text-sm mb-1">Total Products</p>
            <p className="text-3xl font-semibold text-gray-900">{stats?.totalProducts || 0}</p>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-5 bg-white border border-gray-200">
            <div className="flex items-center gap-3">
              <Clock className="w-7 h-7 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.pendingOrders || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white border border-gray-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-7 h-7 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.completedOrders || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white border border-gray-200">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-7 h-7 text-[#e53935]" />
              <div>
                <p className="text-sm text-gray-600">Abandoned Carts</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.abandonedCarts || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white border border-gray-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-7 h-7 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.lowStockProducts || 0}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full md:grid-cols-6 bg-white border border-gray-200 rounded-lg p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6 bg-white border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Recent Orders</h3>
                <div className="space-y-3">
                  {stats?.recentOrders?.slice(0, 5).map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">{order.customer?.name || 'Guest'}</p>
                        <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatPrice(order.total)}</p>
                        <span className={`text-xs px-2 py-1 rounded ${
                          order.status === 'completed' ? 'bg-green-100 text-green-700' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/admin/orders">
                  <Button className="w-full mt-4 bg-gradient-to-r from-[#d0dc36] to-[#c5d030]">
                    View All Orders
                  </Button>
                </Link>
              </Card>

              <Card className="p-6 bg-white border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Top Products</h3>
                <div className="space-y-3">
                  {stats?.topProducts?.slice(0, 5).map((product, idx) => (
                    <div key={product._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="w-8 h-8 bg-[#d0dc36] text-white rounded-full flex items-center justify-center font-semibold text-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {product.views || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <ShoppingCart className="w-3 h-3" /> {product.orderCount || 0}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatPrice(product.revenue || 0)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <Card className="p-6 bg-white border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">All Orders</h2>
                <Link href="/admin/orders">
                  <Button className="bg-[#d0dc36] hover:bg-[#c5d030]">
                    Manage Orders
                  </Button>
                </Link>
              </div>
              <p className="text-gray-600">View and manage all customer orders</p>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <Card className="p-6 bg-white border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Products</h2>
                <Link href="/admin/products">
                  <Button className="bg-[#d0dc36] hover:bg-[#c5d030]">
                    Manage Products
                  </Button>
                </Link>
              </div>
              <p className="text-gray-600">Manage your product catalog</p>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="mt-6">
            <Card className="p-6 bg-white border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Customers</h2>
                <Link href="/admin/customers">
                  <Button className="bg-[#d0dc36] hover:bg-[#c5d030]">
                    View Customers
                  </Button>
                </Link>
              </div>
              <p className="text-gray-600">View customer profiles and abandoned carts</p>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card className="p-6 bg-white border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Analytics</h2>
              <p className="text-gray-600 mb-6">View detailed analytics</p>
              <Link href="/admin/analytics">
                <Button className="bg-[#d0dc36] hover:bg-[#c5d030]">
                  View Analytics
                </Button>
              </Link>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="mt-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 bg-white border border-gray-200">
                <h3 className="text-base font-semibold mb-2">Blogs</h3>
                <p className="text-sm text-gray-600 mb-4">Manage blog content</p>
                <Link href="/admin/blogs">
                  <Button className="w-full bg-[#d0dc36] hover:bg-[#c5d030]">
                    Manage Blogs
                  </Button>
                </Link>
              </Card>

              <Card className="p-6 bg-white border border-gray-200">
                <h3 className="text-base font-semibold mb-2">News</h3>
                <p className="text-sm text-gray-600 mb-4">Manage news</p>
                <Link href="/admin/news">
                  <Button className="w-full bg-[#d0dc36] hover:bg-[#c5d030]">
                    Manage News
                  </Button>
                </Link>
              </Card>

              <Card className="p-6 bg-white border border-gray-200">
                <h3 className="text-base font-semibold mb-2">Jobs</h3>
                <p className="text-sm text-gray-600 mb-4">Manage job postings</p>
                <Link href="/admin/jobs">
                  <Button className="w-full bg-[#d0dc36] hover:bg-[#c5d030]">
                    Manage Jobs
                  </Button>
                </Link>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
