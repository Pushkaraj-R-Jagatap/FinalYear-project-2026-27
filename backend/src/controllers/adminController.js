const store = require('../data/memoryStore');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');

/**
 * POST /api/admin/login
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required.',
      });
    }

    let admin = null;
    if (global.useMemoryStore) {
      admin = store.getAdminByUsername(username);
      if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials.',
        });
      }
    } else {
      const Admin = require('../models/Admin');
      admin = await Admin.findOne({
        $or: [{ username }, { email: username.toLowerCase() }],
      });
      if (!admin || !(await admin.comparePassword(password))) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials.',
        });
      }
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Account is deactivated.',
      });
    }

    // Update lastLogin
    if (global.useMemoryStore) {
      store.updateAdmin(admin._id, { lastLogin: new Date() });
    } else {
      admin.lastLogin = new Date();
      await admin.save();
    }

    const token = generateToken(admin._id);

    res.status(200).json({
      success: true,
      data: {
        token,
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          lastLogin: new Date(),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/stats
 */
const getDashboardStats = async (req, res, next) => {
  try {
    let applications = [];
    let fraudAlerts = [];
    let schemesCount = 0;

    if (global.useMemoryStore) {
      applications = store.applications;
      fraudAlerts = store.fraudAlerts;
      schemesCount = store.schemes.filter(s => s.isActive).length;
    } else {
      const Application = require('../models/Application');
      const FraudAlert = require('../models/FraudAlert');
      const Scheme = require('../models/Scheme');

      applications = await Application.find({});
      fraudAlerts = await FraudAlert.find({});
      schemesCount = await Scheme.countDocuments({ isActive: true });
    }

    const totalApplications = applications.length;
    const pendingApplications = applications.filter(a => a.status === 'pending').length;
    const approvedApplications = applications.filter(a => a.status === 'approved').length;
    const rejectedApplications = applications.filter(a => a.status === 'rejected').length;
    const underReviewApplications = applications.filter(a => a.status === 'under_review').length;

    const totalFraudAlerts = fraudAlerts.length;
    const openFraudAlerts = fraudAlerts.filter(a => a.status === 'open').length;
    const highRiskAlerts = fraudAlerts.filter(a => a.fraudLevel === 'high' && a.status === 'open').length;

    // Aggregations in JS for environment consistency
    // Group applications by schemeName
    const schemeCounts = {};
    applications.forEach(a => {
      schemeCounts[a.schemeName] = (schemeCounts[a.schemeName] || 0) + 1;
    });
    const applicationsByScheme = Object.entries(schemeCounts)
      .map(([name, count]) => ({ name, applications: count }))
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 8);

    // Group applications by status
    const statusCounts = {};
    applications.forEach(a => {
      statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
    });
    const applicationsByStatus = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    // Fraud risk levels
    const fraudLevelCounts = {};
    fraudAlerts.forEach(a => {
      fraudLevelCounts[a.fraudLevel] = (fraudLevelCounts[a.fraudLevel] || 0) + 1;
    });
    const fraudByLevel = Object.entries(fraudLevelCounts).map(([level, count]) => ({ level, count }));

    // Daily Applications trend (last 14 days)
    const dailyTrendMap = {};
    const now = Date.now();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      dailyTrendMap[d.toISOString().slice(0, 10)] = { total: 0, flagged: 0 };
    }
    applications.forEach(a => {
      const day = new Date(a.createdAt).toISOString().slice(0, 10);
      if (dailyTrendMap[day] !== undefined) {
        dailyTrendMap[day].total++;
        if (a.isFlagged) dailyTrendMap[day].flagged++;
      }
    });
    const dailyApplications = Object.entries(dailyTrendMap).map(([date, v]) => ({
      date,
      applications: v.total,
      fraudulent: v.flagged,
    }));

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalApplications,
          pendingApplications,
          approvedApplications,
          rejectedApplications,
          underReviewApplications,
          totalFraudAlerts,
          openFraudAlerts,
          highRiskAlerts,
          totalSchemes: schemesCount,
        },
        charts: {
          applicationsByScheme,
          applicationsByStatus,
          dailyApplications,
          fraudByLevel,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/applications
 */
const getApplications = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 20, status, isFlagged,
      scheme, sortBy = 'createdAt', sortOrder = 'desc',
    } = req.query;

    let applications = [];
    let total = 0;

    if (global.useMemoryStore) {
      const filter = {};
      if (status) filter.status = status;
      if (isFlagged !== undefined) filter.isFlagged = isFlagged === 'true';
      if (scheme) filter.schemeName = scheme;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const resData = store.getApplications(filter, {
        skip, limit: parseInt(limit), sortBy, sortOrder,
      });
      applications = resData.data;
      total = resData.total;
    } else {
      const Application = require('../models/Application');
      const filter = {};
      if (status) filter.status = status;
      if (isFlagged !== undefined) filter.isFlagged = isFlagged === 'true';
      if (scheme) filter.schemeName = scheme;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      total = await Application.countDocuments(filter);
      applications = await Application.find(filter)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(parseInt(limit));
    }

    // Strip sensitive hashes
    const safe = applications.map(a => {
      const obj = typeof a.toObject === 'function' ? a.toObject() : a;
      return {
        ...obj,
        applicant: { ...obj.applicant, aadhaarHash: undefined, bankAccountHash: undefined },
      };
    });

    res.status(200).json({
      success: true,
      data: safe,
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
 * GET /api/admin/me
 */
const getMe = async (req, res) => {
  res.status(200).json({ success: true, data: req.admin });
};

module.exports = { login, getDashboardStats, getApplications, getMe };

