const { callAI } = require('../services/aiService');
const jwt = require('jsonwebtoken');
const store = require('../data/memoryStore');

/**
 * POST /api/chatbot/message
 * Send a message to the AI chatbot
 */
const sendMessage = async (req, res, next) => {
  try {
    const { message, language = 'en', conversationHistory = [] } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Message cannot be empty.',
      });
    }

    // Validate language
    const supportedLanguages = ['en', 'hi', 'mr'];
    const lang = supportedLanguages.includes(language) ? language : 'en';

    // Build conversation messages for the AI
    // Limit to last 10 messages to avoid token overflow
    const recentHistory = conversationHistory.slice(-10);
    const messages = [
      ...recentHistory,
      { role: 'user', content: message.trim() },
    ];

    const aiResponse = await callAI(messages, lang);

    // ── Optional User Chat History Saving ───────────────────────────
    let userId = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'govai_secret');
        userId = decoded.id;
      } catch (err) {
        // Ignore token errors and treat as guest chat
      }
    }

    if (userId) {
      if (global.useMemoryStore) {
        let existing = store.getChatHistory(userId);
        let msgs = existing ? existing.messages : [];
        msgs.push({ role: 'user', content: message.trim(), timestamp: new Date() });
        msgs.push({ role: 'assistant', content: aiResponse, timestamp: new Date() });
        store.saveChatHistory(userId, msgs);
      } else {
        const ChatHistory = require('../models/ChatHistory');
        let existing = await ChatHistory.findOne({ userId });
        let msgs = existing ? [...existing.messages] : [];
        msgs.push({ role: 'user', content: message.trim(), timestamp: new Date() });
        msgs.push({ role: 'assistant', content: aiResponse, timestamp: new Date() });

        if (existing) {
          existing.messages = msgs;
          await existing.save();
        } else {
          await ChatHistory.create({ userId, messages: msgs });
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        message: aiResponse,
        language: lang,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/chatbot/suggestions
 * Get suggested questions based on language
 */
const getSuggestions = async (req, res) => {
  const { language = 'en' } = req.query;

  const suggestions = {
    en: [
      'Am I eligible for PM-KISAN scheme?',
      'How to apply for Ayushman Bharat?',
      'What is MUDRA loan and who can apply?',
      'Tell me about housing schemes for poor families',
      'What scholarships are available for students?',
      'How to get free LPG connection under Ujjwala Yojana?',
    ],
    hi: [
      'क्या मैं पीएम किसान योजना के लिए पात्र हूं?',
      'आयुष्मान भारत के लिए आवेदन कैसे करें?',
      'MUDRA ऋण क्या है और कौन आवेदन कर सकता है?',
      'गरीब परिवारों के लिए आवास योजनाएं क्या हैं?',
      'छात्रों के लिए कौन सी छात्रवृत्ति उपलब्ध है?',
      'उज्ज्वला योजना के तहत मुफ्त गैस कनेक्शन कैसे मिलेगा?',
    ],
    mr: [
      'मी पीएम किसान योजनेसाठी पात्र आहे का?',
      'आयुष्मान भारतसाठी अर्ज कसा करावा?',
      'MUDRA कर्ज काय आहे आणि कोण अर्ज करू शकतो?',
      'गरीब कुटुंबांसाठी घर योजना काय आहेत?',
      'विद्यार्थ्यांसाठी कोणती शिष्यवृत्ती उपलब्ध आहे?',
      'उज्ज्वला योजनेत मोफत गॅस जोडणी कशी मिळेल?',
    ],
  };

  res.status(200).json({
    success: true,
    data: suggestions[language] || suggestions.en,
  });
};

/**
 * GET /api/chatbot/history
 * Fetch chat history for logged in user
 */
const getChatHistory = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.userId;
    let history = null;

    if (global.useMemoryStore) {
      history = store.getChatHistory(userId);
    } else {
      const ChatHistory = require('../models/ChatHistory');
      history = await ChatHistory.findOne({ userId });
    }

    res.status(200).json({
      success: true,
      data: history ? history.messages : [],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/chatbot/history
 * Clear chat history for logged in user
 */
const deleteChatHistory = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.userId;

    if (global.useMemoryStore) {
      store.deleteChatHistory(userId);
    } else {
      const ChatHistory = require('../models/ChatHistory');
      await ChatHistory.deleteOne({ userId });
    }

    res.status(200).json({
      success: true,
      message: 'Chat history cleared successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getSuggestions,
  getChatHistory,
  deleteChatHistory,
};

