const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  login,
  getDashboardStats,
  getApplications,
  getMe,
} = require('../controllers/adminController');

// POST /api/admin/login — Authenticate admin
router.post('/login', login);

// Protected admin routes (require JWT)
router.get('/me', protect, getMe);
router.get('/stats', protect, getDashboardStats);
router.get('/applications', protect, getApplications);

module.exports = router;
