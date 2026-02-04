'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  sku: string;
  featured: boolean;
  views?: number;
  createdAt: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export default function ManageProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [displayCount, setDisplayCount] = useState(20);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://astermed.codewithseth.co.ke';
      const response = await fetch(`${API_URL}/api/products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Ensure data is an array
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data && data.products && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          console.error('API returned non-array data:', data);
          setProducts([]);
        }
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://astermed.codewithseth.co.ke';
      const response = await fetch(`${API_URL}/api/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://astermed.codewithseth.co.ke';
      const response = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setProducts(products.filter(p => p._id !== id));
        alert('Product deleted successfully');
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  const allFilteredProducts = Array.isArray(products) ? products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesStock = stockFilter === 'all' ||
                        (stockFilter === 'low' && product.stock < 10) ||
                        (stockFilter === 'out' && product.stock === 0) ||
                        (stockFilter === 'in' && product.stock > 0);
    
    return matchesSearch && matchesCategory && matchesStock;
  }) : [];

  const filteredProducts = allFilteredProducts.slice(0, displayCount);
  const hasMore = allFilteredProducts.length > displayCount;

  const lowStockCount = Array.isArray(products) ? products.filter(p => p.stock < 10 && p.stock > 0).length : 0;
  const outOfStockCount = Array.isArray(products) ? products.filter(p => p.stock === 0).length : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/admin')}
              className="rounded-xl border-[#d0dc36] text-[#d0dc36] hover:bg-[#d0dc36] hover:text-white"
            >
              ← Back
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#d0dc36] to-[#c5d030] bg-clip-text text-transparent">
                Manage Products
              </h1>
              <p className="text-gray-600 mt-2">
                Add, edit, and manage your product inventory
              </p>
            </div>
          </div>
          <Button
            onClick={() => router.push('/admin/products/new')}
            className="bg-gradient-to-r from-[#d0dc36] to-[#c5d030] hover:opacity-90 rounded-xl px-8 py-3 font-semibold"
          >
            + Add New Product
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-lg rounded-2xl border-0 bg-white">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-gray-600 mb-2">Total Products</p>
              <p className="text-4xl font-bold text-[#d0dc36]">{products.length}</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-2xl border-0 bg-white">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-gray-600 mb-2">Categories</p>
              <p className="text-4xl font-bold text-[#d0dc36]">{categories.length}</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-2xl border-0 bg-white">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-gray-600 mb-2">Low Stock</p>
              <p className="text-4xl font-bold text-orange-500">{lowStockCount}</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-2xl border-0 bg-white">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-gray-600 mb-2">Out of Stock</p>
              <p className="text-4xl font-bold text-[#e53935]">{outOfStockCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-lg rounded-2xl border-0 bg-white">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <Input
                type="text"
                placeholder="Search by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 rounded-xl border-gray-200 focus:border-[#d0dc36] focus:ring-[#d0dc36]"
              />

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-[#d0dc36] focus:ring-[#d0dc36]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Stock Filter */}
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-[#d0dc36] focus:ring-[#d0dc36]">
                  <SelectValue placeholder="Filter by stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock Levels</SelectItem>
                  <SelectItem value="in">In Stock</SelectItem>
                  <SelectItem value="low">Low Stock (&lt;10)</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card className="shadow-lg rounded-2xl border-0 bg-white">
          <CardHeader>
            <CardTitle className="text-[#d0dc36]">
              Products ({filteredProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No products found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">Product</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">SKU</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">Category</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">Price</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">Stock</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">Status</th>
                      <th className="text-right p-4 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                            )}
                            <div>
                              <p className="font-semibold text-[#d0dc36]">{product.name}</p>
                              <p className="text-sm text-gray-500 line-clamp-1">
                                {product.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-sm text-gray-600">{product.sku}</span>
                        </td>
                        <td className="p-4">
                          <Badge variant="secondary" className="bg-yellow-100 text-[#c5d030]">
                            {product.category}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-[#d0dc36]">
                            Ksh {product.price.toLocaleString()}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`font-semibold ${
                            product.stock === 0 ? 'text-[#e53935]' :
                            product.stock < 10 ? 'text-orange-500' :
                            'text-green-600'
                          }`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="p-4">
                          {product.stock === 0 ? (
                            <Badge variant="destructive" className="bg-[#e53935]">
                              Out of Stock
                            </Badge>
                          ) : product.stock < 10 ? (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-600">
                              Low Stock
                            </Badge>
                          ) : (
                            <Badge variant="default" className="bg-green-100 text-green-600">
                              In Stock
                            </Badge>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`/products/${product._id}`, '_blank')}
                              className="rounded-lg text-[#d0dc36] border-[#d0dc36] hover:bg-[#d0dc36] hover:text-white"
                            >
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/admin/products/edit/${product._id}`)}
                              className="rounded-lg text-[#c5d030] border-[#c5d030] hover:bg-[#c5d030] hover:text-white"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteProduct(product._id)}
                              className="rounded-lg text-[#e53935] border-[#e53935] hover:bg-[#e53935] hover:text-white"
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* View More Button */}
            {hasMore && (
              <div className="mt-6 text-center">
                <Button
                  onClick={() => setDisplayCount(prev => prev + ITEMS_PER_PAGE)}
                  className="bg-gradient-to-r from-[#d0dc36] to-[#c5d030] hover:opacity-90 rounded-xl px-8 py-3"
                >
                  View More Products ({allFilteredProducts.length - displayCount} remaining)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
