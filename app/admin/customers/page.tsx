'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  ShoppingCart,
  Search,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Package,
  AlertCircle,
  Clock,
  Download
} from 'lucide-react';

interface Customer {
  email: string;
  name: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  orders: Array<{
    _id: string;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
}

interface AbandonedCart {
  _id: string;
  customerEmail: string;
  customerName: string;
  phone?: string;
  items: Array<{
    product: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  cartTotal: number;
  abandonedAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    fetchCustomers();
    fetchAbandonedCarts();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://astermed.codewithseth.co.ke';
      const response = await fetch(`${API_URL}/api/admin/customers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAbandonedCarts = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://astermed.codewithseth.co.ke';
      const response = await fetch(`${API_URL}/api/admin/abandoned-carts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAbandonedCarts(data);
      }
    } catch (error) {
      console.error('Error fetching abandoned carts:', error);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const filteredAbandonedCarts = abandonedCarts.filter(cart =>
    cart.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cart.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTimeSince = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading customers...</div>
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
              Customer Management
            </h1>
            <p className="text-gray-600 mt-2">
              Track customer orders and recover abandoned carts
            </p>
          </div>
          <Button className="bg-gradient-to-r from-[#1f2a7c] to-[#2535a0] hover:opacity-90">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-lg rounded-2xl border-0 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Customers</p>
                  <p className="text-3xl font-bold text-[#1f2a7c] mt-1">{customers.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-[#1f2a7c] to-[#2535a0] rounded-xl">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-2xl border-0 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-3xl font-bold text-[#1f2a7c] mt-1">
                    {customers.reduce((sum, c) => sum + c.totalOrders, 0)}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                  <Package className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-2xl border-0 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Abandoned Carts</p>
                  <p className="text-3xl font-bold text-[#e53935] mt-1">{abandonedCarts.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-[#e53935] to-red-600 rounded-xl">
                  <AlertCircle className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="shadow-lg rounded-2xl border-0 bg-white">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 rounded-xl border-gray-200 focus:border-[#1f2a7c] focus:ring-[#1f2a7c]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="customers" className="space-y-4">
          <TabsList className="bg-white shadow-md rounded-xl p-1">
            <TabsTrigger value="customers" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1f2a7c] data-[state=active]:to-[#2535a0] data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Customers ({filteredCustomers.length})
            </TabsTrigger>
            <TabsTrigger value="abandoned" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#e53935] data-[state=active]:to-red-600 data-[state=active]:text-white">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Abandoned Carts ({filteredAbandonedCarts.length})
            </TabsTrigger>
          </TabsList>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-4">
            {filteredCustomers.length === 0 ? (
              <Card className="shadow-lg rounded-2xl border-0 bg-white">
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No customers found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredCustomers.map((customer) => (
                  <Card key={customer.email} className="shadow-lg rounded-2xl border-0 bg-white hover:shadow-xl transition-all">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row justify-between gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-bold text-[#1f2a7c]">{customer.name}</h3>
                              <div className="flex flex-col gap-2 mt-2">
                                <div className="flex items-center text-gray-600">
                                  <Mail className="w-4 h-4 mr-2" />
                                  {customer.email}
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <Phone className="w-4 h-4 mr-2" />
                                  {customer.phone}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                              <p className="text-sm text-gray-600">Total Orders</p>
                              <p className="text-2xl font-bold text-[#1f2a7c]">{customer.totalOrders}</p>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                              <p className="text-sm text-gray-600">Total Spent</p>
                              <p className="text-2xl font-bold text-green-600">
                                KSH {customer.totalSpent.toLocaleString()}
                              </p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                              <p className="text-sm text-gray-600">Last Order</p>
                              <p className="text-sm font-semibold text-purple-600 mt-1">
                                {getTimeSince(customer.lastOrderDate)}
                              </p>
                            </div>
                          </div>

                          {selectedCustomer?.email === customer.email && (
                            <div className="mt-4 space-y-2">
                              <h4 className="font-semibold text-[#1f2a7c]">Recent Orders:</h4>
                              {customer.orders.slice(0, 5).map((order) => (
                                <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <Package className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">{order.orderNumber}</span>
                                    <Badge variant={
                                      order.status === 'delivered' ? 'default' :
                                      order.status === 'processing' ? 'secondary' : 'outline'
                                    }>
                                      {order.status}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className="font-semibold text-[#1f2a7c]">
                                      KSH {order.total.toLocaleString()}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      {new Date(order.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex lg:flex-col gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setSelectedCustomer(
                              selectedCustomer?.email === customer.email ? null : customer
                            )}
                            className="rounded-xl"
                          >
                            {selectedCustomer?.email === customer.email ? 'Hide Orders' : 'View Orders'}
                          </Button>
                          <Button className="bg-gradient-to-r from-[#1f2a7c] to-[#2535a0] rounded-xl">
                            <Mail className="w-4 h-4 mr-2" />
                            Contact
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Abandoned Carts Tab */}
          <TabsContent value="abandoned" className="space-y-4">
            {filteredAbandonedCarts.length === 0 ? (
              <Card className="shadow-lg rounded-2xl border-0 bg-white">
                <CardContent className="p-12 text-center">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No abandoned carts found</p>
                  <p className="text-sm text-gray-400 mt-2">This feature requires cart tracking to be implemented</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredAbandonedCarts.map((cart) => (
                  <Card key={cart._id} className="shadow-lg rounded-2xl border-0 bg-white hover:shadow-xl transition-all">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row justify-between gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-bold text-[#1f2a7c]">{cart.customerName}</h3>
                              <div className="flex flex-col gap-2 mt-2">
                                <div className="flex items-center text-gray-600">
                                  <Mail className="w-4 h-4 mr-2" />
                                  {cart.customerEmail}
                                </div>
                                {cart.phone && (
                                  <div className="flex items-center text-gray-600">
                                    <Phone className="w-4 h-4 mr-2" />
                                    {cart.phone}
                                  </div>
                                )}
                                <div className="flex items-center text-gray-500">
                                  <Clock className="w-4 h-4 mr-2" />
                                  Abandoned {getTimeSince(cart.abandonedAt)}
                                </div>
                              </div>
                            </div>
                            <Badge variant="destructive" className="bg-[#e53935]">
                              Abandoned
                            </Badge>
                          </div>

                          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl">
                            <p className="text-sm text-gray-600">Potential Revenue</p>
                            <p className="text-3xl font-bold text-[#e53935]">
                              KSH {cart.cartTotal.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                              {cart.items.length} item{cart.items.length > 1 ? 's' : ''} in cart
                            </p>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-semibold text-[#1f2a7c]">Cart Items:</h4>
                            {cart.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span>{item.name} (x{item.quantity})</span>
                                <span className="font-semibold text-[#1f2a7c]">
                                  KSH {(item.price * item.quantity).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex lg:flex-col gap-2">
                          <Button className="bg-gradient-to-r from-[#e53935] to-red-600 rounded-xl">
                            <Mail className="w-4 h-4 mr-2" />
                            Send Reminder
                          </Button>
                          <Button variant="outline" className="rounded-xl">
                            Apply Discount
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
