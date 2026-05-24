const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  submitApplication,
  getFraudAlerts,
  updateAlertStatus,
  getFraudStats,
  verifySuspiciousInput,
  getFraudReports,
} = require('../controllers/fraudController');

// POST /api/applications — Submit application (public)
router.post('/applications', submitApplication);

// POST /api/fraud/verify — Verify suspicious link or message (public)
router.post('/verify', verifySuspiciousInput);

// GET /api/fraud/reports — Get all verified scam reports (public)
router.get('/reports', getFraudReports);

// GET /api/fraud/alerts — Get all fraud alerts (admin only)
router.get('/alerts', protect, getFraudAlerts);

// PUT /api/fraud/alerts/:id — Update alert status (admin only)
router.put('/alerts/:id', protect, updateAlertStatus);

// GET /api/fraud/stats — Fraud statistics (admin only)
router.get('/stats', protect, getFraudStats);

module.exports = router;

