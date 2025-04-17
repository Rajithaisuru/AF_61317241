const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (payload, options = { expiresIn: '1h' }) => {
  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new Error('Invalid token');
  }
};

module.exports = {
  generateToken,
  verifyToken,
};