const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getAllSchemes,
  getSchemeById,
  findEligibleSchemes,
  createScheme,
  updateScheme,
  deleteScheme,
} = require('../controllers/schemeController');

// GET /api/schemes — Get all schemes (with optional ?category=&search=)
router.get('/', getAllSchemes);

// POST /api/schemes/eligible — Find eligible schemes for a user profile
router.post('/eligible', findEligibleSchemes);

// GET /api/schemes/:id — Get scheme details
router.get('/:id', getSchemeById);

// Admin Scheme CRUD
router.post('/', protect, adminOnly, createScheme);
router.put('/:id', protect, adminOnly, updateScheme);
router.delete('/:id', protect, adminOnly, deleteScheme);

module.exports = router;

