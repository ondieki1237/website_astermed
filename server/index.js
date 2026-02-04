import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from 'compression';
import helmet from 'helmet';
import connectDB from './config/db.js';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import blogRoutes from './routes/blogs.js';
import newsRoutes from './routes/news.js';
import jobRoutes from './routes/jobs.js';
import orderRoutes from './routes/orders.js';
import categoryRoutes from './routes/categories.js';
import wishlistRoutes from './routes/wishlist.js';
import mpesaRoutes from './routes/mpesa.js';
import devRoutes from './routes/dev.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // Allow flexible CSP for API
}));

// Compression middleware - compress all responses
app.use(compression());

// CORS configuration
const rawOrigins = process.env.CORS_ORIGIN || 'http://localhost:3000'
const allowedOrigins = rawOrigins.split(',').map(s => s.trim()).filter(Boolean)
app.use(cors({ 
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Body parser middleware with limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files (images) from server public/uploads with caching
import path from 'path'
const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
app.use('/uploads', express.static(uploadsDir, {
  maxAge: '30d', // Cache images for 30 days
  etag: true,
  lastModified: true
}))

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/mpesa', mpesaRoutes);
app.use('/api/dev', devRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

const PORT = process.env.PORT || 5088;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
