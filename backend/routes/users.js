const express = require('express');
const router = express.Router();
const User = require('../models/User');

// TEMP: simple route to confirm server works
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
