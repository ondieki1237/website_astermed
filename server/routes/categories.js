import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => ({
        name: category,
        count: await Product.countDocuments({ category }),
      }))
    );
    res.json(categoriesWithCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get subcategories by category
router.get('/:category/subcategories', async (req, res) => {
  try {
    const subcategories = await Product.distinct('subcategory', {
      category: req.params.category,
    });
    res.json(subcategories.filter(Boolean));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
