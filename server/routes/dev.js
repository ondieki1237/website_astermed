import express from 'express'
import User from '../models/User.js'

const router = express.Router()

// Development-only endpoint to create or promote an admin user.
// Enabled only when NODE_ENV === 'development'.
router.post('/make-admin', async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ message: 'Not allowed in this environment' })
    }

    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'Email is required' })

    let user = await User.findOne({ email })
    if (!user) {
      // create a simple dev user with a random password
      const randomPassword = Math.random().toString(36).slice(-10)
      user = new User({ name: 'Dev Admin', email, password: randomPassword, isAdmin: true })
      await user.save()
      return res.json({ message: 'Admin user created (dev)', user: { email: user.email, isAdmin: user.isAdmin } })
    }

    user.isAdmin = true
    await user.save()
    res.json({ message: 'User promoted to admin (dev)', user: { email: user.email, isAdmin: user.isAdmin } })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
