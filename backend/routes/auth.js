const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Admin login endpoint
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Check if credentials match environment variables
    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Find or create admin user
    let admin = await User.findOne({ email, isAdmin: true });

    if (!admin) {
      admin = await User.create({
        email,
        password,
        role: 'admin',
        isAdmin: true
      });
      console.log('✅ Admin user created');
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: admin._id, 
        email: admin.email, 
        isAdmin: true 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
        isAdmin: true
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
