const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  sendMessage,
  getSuggestions,
  getChatHistory,
  deleteChatHistory,
} = require('../controllers/chatbotController');

// POST /api/chatbot/message — Send message to AI
router.post('/message', sendMessage);

// GET /api/chatbot/suggestions — Get suggested questions
router.get('/suggestions', getSuggestions);

// GET /api/chatbot/history — Get chat history
router.get('/history', protect, getChatHistory);

// DELETE /api/chatbot/history — Delete chat history
router.delete('/history', protect, deleteChatHistory);

module.exports = router;

