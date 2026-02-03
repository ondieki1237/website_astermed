import express from 'express'
import axios from 'axios'
import Order from '../models/Order.js'

const router = express.Router()

// M-Pesa Configuration - add these to .env file
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || ''
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || ''
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE || ''
const MPESA_PASSKEY = process.env.MPESA_PASSKEY || ''
const MPESA_CALLBACK_URL = process.env.MPESA_CALLBACK_URL || 'https://astermed.codewithseth.co.ke/api/mpesa/callback'
const MPESA_ENV = process.env.MPESA_ENV || 'sandbox' // 'sandbox' or 'production'

// Get M-Pesa Access Token
async function getMpesaAccessToken() {
  try {
    const url = MPESA_ENV === 'production'
      ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
      : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
    
    const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64')
    const response = await axios.get(url, {
      headers: { Authorization: `Basic ${auth}` }
    })
    return response.data.access_token
  } catch (error) {
    console.error('Error getting M-Pesa token:', error.response?.data || error.message)
    throw new Error('Failed to get M-Pesa access token')
  }
}

// STK Push endpoint
router.post('/stk', async (req, res) => {
  try {
    const { phone, amount, orderId } = req.body
    
    // Validation
    if (!phone || !amount || !orderId) {
      return res.status(400).json({ message: 'phone, amount, and orderId are required' })
    }

    // Format phone number (remove + and spaces, ensure it starts with 254)
    let formattedPhone = phone.replace(/\s+/g, '').replace(/^\+/, '')
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1)
    }
    if (!formattedPhone.startsWith('254')) {
      return res.status(400).json({ message: 'Invalid phone number format. Use 254XXXXXXXXX' })
    }

    // Get access token
    const accessToken = await getMpesaAccessToken()

    // Generate timestamp
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)
    
    // Generate password
    const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64')

    // STK Push URL
    const stkUrl = MPESA_ENV === 'production'
      ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
      : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'

    // STK Push request
    const stkData = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: MPESA_CALLBACK_URL,
      AccountReference: `ORDER${orderId}`,
      TransactionDesc: 'AsterMed Order Payment'
    }

    const response = await axios.post(stkUrl, stkData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    // Update order with checkout request ID
    await Order.findByIdAndUpdate(orderId, {
      mpesaCheckoutRequestID: response.data.CheckoutRequestID,
      updatedAt: new Date()
    })

    return res.json({
      success: true,
      message: 'STK Push sent. Please check your phone.',
      checkoutRequestID: response.data.CheckoutRequestID,
      orderId
    })
  } catch (error) {
    console.error('M-Pesa STK Push error:', error.response?.data || error.message)
    return res.status(500).json({ 
      message: error.response?.data?.errorMessage || error.message || 'Payment request failed'
    })
  }
})

// M-Pesa Callback endpoint
router.post('/callback', async (req, res) => {
  try {
    console.log('M-Pesa Callback received:', JSON.stringify(req.body, null, 2))
    
    const { Body } = req.body
    if (!Body || !Body.stkCallback) {
      return res.json({ message: 'Invalid callback data' })
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = Body.stkCallback

    // Find order by checkout request ID
    const order = await Order.findOne({ mpesaCheckoutRequestID: CheckoutRequestID })
    
    if (!order) {
      console.log('Order not found for CheckoutRequestID:', CheckoutRequestID)
      return res.json({ message: 'Order not found' })
    }

    if (ResultCode === 0) {
      // Payment successful
      const metadata = CallbackMetadata?.Item || []
      const receiptNumber = metadata.find(item => item.Name === 'MpesaReceiptNumber')?.Value || ''
      
      order.paymentStatus = 'completed'
      order.orderStatus = 'processing'
      order.mpesaReceiptNumber = receiptNumber
      order.updatedAt = new Date()
      await order.save()
      
      console.log(`Payment successful for order ${order.orderNumber}. Receipt: ${receiptNumber}`)
    } else {
      // Payment failed
      order.paymentStatus = 'failed'
      order.updatedAt = new Date()
      await order.save()
      
      console.log(`Payment failed for order ${order.orderNumber}. Reason: ${ResultDesc}`)
    }

    return res.json({ message: 'Callback processed' })
  } catch (error) {
    console.error('M-Pesa callback error:', error)
    return res.json({ message: 'Callback processed with errors' })
  }
})

// Check payment status
router.get('/status/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    
    return res.json({
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      mpesaReceiptNumber: order.mpesaReceiptNumber
    })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

export default router
