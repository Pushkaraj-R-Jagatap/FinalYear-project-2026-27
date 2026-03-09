const express = require('express');
const router = express.Router();
const { sendMessage, getSuggestions } = require('../controllers/chatbotController');

// POST /api/chatbot/message — Send message to AI
router.post('/message', sendMessage);

// GET /api/chatbot/suggestions — Get suggested questions
router.get('/suggestions', getSuggestions);

module.exports = router;
