const store = require('../data/memoryStore');
const { callAI } = require('../services/aiService');
const { v4: uuidv4 } = require('uuid');

/**
 * Run Tesseract OCR on an image buffer
 */
async function runOCR(imageBuffer) {
  const { createWorker } = require('tesseract.js');
  const worker = await createWorker('eng');
  try {
    const { data: { text } } = await worker.recognize(imageBuffer);
    return text.trim();
  } finally {
    await worker.terminate();
  }
}

/**
 * POST /api/ocr/extract
 * Extract text from an uploaded image using Tesseract OCR
 */
const extractTextFromImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file uploaded. Please upload a JPG, PNG or WebP image.' });
    }

    const text = await runOCR(req.file.buffer);

    if (!text || text.length < 10) {
      return res.status(422).json({
        success: false,
        error: 'Could not extract readable text from the image. Please upload a clearer screenshot with visible text.',
      });
    }

    res.status(200).json({
      success: true,
      data: { extractedText: text, charCount: text.length },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ocr/analyze
 * Extract text from image and analyze it for scams using AI
 */
const analyzeImageForScam = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file uploaded.' });
    }

    // Step 1: OCR
    const extractedText = await runOCR(req.file.buffer);
    if (!extractedText || extractedText.length < 10) {
      return res.status(422).json({
        success: false,
        error: 'Could not extract readable text from the image. Please upload a clearer screenshot.',
      });
    }

    // Step 2: Rule-based keyword analysis on extracted text
    let ruleScore = 0;
    const ruleReasons = [];
    const msgLower = extractedText.toLowerCase();
    const scamKeywords = [
      'free money', 'lottery', 'click to win', 'deposit bank', 'double your', 'double income',
      'guaranteed subsidy', 'registration fee', 'share aadhaar otp', 'share otp', 'urgent claim',
      'click this link', 'won a prize', 'gift card', 'giveaway', 'लॉटरी', 'मुफ्त उपहार', 'पैसे जीतें',
    ];
    const matchedKeywords = scamKeywords.filter(kw => msgLower.includes(kw));
    if (matchedKeywords.length > 0) {
      ruleScore += 40;
      ruleReasons.push(`Scam vocabulary detected in image text: ${matchedKeywords.join(', ')}.`);
    }

    // Step 3: AI analysis
    const prompt = `You are a cybersecurity expert specializing in detecting financial scams, fake government schemes, and phishing in India.
The following text was extracted from an image (screenshot/pamphlet) uploaded by a citizen:

"${extractedText.substring(0, 1000)}"

Determine:
1. Is this a scam, fake scheme, or phishing attempt?
2. What is the risk score (0 to 100)?
3. What is the specific reason?

Return ONLY a valid JSON object (no markdown, no code blocks):
{"score": 85, "isScam": true, "reason": "Explain in 1-2 clear sentences why this is a scam/safe in the context of Indian citizen awareness."}`;

    let aiScore = ruleScore;
    let aiReason = '';
    try {
      const aiResponse = await callAI([{ role: 'user', content: prompt }], 'en');
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const aiResult = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
      aiScore = aiResult.score || ruleScore;
      aiReason = aiResult.reason || '';
    } catch (err) {
      console.warn('AI OCR analysis fallback:', err.message);
      aiReason = ruleReasons.join(' ') || 'Pattern analysis applied to extracted image text.';
    }

    const finalScore = Math.min(Math.max(ruleScore, aiScore), 100);
    const finalReasons = [...new Set([...ruleReasons, aiReason])].filter(Boolean);
    const riskLevel = finalScore <= 30 ? 'low' : finalScore <= 60 ? 'medium' : 'high';

    // Step 4: Save report
    const randId = Math.random().toString(36).substr(2, 9).toUpperCase();
    const reportData = {
      reportId: `REP-${randId}`,
      fraudType: 'ocr_image',
      suspiciousLink: '',
      scamMessage: extractedText.substring(0, 500),
      confidenceScore: finalScore,
      description: finalReasons.join(' '),
      status: finalScore > 40 ? 'under_review' : 'open',
    };
    const savedReport = store.addFraudReport(reportData);

    // Step 5: Notify admin if high/medium risk
    if (finalScore >= 50) {
      store.addNotification({
        userId: null,
        title: `🖼️ OCR Scam Image Flagged: ${riskLevel.toUpperCase()} RISK`,
        message: `A citizen uploaded a suspicious image. Score: ${finalScore}%. Text preview: "${extractedText.substring(0, 60)}..."`,
        type: 'fraud_alert',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        reportId: savedReport.reportId,
        fraudType: 'ocr_image',
        ocrExtracted: true,
        extractedText,
        confidenceScore: finalScore,
        riskLevel,
        isScam: finalScore > 30,
        reasons: finalReasons,
        createdAt: savedReport.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { extractTextFromImage, analyzeImageForScam };
