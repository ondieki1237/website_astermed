import express from 'express';
import Wishlist from '../models/Wishlist.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get user wishlist
router.get('/', authMiddleware, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.userId }).populate('products.productId');
    res.json(wishlist || { products: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add to wishlist
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ userId: req.userId });

    if (!wishlist) {
      wishlist = new Wishlist({
        userId: req.userId,
        products: [{ productId }],
      });
    } else {
      const exists = wishlist.products.some((p) => p.productId.toString() === productId);
      if (!exists) {
        wishlist.products.push({ productId });
      }
    }

    await wishlist.save();
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove from wishlist
router.delete('/:productId', authMiddleware, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.userId });

    if (wishlist) {
      wishlist.products = wishlist.products.filter(
        (p) => p.productId.toString() !== req.params.productId
      );
      await wishlist.save();
    }

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
