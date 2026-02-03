# M-Pesa Integration Setup Guide

## Overview
The checkout system now captures customer data and processes M-Pesa payments with the following flow:

1. Customer fills in details and proceeds to checkout
2. When "Pay with M-Pesa" is clicked:
   - Order is saved to database with status "pending" (captures abandoned cart)
   - M-Pesa STK Push is sent to customer's phone
   - Customer enters PIN on their phone
   - M-Pesa callback updates order status

## Installation Steps

### 1. Install Required Package
```bash
cd server
npm install axios
```

### 2. Get M-Pesa Credentials

#### For Testing (Sandbox):
1. Go to https://developer.safaricom.co.ke/
2. Create an account and login
3. Create a new app
4. Get the following credentials:
   - Consumer Key
   - Consumer Secret
   - Business Short Code (use test shortcode: 174379)
   - Passkey (provided in test credentials)

#### For Production:
1. Contact Safaricom to register your business
2. Apply for M-Pesa Till/Paybill number
3. Get production credentials

### 3. Add Environment Variables

Edit `server/.env` and add:

```env
# M-Pesa Configuration
MPESA_ENV=sandbox
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey_here
MPESA_CALLBACK_URL=https://astermed.codewithseth.co.ke/api/mpesa/callback
```

**Important Notes:**
- For **sandbox testing**, use: `MPESA_ENV=sandbox`
- For **production**, change to: `MPESA_ENV=production`
- Update `MPESA_CALLBACK_URL` to match your production domain
- Keep credentials secret - never commit to git!

### 4. Test Credentials (Sandbox Only)

For testing, use these Safaricom test credentials:
- Shortcode: `174379`
- Test Phone Numbers: `254708374149` or `254708000000`
- Test PIN: `1234` (Safaricom sandbox test PIN)

### 5. Restart Server

```bash
cd server
npm run dev
```

## How It Works

### Customer Flow:
1. Add products to cart
2. Go to checkout
3. Fill in shipping details (Name, Email, Phone, Facility, County, Location)
4. Click "Continue to Payment"
5. Review order details
6. Click "Pay with M-Pesa"
7. Order is saved to database (captured as pending/abandoned cart)
8. STK Push sent to phone
9. Enter M-Pesa PIN on phone
10. Payment confirmed or failed

### Admin View:
- All orders (including abandoned) are saved in the database
- View in admin dashboard: Orders tab
- Filter by status:
  - `pending` - Order created, payment not completed (abandoned cart)
  - `completed` - Payment successful
  - `failed` - Payment failed
  - `processing` - Being prepared for shipping
  - `shipped` - On the way
  - `delivered` - Completed

## API Endpoints

### Create Order (Public)
```
POST /api/orders
Body: {
  customer: { name, email, phone, role, facility, county, location },
  items: [{ productId, name, price, quantity, image }],
  subtotal: number,
  shipping: number,
  total: number,
  paymentPhone: string
}
```

### Initiate M-Pesa Payment
```
POST /api/mpesa/stk
Body: {
  phone: "254712345678",
  amount: 1000,
  orderId: "order_id_here"
}
```

### Check Payment Status
```
GET /api/mpesa/status/:orderId
```

### M-Pesa Callback (Automatic)
```
POST /api/mpesa/callback
(Called automatically by Safaricom)
```

## Testing the Integration

### 1. Local Testing (with ngrok for callback):
```bash
# Install ngrok
npm install -g ngrok

# Expose your local server
ngrok http 5000

# Update MPESA_CALLBACK_URL in .env to the ngrok URL
MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/mpesa/callback
```

### 2. Test a Payment:
1. Use test phone number: `254708374149`
2. Amount: any test amount (e.g., 100)
3. PIN: `1234`

### 3. Check Database:
```javascript
// Orders should be created with:
{
  orderNumber: "ORD-123456-ABC",
  customer: { ... },
  items: [ ... ],
  paymentStatus: "pending", // changes to "completed" after successful payment
  orderStatus: "pending",
  mpesaCheckoutRequestID: "ws_CO_...",
  mpesaReceiptNumber: "ABC123" // added after successful payment
}
```

## Troubleshooting

### Common Issues:

1. **"Invalid access token"**
   - Check MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET
   - Ensure no extra spaces in credentials

2. **"Invalid phone number"**
   - Format: 254XXXXXXXXX (no spaces, no +)
   - Starts with 254 (Kenya code)

3. **"Callback not received"**
   - For local testing, use ngrok
   - Ensure callback URL is publicly accessible
   - Check server logs for callback data

4. **"Order not found"**
   - Ensure order is created before STK push
   - Check orderId is passed correctly

5. **"STK Push not appearing on phone"**
   - Check phone number format
   - Ensure phone is on and has network
   - For sandbox, use test numbers only

## Security Notes

1. **Never expose credentials in code**
2. Use environment variables for all sensitive data
3. Keep `.env` in `.gitignore`
4. Use HTTPS in production
5. Validate callback data from M-Pesa
6. Implement rate limiting on payment endpoints
7. Log all transactions for audit purposes

## Production Checklist

Before going live:
- [ ] Change `MPESA_ENV` to `production`
- [ ] Update to production credentials
- [ ] Set production `MPESA_CALLBACK_URL`
- [ ] Test with real phone numbers
- [ ] Implement email notifications for orders
- [ ] Add admin notification system
- [ ] Set up monitoring and logging
- [ ] Configure proper error handling
- [ ] Add transaction reconciliation system
