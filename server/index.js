import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

dotenv.config();

const app = express();

// Middleware
// Allow CORS from the configured frontend origin; default to the deployed frontend domain
app.use(cors({ origin: process.env.CORS_ORIGIN || 'https://astermedsupplies.co.ke' }));
app.use(express.json());

// Serve uploaded files (images) from server public/uploads
import path from 'path'
const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
app.use('/uploads', express.static(uploadsDir))

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

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
