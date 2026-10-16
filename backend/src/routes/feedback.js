const express = require('express');
const router = express.Router();
const { submitFeedback, getFeedbacks, getFeedbackStats } = require('../controllers/feedbackController');

router.post('/', submitFeedback);
router.get('/stats', getFeedbackStats);
router.get('/', getFeedbacks);

module.exports = router;
