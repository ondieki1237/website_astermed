# Admin System Documentation

## Overview
Comprehensive admin dashboard with order management, customer tracking, abandoned cart analytics, and business intelligence.

## Admin Pages Created

### 1. Main Dashboard (`/app/admin/page.tsx`)
**Features:**
- 8 key metric cards:
  - Total Orders
  - Total Revenue
  - Total Products
  - Total Customers
  - Pending Orders
  - Completed Orders
  - Abandoned Carts (tracked separately)
  - Low Stock Products
- Top Products by views
- Recent Orders list
- Navigation tabs to Orders, Products, Customers, Analytics sections

**API Endpoint:** `GET /api/admin/dashboard/stats`

### 2. Orders Management (`/app/admin/orders/page.tsx`)
**Features:**
- Search orders by order number or customer name
- Filter by status: All, Pending, Processing, Delivered
- Update order status with dropdown
- View order details (items, customer info, total)
- Export orders button (placeholder)
- Real-time status updates

**API Endpoints:**
- `GET /api/admin/orders` - Fetch all orders
- `PUT /api/admin/orders/:id/status` - Update order status

### 3. Customers Management (`/app/admin/customers/page.tsx`)
**Features:**
- **Customers Tab:**
  - List all customers with orders
  - Show total orders per customer
  - Show total spent per customer
  - Last order date
  - Contact information (email, phone)
  - Expandable order history
  - Contact customer button

- **Abandoned Carts Tab:**
  - Track customers who added items but didn't checkout
  - Show cart items and potential revenue
  - Time since cart was abandoned
  - Send reminder button
  - Apply discount button
  - Cart total and item count

**API Endpoints:**
- `GET /api/admin/customers` - Fetch customer list with order summary
- `GET /api/admin/abandoned-carts` - Fetch abandoned carts (requires cart tracking)

### 4. Analytics Dashboard (`/app/admin/analytics/page.tsx`)
**Features:**
- Key Performance Indicators:
  - Total Revenue with trend
  - Average Order Value
  - Conversion Rate (order completion)
  - Customer Lifetime Value
  
- Time range filters: 7 days, 30 days, 90 days

- **Overview Tab:**
  - Order status distribution (Pending, Completed, Abandoned)
  - Performance metrics with progress bars
  - Cart abandonment rate
  - Order completion rate
  - Low stock alerts
  - Revenue trend chart (placeholder)

- **Sales Tab:**
  - Total sales count
  - Daily average sales
  - Growth rate metrics
  - Sales performance charts (placeholder)

- **Products Tab:**
  - Total products count
  - Low stock items alert
  - Product performance metrics
  - Stock status charts (placeholder)

- **Customers Tab:**
  - Total customers count
  - Average customer value
  - Repeat purchase rate
  - Customer behavior charts (placeholder)

**API Endpoint:** `GET /api/admin/dashboard/stats`

## Backend API Routes (`/server/routes/admin.js`)

### Authentication
All routes require admin authentication via `authMiddleware`.

### Endpoints

#### 1. Dashboard Stats
```
GET /api/admin/dashboard/stats
```
**Response:**
```json
{
  "totalOrders": number,
  "totalRevenue": number,
  "totalProducts": number,
  "totalCustomers": number,
  "pendingOrders": number,
  "completedOrders": number,
  "abandonedCarts": number,
  "lowStockProducts": number,
  "topProducts": Array<{
    "_id": string,
    "name": string,
    "views": number,
    "orderCount": number,
    "revenue": number
  }>,
  "recentOrders": Array<{
    "_id": string,
    "orderNumber": string,
    "customer": object,
    "total": number,
    "status": string,
    "createdAt": date
  }>
}
```

#### 2. Get All Orders
```
GET /api/admin/orders
```
Returns array of all orders with order numbers.

#### 3. Update Order Status
```
PUT /api/admin/orders/:id/status
Body: { "status": "pending" | "processing" | "delivered" | "cancelled" }
```
Updates order status and timestamp.

#### 4. Get Customers
```
GET /api/admin/customers
```
**Response:**
```json
[
  {
    "email": string,
    "name": string,
    "phone": string,
    "totalOrders": number,
    "totalSpent": number,
    "lastOrderDate": date,
    "orders": Array<order>
  }
]
```
Groups orders by customer email and calculates aggregates.

#### 5. Get Abandoned Carts
```
GET /api/admin/abandoned-carts
```
Currently returns empty array. Requires cart tracking implementation.

## Design Features

### Color Scheme
- Primary Blue: `#1f2a7c`
- Secondary Blue: `#2535a0`
- Accent Red: `#e53935`
- Gradients: `from-[#1f2a7c] to-[#2535a0]`

### UI Components
- Cards with `shadow-lg`, `rounded-2xl`
- Gradient backgrounds for metrics
- Hover effects with `hover:shadow-xl`
- Tab navigation with gradient active states
- Responsive grid layouts (1/2/3/4 columns)
- Search bars with icons
- Status badges with color coding
- Progress bars for metrics

### Icons (lucide-react)
- Users, ShoppingCart, Package, DollarSign
- TrendingUp, AlertCircle, Clock, Mail, Phone
- BarChart3, PieChart, Activity, Calendar

## Server Integration

### Updated Files
1. `/server/routes/admin.js` - New admin routes
2. `/server/index.js` - Added admin routes import and mount

### Server Status
- Backend running on port 5088
- MongoDB connected
- Admin routes available at `/api/admin/*`

## Future Enhancements

### Cart Tracking System
To implement abandoned cart tracking:

1. **Create AbandonedCart Model:**
```javascript
// server/models/AbandonedCart.js
const abandonedCartSchema = new Schema({
  customerEmail: String,
  customerName: String,
  phone: String,
  items: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: Number
  }],
  cartTotal: Number,
  sessionId: String,
  abandonedAt: Date,
  reminderSent: Boolean,
  recovered: Boolean
});
```

2. **Track Cart Sessions:**
- Store cart data in localStorage/sessionStorage
- Send cart data to backend periodically
- Mark cart as abandoned after 30 minutes of inactivity
- Create abandoned cart record when user leaves without checkout

3. **Recovery Features:**
- Send email reminders with cart link
- Apply discount codes for abandoned carts
- Track which carts were recovered

### Chart Integration
Add charts using Recharts or Chart.js:
- Revenue trend line charts
- Order status pie charts
- Product performance bar charts
- Customer growth area charts

### Export Functionality
- Export orders to CSV/Excel
- Export customer list with metrics
- Generate PDF reports
- Schedule automated reports

### Notifications
- Real-time notifications for new orders
- Low stock alerts
- Abandoned cart reminders
- Daily/weekly summary emails

## Access Control
All admin pages check for authentication token:
```javascript
const token = localStorage.getItem('token');
```

Admin routes verify token and admin status:
```javascript
if (!req.isAdmin) {
  return res.status(403).json({ message: 'Admin access required' });
}
```

## Navigation
Access admin pages via:
- `/admin` - Main dashboard
- `/admin/orders` - Orders management
- `/admin/customers` - Customer tracking
- `/admin/analytics` - Business analytics

All pages include back-to-dashboard navigation and are styled consistently with the main site design.
