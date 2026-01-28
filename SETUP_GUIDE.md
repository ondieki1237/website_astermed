# AsterMed E-Commerce Platform - Quick Start Guide

## Getting Started in 5 Minutes

### Step 1: Frontend Setup

```bash
# Install dependencies (from root directory)
npm install

# Run development server
npm run dev

# Open browser: http://localhost:3000
```

### Step 2: Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file with:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/astermed
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Start MongoDB locally (if using local instance)
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
# Windows: net start MongoDB

# Run development server
npm run dev

# API available at: http://localhost:5000
```

## Project Features Overview

### Customer-Facing Pages
- **Home** (`/`) - Featured products and categories
- **Products** (`/products`) - Full catalog with filtering and search
- **Cart** (`/cart`) - Shopping cart management
- **Checkout** (`/checkout`) - 3-step checkout process
- **Blogs** (`/blogs`) - Healthcare articles
- **News** (`/news`) - Company announcements
- **Jobs** (`/jobs`) - Job postings

### Admin Dashboard
- **Admin Dashboard** (`/admin`) - Overview and management
  - Products tab: Add, edit, delete products
  - Offers tab: Create time-based discounts
  - Blogs & News: Manage content
  - Jobs: Post job openings

## Key Features Included

✅ **Product Management**
- Browse products by category
- Filter and search functionality
- Product details with images
- Stock tracking

✅ **Offer System**
- Create time-limited offers
- Percentage discounts
- Set start and end dates
- Display on product pages

✅ **E-Commerce**
- Shopping cart with quantities
- Checkout with 3 steps
- Order summary
- Free shipping over $100

✅ **Content Management**
- Blog post publishing
- News announcements
- Job posting system
- Featured content options

✅ **Admin Dashboard**
- Overview statistics
- Tabbed interface for easy management
- Quick actions for common tasks
- Data display tables

## Color Scheme

Your brand colors are integrated throughout:
- **Primary**: #192064 (Navy Blue) - Headers, buttons, primary actions
- **Accent**: #DC143C (Red) - Highlights, offers, calls-to-action
- **Background**: White/Light backgrounds for readability
- **Dark Mode**: Included with darker variants

## API Integration

The frontend is ready to connect to the backend API. Currently using mock data for demonstration.

To connect to real API, update the API base URL in components (look for `fetch('/api/...` or create a `lib/api.ts` file with your API configuration.

Example:
```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function fetchProducts(category?: string) {
  const url = new URL(`${API_BASE}/api/products`);
  if (category) url.searchParams.append('category', category);
  const res = await fetch(url);
  return res.json();
}
```

## Database Setup

MongoDB collections automatically created by Mongoose when first accessed:
- `users` - User accounts
- `products` - Product catalog
- `orders` - Customer orders
- `blogs` - Blog posts
- `news` - News items
- `jobs` - Job postings

## Authentication Flow

1. User registers/logs in via the API
2. JWT token returned and stored
3. Token included in Authorization header for protected routes
4. Admin users can access admin dashboard

Currently, authentication is implemented in the backend. To fully integrate:
- Add login page (`/login`)
- Add register page (`/register`)
- Implement token storage (localStorage/cookies)
- Add protected route middleware

## Deployment Checklist

### Before Deploying

- [ ] Set all environment variables
- [ ] Configure MongoDB Atlas (or equivalent)
- [ ] Set JWT_SECRET to a strong random string
- [ ] Update CORS_ORIGIN to your production domain
- [ ] Test all API endpoints
- [ ] Verify file uploads work (if implemented)
- [ ] Test checkout flow end-to-end

### Frontend Deployment (Vercel)

```bash
# Commit code to GitHub
git add .
git commit -m "Initial commit"
git push origin main

# Go to vercel.com, connect your GitHub repo
# Set environment variables in Vercel dashboard
# Deploy automatically on push
```

### Backend Deployment (Any Node.js Host)

Options:
- **Heroku**: `heroku create`, `git push heroku main`
- **Railway**: Connect GitHub repo
- **DigitalOcean**: Deploy with App Platform
- **AWS**: EC2 or Elastic Beanstalk

## Testing the Application

### Test User Accounts
(Create these after setting up backend)

```
Admin Account:
Email: admin@astermed.com
Password: Admin123!
```

### Test Products
- Digital Blood Pressure Monitor - $89.99 (20% off)
- Stethoscope Professional Grade - $149.99 (15% off)
- Surgical Face Masks - $24.99

### Test Admin Features
1. Login with admin account
2. Go to `/admin`
3. Try creating a new product
4. Create an offer with end date
5. Write a blog post
6. Post a job opening

## Troubleshooting

### Frontend not loading?
- Check Node.js version (18+)
- Clear `.next` folder: `rm -rf .next`
- Reinstall: `rm -rf node_modules && npm install`

### Backend connection errors?
- Ensure MongoDB is running
- Check `.env` file settings
- Verify port 5000 is not in use
- Check CORS_ORIGIN matches frontend URL

### Database issues?
- For local MongoDB: Start service before running server
- For MongoDB Atlas: Check connection string
- Verify IP whitelist in MongoDB Atlas settings

## Next Steps

1. **Implement Authentication Pages**
   - Create login page
   - Create register page
   - Add user profile page

2. **Connect Real Data**
   - Replace mock data with API calls
   - Implement real product filtering
   - Add real order management

3. **Payment Integration**
   - Add Stripe or PayPal
   - Implement payment processing
   - Add order confirmation emails

4. **Additional Features**
   - User wishlist
   - Product reviews
   - Email notifications
   - Advanced analytics

5. **Optimization**
   - Image optimization
   - Caching strategies
   - Database indexing
   - Performance monitoring

## Support

For questions or issues:
- Check the README.md for detailed documentation
- Review the API endpoints in the backend code
- Check console logs for errors
- Verify environment variables are set correctly

Happy building! 🚀
