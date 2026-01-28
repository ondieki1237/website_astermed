import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({ name, email, password, phone });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

// GET /api/auth/me - verify token and return basic user info
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -adminCode -adminCodeExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin email OTP flow
// POST /api/auth/admin/request-code  { email }
router.post('/admin/request-code', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail && email.toLowerCase() !== adminEmail.toLowerCase()) {
      return res.status(403).json({ message: 'Unauthorized: email not allowed for admin access' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.isAdmin) return res.status(403).json({ message: 'Unauthorized: no admin user found for this email' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hashed = await bcrypt.hash(code, 10);
    user.adminCode = hashed;
    user.adminCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send email if SMTP configured, otherwise log the code for dev
    if (process.env.SMTP_HOST || process.env.SMTP_USER || process.env.SMTP_PASS) {
      const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10)
      const secureFlag = (process.env.SMTP_SECURE === 'true') || smtpPort === 465
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'mail.astermedsupplies.co.ke',
        port: smtpPort,
        secure: secureFlag,
        auth: {
          user: process.env.SMTP_USER || 'seth@astermedsupplies.co.ke',
          pass: process.env.SMTP_PASS || 'seth123qP1',
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const from = process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@localhost';
      const subject = 'Your admin access code';
      const text = `Your admin access code is: ${code}. It expires in 10 minutes.`;

      try {
        await transporter.sendMail({ from, to: email, subject, text });
      } catch (err) {
        console.error('Failed to send admin OTP via SMTP:', err && err.message ? err.message : err)
        return res.status(500).json({ message: `Failed to send email: ${err && err.message ? err.message : 'unknown error'}` })
      }
    } else {
      // fallback: print to server logs (dev only)
      console.log(`Admin OTP for ${email}: ${code}`);
    }

    res.json({ message: 'Code sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/admin/verify-code  { email, code }
router.post('/admin/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ message: 'Email and code are required' });

    const user = await User.findOne({ email });
    if (!user || !user.isAdmin) return res.status(403).json({ message: 'Unauthorized: no admin user found for this email' });

    if (!user.adminCode || !user.adminCodeExpires || Date.now() > user.adminCodeExpires) {
      return res.status(400).json({ message: 'Code expired or not found' });
    }

    const isMatch = await bcrypt.compare(code, user.adminCode);
    if (!isMatch) return res.status(400).json({ message: 'Invalid code' });

    // clear code
    user.adminCode = undefined;
    user.adminCodeExpires = undefined;
    await user.save();

    const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
