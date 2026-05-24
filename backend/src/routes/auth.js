const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  getProfile,
  updateProfile,
} = require('../controllers/authController');

// Citizen Registration
router.post('/register', register);

// Citizen Login
router.post('/login', login);

// Get profile (protected)
router.get('/profile', protect, getProfile);

// Update profile (protected)
router.put('/profile', protect, updateProfile);

module.exports = router;
