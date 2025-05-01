const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Add favorite country
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { countryCode } = req.body;
    const user = await User.findById(req.user);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!countryCode) return res.status(400).json({ message: 'Country code is required' });

    if (!user.favorites.includes(countryCode)) {
      user.favorites.push(countryCode);
      await user.save();
    }

    res.json({ favorites: user.favorites });
  } catch (err) {
    console.error('Add favorite error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get favorite countries
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ favorites: user.favorites });
  } catch (err) {
    console.error('Get favorites error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove favorite country
router.delete('/remove/:countryCode', authMiddleware, async (req, res) => {
  try {
    const { countryCode } = req.params;
    const user = await User.findById(req.user);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const initialLength = user.favorites.length;
    user.favorites = user.favorites.filter((code) => code !== countryCode);

    if (user.favorites.length === initialLength) {
      return res.status(400).json({ message: 'Country not found in favorites' });
    }

    await user.save();

    res.json({ favorites: user.favorites });
  } catch (err) {
    console.error('Remove favorite error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
