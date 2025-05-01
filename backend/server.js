const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const favoritesRoutes = require('./routes/favorites');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB error:', err));

// Test route
app.get('/api/test', (req, res) => {
  res.send('Server is up and running!');
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoritesRoutes);

module.exports = (req, res) => {
  app(req, res); // allow Express to handle the request
};
