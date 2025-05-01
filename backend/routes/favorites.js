const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Add favorite country
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { countryCode } = req.body;
    console.log('Adding favorite:', { userId: req.user, countryCode });
    
    const user = await User.findById(req.user);
    if (!user) {
      console.error('User not found:', req.user);
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!countryCode) {
      console.error('No country code provided');
      return res.status(400).json({ message: 'Country code is required' });
    }

    if (!user.favorites.includes(countryCode)) {
      user.favorites.push(countryCode);
      await user.save();
      console.log('Favorite added successfully:', { userId: req.user, favorites: user.favorites });
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
    console.log('Getting favorites for user:', req.user);
    const user = await User.findById(req.user);
    if (!user) {
      console.error('User not found:', req.user);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Favorites found:', user.favorites);
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
    console.log('Removing favorite:', { userId: req.user, countryCode });
    
    const user = await User.findById(req.user);
    if (!user) {
      console.error('User not found:', req.user);
      return res.status(404).json({ message: 'User not found' });
    }

    const initialLength = user.favorites.length;
    user.favorites = user.favorites.filter((code) => code !== countryCode);

    if (user.favorites.length === initialLength) {
      console.error('Country not found in favorites:', countryCode);
      return res.status(400).json({ message: 'Country not found in favorites' });
    }

    await user.save();
    console.log('Favorite removed successfully:', { userId: req.user, favorites: user.favorites });

    res.json({ favorites: user.favorites });
  } catch (err) {
    console.error('Remove favorite error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
