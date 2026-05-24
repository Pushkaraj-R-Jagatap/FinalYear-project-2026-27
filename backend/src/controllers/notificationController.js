const store = require('../data/memoryStore');
const Notification = require('../models/Notification');

/**
 * GET /api/notifications
 * Fetch notifications for logged-in user or admin
 */
const getNotifications = async (req, res, next) => {
  try {
    // If admin, retrieve global notifications (userId === null)
    // If citizen user, retrieve their specific notifications
    const isUserIdAdmin = req.user && req.user.role === 'admin';
    const userId = isUserIdAdmin ? null : req.user._id || req.user.userId;
    let list = [];

    if (global.useMemoryStore) {
      list = store.getNotifications(userId);
    } else {
      list = await Notification.find({ userId }).sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      data: list,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/notifications/:id/read
 * Mark notification as read
 */
const markRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    let updated = null;

    if (global.useMemoryStore) {
      updated = store.markNotificationRead(id);
    } else {
      updated = await Notification.findByIdAndUpdate(
        id,
        { read: true },
        { new: true }
      );
    }

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications, markRead };
