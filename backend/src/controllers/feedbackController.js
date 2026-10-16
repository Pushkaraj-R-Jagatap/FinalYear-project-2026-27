const store = require('../data/memoryStore');
const { v4: uuidv4 } = require('uuid');

/**
 * POST /api/feedback
 * Submit feedback for a chatbot message, scheme, or fraud result
 */
const submitFeedback = async (req, res, next) => {
  try {
    const { targetType, targetId, rating, comment, helpful } = req.body;

    if (!targetType || !['chatbot', 'scheme', 'fraud'].includes(targetType)) {
      return res.status(400).json({ success: false, error: 'targetType must be chatbot, scheme, or fraud.' });
    }
    if (!rating || rating < 1 || rating > 5 || !Number.isInteger(Number(rating))) {
      return res.status(400).json({ success: false, error: 'Rating must be an integer between 1 and 5.' });
    }

    const feedback = store.addFeedback({
      targetType,
      targetId: targetId || 'general',
      rating: Number(rating),
      comment: comment ? comment.substring(0, 200) : '',
      helpful: helpful !== undefined ? Boolean(helpful) : null,
      userId: req.user?._id || null,
    });

    // Notify admin if low rating
    if (Number(rating) <= 2) {
      store.addNotification({
        userId: null,
        title: `⚠️ Low Rating Feedback (${rating}/5)`,
        message: `A citizen rated ${targetType} only ${rating}/5${comment ? `: "${comment.substring(0, 60)}"` : ''}. Please review.`,
        type: 'warning',
      });
    }

    res.status(201).json({ success: true, data: feedback, message: 'Feedback submitted successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/feedback
 * Fetch all feedback (admin)
 */
const getFeedbacks = async (req, res, next) => {
  try {
    const { targetType, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (targetType) filter.targetType = targetType;

    const all = store.getFeedbacks(filter);
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const data = all.slice(skip, skip + parseInt(limit));

    res.status(200).json({
      success: true,
      data,
      pagination: { total: all.length, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(all.length / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/feedback/stats
 * Get aggregated feedback stats
 */
const getFeedbackStats = async (req, res, next) => {
  try {
    const stats = store.getFeedbackStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitFeedback, getFeedbacks, getFeedbackStats };
