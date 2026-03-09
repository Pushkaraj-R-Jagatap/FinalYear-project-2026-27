const express = require('express');
const router = express.Router();
const {
  getAllSchemes,
  getSchemeById,
  findEligibleSchemes,
} = require('../controllers/schemeController');

// GET /api/schemes — Get all schemes (with optional ?category=&search=)
router.get('/', getAllSchemes);

// POST /api/schemes/eligible — Find eligible schemes for a user profile
router.post('/eligible', findEligibleSchemes);

// GET /api/schemes/:id — Get scheme details
router.get('/:id', getSchemeById);

module.exports = router;
