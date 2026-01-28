import express from 'express'

const router = express.Router()

// This is a placeholder endpoint for initiating an M-Pesa STK push.
// In production integrate with the M-Pesa API (Safaricom) and secure keys.
router.post('/stk', async (req, res) => {
  try {
    const { phone, amount, reference } = req.body
    // Basic validation
    if (!phone || !amount) {
      return res.status(400).json({ message: 'phone and amount are required' })
    }

    // TODO: integrate with M-Pesa STK Push here.
    // For now, respond with a simulated success response.
    return res.json({ status: 'initiated', message: `STK Push initiated to ${phone}`, phone, amount, reference })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

export default router
