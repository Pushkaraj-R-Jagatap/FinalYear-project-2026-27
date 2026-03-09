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

    const admin = store.getAdminByUsername(username);

    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials.',
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Account is deactivated.',
      });
    }

    store.updateAdmin(admin._id, { lastLogin: new Date() });
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
    const totalApplications = store.applications.length;
    const pendingApplications = store.countApplications({ status: 'pending' });
    const approvedApplications = store.countApplications({ status: 'approved' });
    const rejectedApplications = store.countApplications({ status: 'rejected' });
    const underReviewApplications = store.countApplications({ status: 'under_review' });
    const totalFraudAlerts = store.countAlerts();
    const openFraudAlerts = store.countAlerts({ status: 'open' });
    const highRiskAlerts = store.countAlerts({ fraudLevel: 'high', status: 'open' });
    const totalSchemes = store.schemes.filter(s => s.isActive).length;

    // Charts
    const appByScheme = store.groupApplicationsBy('schemeName', 8);
    const statusCounts = {};
    store.applications.forEach(a => {
      statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
    });
    const appByStatus = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    const dailyApps = store.getDailyApplications(14);

    const fraudLevelCounts = {};
    store.fraudAlerts.forEach(a => {
      fraudLevelCounts[a.fraudLevel] = (fraudLevelCounts[a.fraudLevel] || 0) + 1;
    });
    const fraudByLevel = Object.entries(fraudLevelCounts).map(([level, count]) => ({ level, count }));

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
          totalSchemes,
        },
        charts: {
          applicationsByScheme: appByScheme.map(i => ({ name: i.name, applications: i.count })),
          applicationsByStatus: appByStatus,
          dailyApplications: dailyApps,
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

    const filter = {};
    if (status) filter.status = status;
    if (isFlagged !== undefined) filter.isFlagged = isFlagged === 'true';
    if (scheme) filter.schemeName = scheme;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const { data: applications, total } = store.getApplications(filter, {
      skip, limit: parseInt(limit), sortBy, sortOrder,
    });

    // Strip sensitive hashes
    const safe = applications.map(a => ({
      ...a,
      applicant: { ...a.applicant, aadhaarHash: undefined, bankAccountHash: undefined },
    }));

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
