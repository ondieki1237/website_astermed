# AsterMed E-Commerce Platform - Deployment Guide

## Project Overview

AsterMed is a full-stack medical e-commerce platform built with:
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB
- **Currency**: Kenyan Shilling (KSH)

---

## Project Structure

```
project/
├── app/                          # Next.js app directory
│   ├── page.tsx                 # Home page with featured products
│   ├── products/
│   │   ├── [id]/page.tsx        # Product detail page with reviews & similar products
│   │   ├── client.tsx           # Products listing page
│   │   └── page.tsx             # Products wrapper with Suspense
│   ├── admin/page.tsx           # Admin dashboard
│   ├── cart/page.tsx            # Shopping cart
│   ├── checkout/page.tsx        # Checkout flow
│   ├── blogs/page.tsx           # Blog listing
│   ├── news/page.tsx            # News listing
│   └── jobs/page.tsx            # Job postings
├── components/
│   ├── header.tsx               # Navigation header
│   ├── footer.tsx               # Footer
│   ├── category-sidebar.tsx     # Category navigation
│   └── ui/                      # shadcn/ui components
├── lib/
│   ├── currency.ts              # Currency formatting utilities
│   └── utils.ts                 # Utility functions
├── public/                       # Static assets
├── server/
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── middleware/
│   │   └── auth.js             # JWT authentication & authorization
│   ├── models/
│   │   ├── User.js             # User schema with auth
│   │   ├── Product.js          # Product schema with reviews & offers
│   │   ├── Order.js            # Order schema
│   │   ├── Blog.js             # Blog schema
│   │   ├── News.js             # News schema
│   │   ├── Job.js              # Job postings schema
│   │   └── Wishlist.js         # User wishlist
│   ├── routes/
│   │   ├── auth.js             # Authentication endpoints
│   │   ├── products.js         # Product CRUD + reviews
│   │   ├── blogs.js            # Blog management
│   │   ├── news.js             # News management
│   │   ├── jobs.js             # Job management & applications
│   │   ├── orders.js           # Order management
│   │   ├── categories.js       # Category listing
│   │   └── wishlist.js         # Wishlist management
│   └── index.js                # Main server file
├── API_DOCUMENTATION.md         # Complete API reference
├── README.md                    # Project overview
└── SETUP_GUIDE.md              # Initial setup instructions
```

---

## Backend Features Implemented

### 1. Authentication System
- User registration & login with JWT
- Password hashing with bcrypt
- Admin and user roles
- Protected routes with middleware

### 2. Product Management
- Full CRUD operations
- Product filtering (category, subcategory, search)
- Offer/discount system with duration
- Product reviews & ratings
- Similar products recommendation
- Multiple product images
- Specifications & features

### 3. E-Commerce Features
- Shopping cart
- Order management
- Checkout process
- Order status tracking
- Customer reviews on products

### 4. Content Management
- Blog posts with CRUD
- News updates with featured items
- Job postings with application tracking

### 5. Additional Features
- Wishlist/favorites system
- Product categories & subcategories
- Search functionality
- Pagination
- Sorting options

---

## Environment Variables Setup

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/astermed
JWT_SECRET=your_jwt_secret_key_here
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

---

## Installation & Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd astermed
```

### 2. Frontend Setup
```bash
npm install
npm run dev
```
Frontend runs on: http://localhost:3000

### 3. Backend Setup
```bash
cd server
npm install
npm run dev
```
Backend runs on: http://localhost:5000

### 4. MongoDB Setup
- Install MongoDB locally or use MongoDB Atlas
- Create database named `astermed`
- Update `MONGODB_URI` in `.env`

---

## API Endpoints Summary

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Products
- `GET /api/products` - List products with filters
- `GET /api/products/featured` - Featured products
- `GET /api/products/:id` - Product details + similar products
- `POST /api/products/:id/reviews` - Add review
- `GET /api/products/:id/reviews` - Get reviews
- `POST /api/products` (admin) - Create product
- `PUT /api/products/:id` (admin) - Update product
- `DELETE /api/products/:id` (admin) - Delete product

### Categories
- `GET /api/categories` - All categories with count
- `GET /api/categories/:category/subcategories` - Subcategories

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/user/:userId` - User orders
- `GET /api/orders/:id` - Order details

