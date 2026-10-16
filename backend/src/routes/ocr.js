const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/upload');
const { extractTextFromImage, analyzeImageForScam } = require('../controllers/ocrController');

router.post('/extract', upload.single('image'), extractTextFromImage);
router.post('/analyze', upload.single('image'), analyzeImageForScam);

module.exports = router;
