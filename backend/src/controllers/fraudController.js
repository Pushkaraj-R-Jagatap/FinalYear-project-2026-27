const store = require('../data/memoryStore');
const {
  detectFraud,
  createFraudAlert,
} = require('../services/fraudDetectionService');
const { v4: uuidv4 } = require('uuid');
const { callAI } = require('../services/aiService');
const FraudReport = require('../models/FraudReport');

/**
 * POST /api/applications
 * Submit a new scheme application with automatic fraud detection
 */
const submitApplication = async (req, res, next) => {
  try {
    const { schemeId, applicant } = req.body;

    if (!applicant || !applicant.name || !applicant.age) {
      return res.status(400).json({
        success: false,
        error: 'Applicant name and age are required.',
      });
    }

    const scheme = store.getSchemeById(schemeId);
    const now = new Date();
    const id = uuidv4().split('-')[0].toUpperCase();

    const applicationData = {
      _id: `app-${id}`,
      applicationId: `APP-${id}`,
      schemeId: schemeId || null,
      schemeName: scheme ? scheme.name : req.body.schemeName || 'Unknown Scheme',
      applicant: {
        ...applicant,
        aadhaarHash: applicant.aadhaarNumber ? `HASH_${applicant.aadhaarNumber}` : undefined,
        bankAccountHash: applicant.bankAccount ? `HASH_${applicant.bankAccount}` : undefined,
      },
      metadata: {
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
        userAgent: req.headers['user-agent'],
        submittedAt: now,
      },
      createdAt: now,
      updatedAt: now,
    };

    const fraudResult = await detectFraud(applicationData);

    const application = store.addApplication({
      ...applicationData,
      fraudFlags: fraudResult.fraudFlags,
      fraudScore: fraudResult.fraudScore,
      fraudLevel: fraudResult.fraudLevel,
      isFlagged: fraudResult.isFlagged,
      status: fraudResult.isFlagged ? 'under_review' : 'pending',
    });

    let fraudAlert = null;
    if (fraudResult.isFlagged) {
      fraudAlert = await createFraudAlert(application, fraudResult);
    }

    res.status(201).json({
      success: true,
      message: fraudResult.isFlagged
        ? 'Application submitted but flagged for review due to suspicious activity.'
        : 'Application submitted successfully.',
      data: {
        applicationId: application.applicationId,
        status: application.status,
        fraudScore: application.fraudScore,
        fraudLevel: application.fraudLevel,
        isFlagged: application.isFlagged,
        alertId: fraudAlert?.alertId,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/fraud/alerts
 */
const getFraudAlerts = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 20, status, level,
      sortBy = 'fraudScore', sortOrder = 'desc',
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (level) filter.fraudLevel = level;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const { data: alerts, total } = store.getAlerts(filter, {
      skip, limit: parseInt(limit), sortBy, sortOrder,
    });

    res.status(200).json({
      success: true,
      data: alerts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/fraud/alerts/:id
 * Update fraud alert status
 */
const updateAlertStatus = async (req, res, next) => {
  try {
    const { status, notes, resolvedBy } = req.body;

    const alert = store.updateAlert(req.params.id, {
      status,
      notes,
      resolvedBy: resolvedBy || req.admin?.username,
      resolvedAt: ['resolved', 'dismissed'].includes(status) ? new Date() : undefined,
    });

    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found.' });
    }

    if (['resolved', 'dismissed'].includes(status)) {
      store.updateApplication(alert.applicationId, {
        status: status === 'resolved' ? 'rejected' : 'pending',
      });
    }

    res.status(200).json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/fraud/stats
 */
const getFraudStats = async (req, res, next) => {
  try {
    const totalAlerts = store.countAlerts();
    const openAlerts = store.countAlerts({ status: 'open' });

    const levelCounts = {};
    store.fraudAlerts.forEach(a => {
      levelCounts[a.fraudLevel] = (levelCounts[a.fraudLevel] || 0) + 1;
    });

    const byScheme = store.groupAlertsBy('affectedScheme', 5);
    const recentAlerts = store.fraudAlerts
      .filter(a => a.status === 'open')
      .sort((a, b) => b.fraudScore - a.fraudScore)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        totalAlerts,
        openAlerts,
        highRisk: levelCounts.high || 0,
        mediumRisk: levelCounts.medium || 0,
        lowRisk: levelCounts.low || 0,
        byScheme,
        recentAlerts,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/fraud/verify
 * Public verification endpoint for suspicious URLs or scam messages
 */
const verifySuspiciousInput = async (req, res, next) => {
  try {
    const { suspiciousLink, scamMessage, fraudType = 'other' } = req.body;

    if (!suspiciousLink && !scamMessage) {
      return res.status(400).json({
        success: false,
        error: 'Either a link or a message/advertisement text is required to verify.',
      });
    }

    let ruleScore = 0;
    const ruleReasons = [];

    // URL pattern analysis
    if (suspiciousLink) {
      const linkLower = suspiciousLink.toLowerCase().trim();
      const isGov = linkLower.includes('.gov.in') || linkLower.includes('.nic.in');
      const hasGovKeyword = linkLower.includes('yojana') || linkLower.includes('scheme') || linkLower.includes('kisan') || linkLower.includes('awas') || linkLower.includes('mudra') || linkLower.includes('ayushman') || linkLower.includes('pm-');

      if (!isGov && hasGovKeyword) {
        ruleScore += 65;
        ruleReasons.push('Spoofing check: Contains government welfare keywords but does not use the official gov.in or nic.in domains.');
      }

      const suspiciousTLDs = ['.ru', '.cc', '.xyz', '.click', '.top', '.free', '.gq', '.tk', '.cf', '.ml', '.info', '.ws', '.club'];
      const matchedTLD = suspiciousTLDs.find(tld => linkLower.endsWith(tld) || linkLower.includes(tld + '/'));
      if (matchedTLD) {
        ruleScore += 25;
        ruleReasons.push(`Uses a suspicious top-level domain (${matchedTLD}) frequently linked with phishing sites.`);
      }

      if (linkLower.startsWith('http://') && !linkLower.includes('localhost') && !linkLower.includes('127.0.0.1')) {
        ruleScore += 15;
        ruleReasons.push('Insecure protocol: Uses HTTP instead of HTTPS, leaving submissions unencrypted.');
      }
    }

    // Keyword analysis
    if (scamMessage) {
      const msgLower = scamMessage.toLowerCase();
      const scamKeywords = [
        'free money', 'lottery', 'click to win', 'deposit bank', 'double your', 'double income',
        'guaranteed subsidy', 'registration fee', 'share aadhaar otp', 'share otp', 'urgent claim',
        'click this link', 'won a prize', 'gift card', 'giveaway', 'लॉटरी', 'मुफ्त उपहार', 'पैसे जीतें'
      ];

      const matchedKeywords = scamKeywords.filter(kw => msgLower.includes(kw));
      if (matchedKeywords.length > 0) {
        ruleScore += 40;
        ruleReasons.push(`Scam vocabulary check: Matches known scam phrasing like: ${matchedKeywords.join(', ')}.`);
      }
    }

    // AI Analysis (Groq Llama 3)
    const prompt = `You are a cybersecurity expert specializing in detecting financial scams, fake government schemes, and phishing websites in India.
Analyze the following citizen query:
- Suspicious Link: ${suspiciousLink || 'None'}
- Text/Message/Ad: ${scamMessage || 'None'}

Determine:
1. Is this a scam, fake scheme, or phishing link?
2. What is the risk score (0 to 100)?
3. What is the specific reason and indicator?

Return ONLY a valid JSON object (no markdown, no code blocks, no explanation - raw JSON only) containing:
{
  "score": 85,
  "isScam": true,
  "reason": "Explain in 1-2 clear sentences why this is a scam/safe in the context of Indian citizen awareness."
}`;

    let aiScore = 0;
    let aiReason = '';

    try {
      const aiResponse = await callAI([{ role: 'user', content: prompt }], 'en');
      let aiResult = {};
      
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiResult = JSON.parse(jsonMatch[0]);
      } else {
        aiResult = JSON.parse(aiResponse);
      }

      aiScore = aiResult.score || 0;
      aiReason = aiResult.reason || '';
    } catch (err) {
      console.warn('AI scam analysis failed, relying on rule-based scoring:', err.message);
      aiScore = ruleScore;
      aiReason = ruleReasons.join(' ') || 'Verified using standard scam and link pattern matching.';
    }

    // Combine scores
    const finalScore = Math.min(Math.max(ruleScore, aiScore), 100);
    const finalReasons = [...new Set([...ruleReasons, aiReason])].filter(Boolean);
    const riskLevel = finalScore <= 30 ? 'low' : finalScore <= 60 ? 'medium' : 'high';

    // Save report
    const randId = Math.random().toString(36).substr(2, 9).toUpperCase();
    const reportData = {
      reportId: `REP-${randId}`,
      fraudType: suspiciousLink ? 'link' : 'message',
      suspiciousLink: suspiciousLink || '',
      scamMessage: scamMessage || '',
      confidenceScore: finalScore,
      description: finalReasons.join(' '),
      status: finalScore > 40 ? 'under_review' : 'open',
    };

    let savedReport = null;
    if (global.useMemoryStore) {
      savedReport = store.addFraudReport(reportData);
    } else {
      savedReport = await FraudReport.create(reportData);
    }

    // Trigger Notification for Admin if Risk is HIGH or MEDIUM
    if (finalScore >= 50) {
      const notificationData = {
        userId: null, // Admin alert
        title: `🚨 Fraud Report Flagged: ${riskLevel.toUpperCase()} RISK`,
        message: `A citizen reported a suspicious ${reportData.fraudType}: "${suspiciousLink || scamMessage.substr(0, 50)}...". Score: ${finalScore}%.`,
        type: 'fraud_alert',
      };
      if (global.useMemoryStore) {
        store.addNotification(notificationData);
      } else {
        const Notification = require('../models/Notification');
        await Notification.create(notificationData);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        reportId: savedReport.reportId,
        fraudType: savedReport.fraudType,
        suspiciousLink: savedReport.suspiciousLink,
        scamMessage: savedReport.scamMessage,
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

/**
 * GET /api/fraud/reports
 * Fetch all public reported fraud alerts
 */
const getFraudReports = async (req, res, next) => {
  try {
    let reports = [];
    if (global.useMemoryStore) {
      reports = store.getFraudReports();
    } else {
      reports = await FraudReport.find({}).sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitApplication,
  getFraudAlerts,
  updateAlertStatus,
  getFraudStats,
  verifySuspiciousInput,
  getFraudReports,
};