### Blogs, News, Jobs
- Similar CRUD operations available
- See API_DOCUMENTATION.md for details

### Wishlist
- `GET /api/wishlist` - Get wishlist
- `POST /api/wishlist/add` - Add to wishlist
- `DELETE /api/wishlist/:productId` - Remove from wishlist

---

## Currency Implementation

All prices are in **KSH (Kenyan Shilling)**

### Using Currency Formatting
```typescript
import { formatPrice } from '@/lib/currency'

// Display price
<p>{formatPrice(45000)}</p>
// Output: "KSH 45,000.00"
```

---

## Frontend Pages

1. **Home Page** (`/`) - Featured products & categories
2. **Products** (`/products`) - Product listing with filters
3. **Product Detail** (`/products/[id]`) - Product info, reviews, similar products
4. **Shopping Cart** (`/cart`) - Cart management
5. **Checkout** (`/checkout`) - 3-step checkout process
6. **Admin Dashboard** (`/admin`) - Content management
7. **Blogs** (`/blogs`) - Blog listing
8. **News** (`/news`) - News updates
9. **Jobs** (`/jobs`) - Job listings

---

## Key Features to Highlight

✅ **Clean Design** - Glacial Indifference aesthetic with minimal, precise UI  
✅ **Responsive Layout** - Mobile-first design  
✅ **Product Detail Pages** - With reviews, ratings, and similar products  
✅ **Admin Dashboard** - Full content management system  
✅ **Offer System** - Time-based discounts with percentage off  
✅ **Wishlist** - Save favorite products  
✅ **Search & Filter** - By category, price, features  
✅ **Reviews & Ratings** - Customer feedback system  
✅ **Multi-currency Ready** - Using KSH with easy formatting utilities  

---

## Database Schemas

### Product Schema
- name, description, category, subcategory
- price, discountPrice, discountPercentage
- stock, sku, images
- specifications, features, warranty
- isOnOffer, offerStartDate, offerEndDate
- rating, reviewCount, reviews[]
- tags, slug, timestamps

### Order Schema
- userId, items[], shippingAddress
- paymentMethod, total, status
- created/updatedAt

### Review Structure
- userId, username, rating, comment
- createdAt

---

## Testing the Application

### Test User Registration
```bash
POST /api/auth/register
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

### Test Product Creation (as admin)
```bash
POST /api/products
Headers: Authorization: Bearer <token>
{
  "name": "Test Product",
  "description": "Test description",
  "category": "Diagnostic Equipment",
  "price": 45000,
  "stock": 50
}
```

---

## Production Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect Vercel to repository
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Backend (Render, Railway, or Heroku)
1. Create account on chosen platform
2. Connect GitHub repository
3. Set environment variables
4. Deploy and get public URL
5. Update frontend `NEXT_PUBLIC_API_URL`

### Database (MongoDB Atlas)
1. Create MongoDB Atlas account
2. Create cluster
3. Get connection string
4. Set `MONGODB_URI` in backend environment

---

## Troubleshooting

### "Cannot find module" errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### MongoDB connection failed
- Check `MONGODB_URI` is correct
- Ensure MongoDB is running locally OR MongoDB Atlas is accessible
- Verify network access if using MongoDB Atlas

### CORS errors
- Check `CORS_ORIGIN` matches frontend URL
- Ensure backend is running on correct port

### 404 on product detail page
- Ensure product ID exists in database
- Check MongoDB connection is active

---

## Support & Documentation

- **API Reference**: See `API_DOCUMENTATION.md`
- **Setup Guide**: See `SETUP_GUIDE.md`
- **README**: See `README.md`

For issues, check the backend logs and MongoDB collections.
