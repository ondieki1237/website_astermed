import express from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all categories (managed collection) with product counts
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({}).sort('name');
    const categoriesWithCount = await Promise.all(
      categories.map(async (c) => ({
        _id: c._id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        count: await Product.countDocuments({ category: c.name }),
        subcategories: c.subcategories || [],
      }))
    );
    res.json(categoriesWithCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a category (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, subcategories } = req.body || {}
    if (!name || !name.trim()) return res.status(400).json({ message: 'Category name is required' })
    // avoid duplicates
    const existing = await Category.findOne({ name: name.trim() })
    if (existing) return res.status(409).json({ message: 'Category already exists' })
    const cat = new Category({ name: name.trim(), description, subcategories })
    await cat.save()
    res.status(201).json(cat)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get subcategories by category name (falls back to Category document then products)
router.get('/:category/subcategories', async (req, res) => {
  try {
    const cat = await Category.findOne({ name: req.params.category })
    if (cat && cat.subcategories && cat.subcategories.length) return res.json(cat.subcategories)
    const subcategories = await Product.distinct('subcategory', {
      category: req.params.category,
    });
    res.json(subcategories.filter(Boolean));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
