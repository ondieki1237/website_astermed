import express from 'express';
import Order from '../models/Order.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Create order or quote request (public - no auth required)
router.post('/', async (req, res) => {
  try {
    const { customer, items, subtotal, shipping, total, paymentPhone, status, type } = req.body

    // Validation
    if (!customer || !customer.name || !customer.email || !customer.phone) {
      return res.status(400).json({ message: 'Customer name, email, and phone are required' })
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must have at least one item' })
    }

    // Generate unique order number
    const orderNumber = `${type === 'quote' ? 'QTE' : 'ORD'}-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`

    const order = new Order({
      orderNumber,
      customer,
      items,
      subtotal: subtotal || 0,
      shipping: shipping || 0,
      total: total || 0,
      paymentPhone: paymentPhone || customer.phone,
      paymentStatus: status === 'quote_requested' ? 'not_applicable' : 'pending',
      orderStatus: status || 'pending',
    })

    await order.save()
    res.status(201).json(order)
  } catch (error) {
    console.error('Create order error:', error)
    res.status(500).json({ message: error.message })
  }
})

// Get all orders (admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' })
    }
    
    const orders = await Order.find().sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    res.json(order)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update order status (admin only)
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' })
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    )

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    res.json(order)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router;
