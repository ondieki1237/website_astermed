'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  completedOrders: number;
  abandonedCarts: number;
  lowStockProducts: number;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://astermed.codewithseth.co.ke';
      const response = await fetch(`${API_URL}/api/admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const conversionRate = stats 
    ? ((stats.completedOrders / Math.max(stats.totalOrders, 1)) * 100).toFixed(1)
    : '0';

  const avgOrderValue = stats && stats.totalOrders > 0
    ? (stats.totalRevenue / stats.totalOrders).toFixed(2)
    : '0';

  const customerLifetimeValue = stats && stats.totalCustomers > 0
    ? (stats.totalRevenue / stats.totalCustomers).toFixed(2)
    : '0';

  const cartAbandonmentRate = stats && stats.totalOrders > 0
    ? ((stats.abandonedCarts / (stats.totalOrders + stats.abandonedCarts)) * 100).toFixed(1)
    : '0';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1f2a7c] to-[#2535a0] bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Track your business performance and key metrics
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-4 py-2 rounded-lg transition-all ${
                timeRange === '7d'
                  ? 'bg-gradient-to-r from-[#1f2a7c] to-[#2535a0] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-4 py-2 rounded-lg transition-all ${
                timeRange === '30d'
                  ? 'bg-gradient-to-r from-[#1f2a7c] to-[#2535a0] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeRange('90d')}
              className={`px-4 py-2 rounded-lg transition-all ${
                timeRange === '90d'
                  ? 'bg-gradient-to-r from-[#1f2a7c] to-[#2535a0] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              90 Days
            </button>
          </div>
        </div>

        {/* Key Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-lg rounded-2xl border-0 bg-white hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-[#1f2a7c] mt-1">
                KSH {stats?.totalRevenue.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-green-500 mt-2">+12.5% from last period</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-2xl border-0 bg-white hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-[#1f2a7c] to-[#2535a0] rounded-xl">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-600">Average Order Value</p>
              <p className="text-3xl font-bold text-[#1f2a7c] mt-1">
                KSH {Number(avgOrderValue).toLocaleString()}
              </p>
              <p className="text-sm text-green-500 mt-2">+8.2% from last period</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-2xl border-0 bg-white hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-3xl font-bold text-[#1f2a7c] mt-1">{conversionRate}%</p>
              <p className="text-sm text-green-500 mt-2">+3.1% from last period</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-2xl border-0 bg-white hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-600">Customer Lifetime Value</p>
              <p className="text-3xl font-bold text-[#1f2a7c] mt-1">
                KSH {Number(customerLifetimeValue).toLocaleString()}
              </p>
              <p className="text-sm text-green-500 mt-2">+15.3% from last period</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Different Analytics Views */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-white shadow-md rounded-xl p-1">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1f2a7c] data-[state=active]:to-[#2535a0] data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="sales" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1f2a7c] data-[state=active]:to-[#2535a0] data-[state=active]:text-white">
              <DollarSign className="w-4 h-4 mr-2" />
              Sales
            </TabsTrigger>
            <TabsTrigger value="products" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1f2a7c] data-[state=active]:to-[#2535a0] data-[state=active]:text-white">
              <Package className="w-4 h-4 mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger value="customers" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1f2a7c] data-[state=active]:to-[#2535a0] data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Customers
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Order Status Distribution */}
              <Card className="shadow-lg rounded-2xl border-0 bg-white">
                <CardHeader>
                  <CardTitle className="text-[#1f2a7c]">Order Status Distribution</CardTitle>
                  <CardDescription>Current status of all orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="font-medium">Pending Orders</span>
                      </div>
                      <span className="text-2xl font-bold text-yellow-600">{stats?.pendingOrders || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium">Completed Orders</span>
                      </div>
                      <span className="text-2xl font-bold text-green-600">{stats?.completedOrders || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-[#e53935] rounded-full"></div>
                        <span className="font-medium">Abandoned Carts</span>
                      </div>
                      <span className="text-2xl font-bold text-[#e53935]">{stats?.abandonedCarts || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Metrics */}
              <Card className="shadow-lg rounded-2xl border-0 bg-white">
                <CardHeader>
                  <CardTitle className="text-[#1f2a7c]">Performance Metrics</CardTitle>
                  <CardDescription>Key business indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Cart Abandonment Rate</span>
                        <span className="text-2xl font-bold text-[#e53935]">{cartAbandonmentRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#e53935] h-2 rounded-full"
                          style={{ width: `${cartAbandonmentRate}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Order Completion Rate</span>
                        <span className="text-2xl font-bold text-purple-600">{conversionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${conversionRate}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Low Stock Alert</span>
                        <span className="text-2xl font-bold text-orange-600">{stats?.lowStockProducts || 0}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Products need restocking</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Trend (Placeholder) */}
            <Card className="shadow-lg rounded-2xl border-0 bg-white">
              <CardHeader>
                <CardTitle className="text-[#1f2a7c]">Revenue Trend</CardTitle>
                <CardDescription>Revenue over time (Last {timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : '90 days'})</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Chart visualization coming soon</p>
                    <p className="text-sm text-gray-400 mt-2">Integrate a charting library like Recharts or Chart.js</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="shadow-lg rounded-2xl border-0 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Total Sales</p>
                  <p className="text-3xl font-bold text-[#1f2a7c] mt-1">{stats?.totalOrders || 0}</p>
                </CardContent>
              </Card>

              <Card className="shadow-lg rounded-2xl border-0 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Daily Average</p>
                  <p className="text-3xl font-bold text-[#1f2a7c] mt-1">
                    {stats ? Math.round(stats.totalOrders / 30) : 0}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-lg rounded-2xl border-0 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Growth Rate</p>
                  <p className="text-3xl font-bold text-[#1f2a7c] mt-1">+12.5%</p>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-lg rounded-2xl border-0 bg-white">
              <CardHeader>
                <CardTitle className="text-[#1f2a7c]">Sales Performance</CardTitle>
                <CardDescription>Detailed sales analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl">
                  <div className="text-center">
                    <PieChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Sales chart visualization coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="shadow-lg rounded-2xl border-0 bg-white">
                <CardHeader>
                  <CardTitle className="text-[#1f2a7c]">Product Performance</CardTitle>
                  <CardDescription>Top performing products</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Products</span>
                        <span className="text-2xl font-bold text-[#1f2a7c]">{stats?.totalProducts || 0}</span>
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Low Stock Items</span>
                        <span className="text-2xl font-bold text-[#e53935]">{stats?.lowStockProducts || 0}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg rounded-2xl border-0 bg-white">
                <CardHeader>
                  <CardTitle className="text-[#1f2a7c]">Stock Status</CardTitle>
                  <CardDescription>Inventory overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl">
                    <div className="text-center">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Stock chart coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="shadow-lg rounded-2xl border-0 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-[#1f2a7c] to-[#2535a0] rounded-xl">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Total Customers</p>
                  <p className="text-3xl font-bold text-[#1f2a7c] mt-1">{stats?.totalCustomers || 0}</p>
                </CardContent>
              </Card>

              <Card className="shadow-lg rounded-2xl border-0 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Avg. Customer Value</p>
                  <p className="text-3xl font-bold text-[#1f2a7c] mt-1">
                    KSH {Number(customerLifetimeValue).toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-lg rounded-2xl border-0 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Repeat Rate</p>
                  <p className="text-3xl font-bold text-[#1f2a7c] mt-1">32%</p>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-lg rounded-2xl border-0 bg-white">
              <CardHeader>
                <CardTitle className="text-[#1f2a7c]">Customer Behavior</CardTitle>
                <CardDescription>Customer engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl">
                  <div className="text-center">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Customer analytics chart coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
