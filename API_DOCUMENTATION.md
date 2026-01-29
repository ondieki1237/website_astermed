# AsterMed API Documentation

## Base URL
```
http://localhost:5088/api
```

## Authentication
All protected endpoints require a JWT token in the `Authorization` header:
```
Authorization: Bearer {token}
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "user" // or "admin"
}
```

**Response:** `{ token, user }`

### Login
**POST** `/auth/login`

```json
{
  "email": "string",
  "password": "string"
}
```

**Response:** `{ token, user }`

---

## Product Endpoints

### Get All Products (with filters)
**GET** `/products?category=string&subcategory=string&search=string&page=1&limit=12&sort=-createdAt`

**Response:**
```json
{
  "products": [...],
  "total": number,
  "pages": number,
  "currentPage": number
}
```

### Get Featured Products
**GET** `/products/featured`

**Response:** `[products]`

### Get Single Product
**GET** `/products/:id`

**Response:**
```json
{
  "product": {...},
  "similarProducts": [...]
}
```

### Add Product Review
**POST** `/products/:id/reviews` (Protected)

```json
{
  "rating": 1-5,
  "comment": "string",
  "username": "string"
}
```

### Get Product Reviews
**GET** `/products/:id/reviews`

**Response:** `[reviews]`

### Create Product (Admin only)
**POST** `/products` (Protected)

```json
{
  "name": "string",
  "description": "string",
  "category": "string",
  "subcategory": "string",
  "price": number,
  "discountPercentage": number,
  "stock": number,
  "image": "url",
  "images": ["url"],
  "features": ["string"],
  "specifications": { "key": "value" },
  "warranty": "string"
}
```

### Update Product (Admin only)
**PUT** `/products/:id` (Protected)

Same body structure as Create Product

### Delete Product (Admin only)
**DELETE** `/products/:id` (Protected)

---

## Category Endpoints

### Get All Categories
**GET** `/categories`

**Response:**
```json
[
  {
    "name": "string",
    "count": number
  }
]
```

### Get Subcategories by Category
**GET** `/categories/:category/subcategories`

**Response:** `["subcategory1", "subcategory2"]`

---

## Order Endpoints

### Create Order
**POST** `/orders` (Protected)

```json
{
  "items": [
    {
      "productId": "string",
      "quantity": number,
      "price": number
    }
  ],
  "shippingAddress": {
    "street": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string",
    "country": "string"
  },
  "paymentMethod": "string",
  "total": number
}
```

### Get User Orders
**GET** `/orders/user/:userId` (Protected)

**Response:** `[orders]`

### Get Order Details
**GET** `/orders/:id` (Protected)

**Response:** `{ order }`

---

## Wishlist Endpoints

### Get Wishlist
**GET** `/wishlist` (Protected)

**Response:**
```json
{
  "products": [
    {
      "productId": {...},
      "addedAt": "timestamp"
    }
  ]
}
```

### Add to Wishlist
**POST** `/wishlist/add` (Protected)

```json
{
  "productId": "string"
}
```

### Remove from Wishlist
**DELETE** `/wishlist/:productId` (Protected)

---

## Blog Endpoints

### Get All Blogs
**GET** `/blogs?page=1&limit=10`

**Response:**
```json
{
  "blogs": [...],
  "total": number
}
```

### Get Single Blog
**GET** `/blogs/:id`

**Response:** `{ blog }`

### Create Blog (Admin only)
**POST** `/blogs` (Protected)

```json
{
  "title": "string",
  "content": "string",
  "image": "url",
  "category": "string"
}
```

### Update Blog (Admin only)
**PUT** `/blogs/:id` (Protected)

### Delete Blog (Admin only)
**DELETE** `/blogs/:id` (Protected)

---

## Error Responses

All errors follow this format:
```json
{
  "message": "Error description"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## Notes

- All prices are in KSH (Kenyan Shilling)
- Pagination defaults: page=1, limit=12
- Sorting format: `-field` for descending, `field` for ascending
- All timestamps are in ISO 8601 format
