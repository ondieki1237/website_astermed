import express from 'express';
import fs from 'fs'
import path from 'path'
import multer from 'multer'
import sharp from 'sharp'
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all products with filters
router.get('/', async (req, res) => {
  try {
    const { category, subcategory, search, page = 1, limit = 12, sort = '-createdAt' } = req.query;
    const query = {};

    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    const total = await Product.countDocuments(query);

    res.json({
      products,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get featured/offer products
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ isOnOffer: true })
      .limit(8)
      .sort('-createdAt');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Get similar products from same category
    const similarProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    }).limit(4);

    // include simple analytics
    const analytics = {
      views: product.views || 0,
      stock: product.inStock !== undefined ? product.inStock : (product.stock > 0),
    }

    res.json({ product, similarProducts, analytics });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Multer setup for image uploads
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products')
fs.mkdirSync(uploadDir, { recursive: true })
const storage = multer.memoryStorage()
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } })

// Helper to parse specs pasted from Excel (tab or comma separated key/value pairs)
function parseSpecs(text) {
  if (!text) return undefined
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  const result = {}
  for (const line of lines) {
    const parts = line.split('\t')
    if (parts.length < 2) {
      const p = line.split(',')
      if (p.length >= 2) result[p[0].trim()] = p.slice(1).join(',').trim()
      else result[line] = ''
    } else {
      result[parts[0].trim()] = parts.slice(1).join('\t').trim()
    }
  }
  return result
}

// Create product (admin only) - accepts multipart/form-data with `image` and `specsText`
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
  try {
    const body = req.body || {}
    console.log('Create product request body keys:', Object.keys(body))
    // Show a few values for debugging
    console.log('Sample fields:', { name: body.name, description: body.description, price: body.price, category: body.category })

    // parse specs text if provided
    if (body.specsText) {
      body.specifications = parseSpecs(body.specsText)
    }

    // Resolve category: accept categoryId or newCategory or category name
    if (body.categoryId) {
      try {
        const cat = await Category.findById(body.categoryId)
        if (cat) body.category = cat.name
      } catch (e) {
        // ignore if invalid id
      }
    }
    if (!body.category && body.newCategory) {
      // create category if it doesn't exist
      const name = String(body.newCategory).trim()
      if (name) {
        let cat = await Category.findOne({ name })
        if (!cat) cat = await new Category({ name }).save()
        body.category = cat.name
      }
    }

    // If a category string is present, ensure it exists in Category collection
    if (body.category) {
      const cname = String(body.category).trim()
      if (cname) {
        let cat = await Category.findOne({ name: cname })
        if (!cat) cat = await new Category({ name: cname }).save()
        body.category = cat.name
      }
    }

    // handle image buffer -> convert to webp and save
    if (req.file) {
      const ext = '.webp'
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`
      const outPath = path.join(uploadDir, filename)
      await sharp(req.file.buffer).resize(1200, null, { withoutEnlargement: true }).webp({ quality: 80 }).toFile(outPath)
      // store relative path for frontend
      body.image = `/uploads/products/${filename}`
      // add to images array if needed
      body.images = body.images || []
      body.images.push(body.image)
    }

    // ensure correct types
    if (body.price) body.price = parseFloat(body.price)
    if (body.stock) body.stock = parseInt(body.stock, 10)
    if (typeof body.inStock === 'string') body.inStock = (body.inStock === 'true')
    // Server-side required fields check to provide clearer errors
    const required = ['name', 'description', 'price', 'category']
    const missing = required.filter((f) => {
      const v = body[f]
      return v === undefined || v === null || (typeof v === 'string' && v.trim() === '')
    })
    if (missing.length) {
      return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` })
    }

    const product = new Product(body)
    await product.save()
    res.status(201).json(product)
  } catch (error) {
    // Surface mongoose validation errors in a readable form
    if (error.name === 'ValidationError') {
      const details = Object.keys(error.errors).map(k => `${k}: ${error.errors[k].message}`)
      return res.status(400).json({ message: `Product validation failed: ${details.join(', ')}` })
    }
    res.status(500).json({ message: error.message })
  }
});

// Update product (admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // If updating category, ensure it exists in Category collection
    if (req.body && req.body.category) {
      const cname = String(req.body.category).trim()
      if (cname) {
        let cat = await Category.findOne({ name: cname })
        if (!cat) cat = await new Category({ name: cname }).save()
        req.body.category = cat.name
      }
    }
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete product (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add review to product (public endpoint)
router.post('/:id/reviews', async (req, res) => {
  try {
    const { rating, comment, username } = req.body;
    const parsedRating = parseInt(rating, 10);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const review = {
      userId: req.userId || null,
      username: username || 'Anonymous',
      rating: parsedRating,
      comment: comment || '',
      createdAt: new Date(),
    };

    product.reviews.push(review);
    product.reviewCount = product.reviews.length;
    product.rating = parseFloat((product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1));

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get product reviews
router.get('/:id/reviews', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product.reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Increment view/click count
router.post('/:id/view', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    product.views = (product.views || 0) + 1
    await product.save()
    res.json({ views: product.views })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router;
