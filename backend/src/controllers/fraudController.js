const store = require('../data/memoryStore');
const {
  detectFraud,
  createFraudAlert,
} = require('../services/fraudDetectionService');
const { v4: uuidv4 } = require('uuid');

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

module.exports = {
  submitApplication,
  getFraudAlerts,
  updateAlertStatus,
  getFraudStats,
};
