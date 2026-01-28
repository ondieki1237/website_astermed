# AsterMed - Medical Supplier E-Commerce Platform

A full-stack e-commerce platform for medical supplies and equipment with comprehensive admin dashboard for managing products, offers, blogs, news, and job postings.

## Project Structure

```
/
├── app/                          # Next.js frontend (React)
│   ├── page.tsx                 # Home page with featured products
│   ├── products/                # Product catalog with filtering
│   ├── cart/                    # Shopping cart page
│   ├── checkout/                # Checkout process (3-step)
│   ├── blogs/                   # Blog article listing
│   ├── news/                    # Company news
│   ├── jobs/                    # Job postings
│   ├── admin/                   # Admin dashboard
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles & design tokens
│
├── components/
│   ├── header.tsx               # Navigation header
│   ├── footer.tsx               # Footer with links
│   └── ui/                      # shadcn/ui components
│
├── server/                      # Node.js/Express backend
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── models/                  # Database schemas
│   │   ├── User.js             # User authentication
│   │   ├── Product.js          # Product catalog
│   │   ├── Order.js            # Order management
│   │   ├── Blog.js             # Blog posts
│   │   ├── News.js             # News items
│   │   └── Job.js              # Job postings
│   ├── routes/                  # API endpoints
│   │   ├── auth.js             # Authentication (login/register)
│   │   ├── products.js         # Product CRUD
│   │   ├── blogs.js            # Blog management
│   │   └── orders.js           # Order processing
│   ├── middleware/
│   │   └── auth.js             # JWT authentication
│   ├── index.js                # Express server setup
│   └── package.json            # Backend dependencies
│
└── public/                      # Static assets
```

## Features

### Customer Features
- **Product Browsing**: Browse products by categories with filtering and search
- **Product Details**: View detailed product information with images and specifications
- **Shopping Cart**: Add/remove products, manage quantities
- **Checkout**: 3-step checkout process (shipping, payment, review)
- **Order Management**: Track orders and order history
- **Blog/News**: Read healthcare articles and company updates
- **Job Portal**: Browse and apply for job openings

### Admin Features
- **Product Management**: Create, edit, delete products
- **Offer Management**: Create time-based offers with duration and discount percentage
- **Blog Management**: Write and publish blog posts
- **News Management**: Post company news and announcements
- **Job Management**: Post job openings and manage applications
- **Analytics Dashboard**: View key metrics and statistics

### Design
- **Color Scheme**: #192064 (Navy Blue), Red (#DC143C), Black, White
- **Responsive Design**: Mobile-first approach, optimized for all screen sizes
- **Professional UI**: Clean, modern interface with smooth interactions

## Tech Stack

### Frontend
- **Framework**: Next.js 16
- **UI Library**: React 19.2 with TypeScript
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **Icons**: Lucide Icons
- **State Management**: React hooks, SWR (for data fetching)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password**: bcrypt for hashing
- **Middleware**: CORS, express.json()

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm/pnpm
- MongoDB (local or cloud - Atlas)

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/astermed
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

4. Run development server:
```bash
npm run dev
```

The backend API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products (with filters)
  - Query params: `category`, `search`, `page`, `limit`
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/user/:userId` - Get user's orders
- `GET /api/orders/:id` - Get order details

### Blogs
- `GET /api/blogs` - Get published blogs
- `GET /api/blogs/:id` - Get single blog
- `POST /api/blogs` - Create blog (admin only)
- `PUT /api/blogs/:id` - Update blog (admin only)
- `DELETE /api/blogs/:id` - Delete blog (admin only)

## Database Schemas

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  address: {
    street, city, state, zipCode, country
  },
  isAdmin: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Product
```javascript
{
  name: String,
  description: String,
  category: String,
  price: Number,
  discountPrice: Number,
  discountPercentage: Number,
  stock: Number,
  image: String,
  images: [String],
  isOnOffer: Boolean,
  offerStartDate: Date,
  offerEndDate: Date,
  rating: Number,
  reviews: Array,
  createdAt: Date
}
```

### Order
```javascript
{
  userId: ObjectId (ref: User),
  items: [{
    productId, name, price, quantity, image
  }],
  totalPrice: Number,
  shippingAddress: {
    street, city, state, zipCode, country
  },
  paymentStatus: String (pending/completed/failed),
  orderStatus: String (pending/processing/shipped/delivered/cancelled),
  createdAt: Date
}
```

## Authentication

The API uses JWT tokens for authentication:

1. User registers or logs in
2. Server returns JWT token (valid for 7 days)
3. Client stores token in localStorage/cookies
4. Client includes token in Authorization header for protected routes
5. Server validates token with `authMiddleware`

Protected routes require:
```
Authorization: Bearer <token>
```

Admin routes additionally require `isAdmin: true` in the token payload.

## Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set environment variables
3. Deploy automatically on push to main branch

### Backend (Any Node.js host)
1. Deploy to Heroku, Railway, DigitalOcean, or similar
2. Set environment variables
3. Ensure MongoDB is accessible from the server

## Development Features

- Hot reload on both frontend and backend
- TypeScript support for type safety
- ESLint and Prettier configured
- Comprehensive error handling
- CORS configured for local development

## Future Enhancements

- [ ] Payment gateway integration (Stripe)
- [ ] Email notifications
- [ ] Advanced analytics dashboard
- [ ] Inventory management system
- [ ] Customer reviews and ratings
- [ ] Wishlist functionality
- [ ] Multi-language support
- [ ] Advanced search with filters
- [ ] Bulk ordering for healthcare facilities
- [ ] API rate limiting and caching

## Security Considerations

- Passwords hashed with bcrypt
- JWT tokens with expiration
- Admin middleware for protected routes
- Input validation on all endpoints
- CORS configured
- HTTP-only cookies recommended for production
- Environment variables for sensitive data

## Support & Contact

For issues, questions, or support:
- Email: info@astermedsupplies.co.ke
- Phone: +1 (800) 123-4567
- Website: www.astermedsupplies.co.ke

---

Built with ❤️ for healthcare professionals
# website_astermed
