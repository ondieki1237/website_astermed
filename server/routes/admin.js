import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Dashboard stats endpoint
router.get('/dashboard/stats', authMiddleware, async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Get all orders
    const orders = await Order.find().sort({ createdAt: -1 });
    
    // Calculate stats
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    
    // Get unique customers
    const uniqueCustomers = new Set();
    orders.forEach(order => {
      if (order.customer && order.customer.email) {
        uniqueCustomers.add(order.customer.email);
      }
    });
    const totalCustomers = uniqueCustomers.size;

    // Get all products
    const products = await Product.find();
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.stock < 10).length;

    // Abandoned carts (mock for now - would need cart tracking)
    const abandonedCarts = 0;

    // Top products by views
    const topProducts = products
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 10)
      .map(p => ({
        _id: p._id,
        name: p.name,
        views: p.views || 0,
        orderCount: 0, // Would calculate from orders
        revenue: 0 // Would calculate from orders
      }));

    // Recent orders
    const recentOrders = orders.slice(0, 10).map(order => ({
      _id: order._id,
      orderNumber: order.orderNumber || `ORD-${order._id.toString().slice(-6).toUpperCase()}`,
      customer: order.customer || { name: 'Guest', email: 'N/A' },
      total: order.total || 0,
      status: order.status || 'pending',
      createdAt: order.createdAt
    }));

    res.json({
      totalOrders,
      totalRevenue,
      totalProducts,
      totalCustomers,
      pendingOrders,
      completedOrders,
      abandonedCarts,
      lowStockProducts,
      topProducts,
      recentOrders
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all orders (admin)
router.get('/orders', authMiddleware, async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const orders = await Order.find().sort({ createdAt: -1 });
    
    const ordersWithNumbers = orders.map(order => ({
      ...order.toObject(),
      orderNumber: order.orderNumber || `ORD-${order._id.toString().slice(-6).toUpperCase()}`
    }));

    res.json(ordersWithNumbers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status
router.put('/orders/:id/status', authMiddleware, async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get customers list
router.get('/customers', authMiddleware, async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const orders = await Order.find().sort({ createdAt: -1 });
    
    // Group by customer email
    const customerMap = new Map();
    
    orders.forEach(order => {
      if (order.customer && order.customer.email) {
        const email = order.customer.email;
        if (!customerMap.has(email)) {
          customerMap.set(email, {
            email,
            name: order.customer.name || 'Guest',
            phone: order.customer.phone || 'N/A',
            totalOrders: 0,
            totalSpent: 0,
            lastOrderDate: order.createdAt,
            orders: []
          });
        }
        
        const customer = customerMap.get(email);
        customer.totalOrders++;
        customer.totalSpent += order.total || 0;
        customer.orders.push({
          _id: order._id,
          orderNumber: order.orderNumber || `ORD-${order._id.toString().slice(-6).toUpperCase()}`,
          total: order.total,
          status: order.status,
          createdAt: order.createdAt
        });
        
        if (new Date(order.createdAt) > new Date(customer.lastOrderDate)) {
          customer.lastOrderDate = order.createdAt;
        }
      }
    });

    const customers = Array.from(customerMap.values());
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get abandoned carts
router.get('/abandoned-carts', authMiddleware, async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // This would require cart tracking implementation
    // For now, return empty array
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
