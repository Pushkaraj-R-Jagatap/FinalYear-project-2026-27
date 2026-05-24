const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getNotifications,
  markRead,
} = require('../controllers/notificationController');

// Fetch notifications (protected)
router.get('/', protect, getNotifications);

// Mark notification as read (protected)
router.put('/:id/read', protect, markRead);

module.exports = router;
