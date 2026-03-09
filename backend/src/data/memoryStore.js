/**
 * In-Memory Store — replaces MongoDB completely.
 * Pre-seeded with 15 schemes, admin user, and demo applications/alerts.
 * Data is reset every time the server restarts.
 */

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const schemesData = require('./schemesData');

const genId = () => uuidv4().split('-')[0].toUpperCase();
const nowDate = (daysAgo = 0) =>
  new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

// ── Schemes (from static data) ──────────────────────────────────
const SCHEMES = schemesData.map((s, i) => ({
  _id: `scheme-${String(i + 1).padStart(3, '0')}`,
  ...s,
  isActive: true,
  createdAt: nowDate(90),
  updatedAt: nowDate(0),
}));

// ── Admin ───────────────────────────────────────────────────────
const ADMINS = [
  {
    _id: 'admin-001',
    username: 'admin',
    email: 'admin@govai.in',
    passwordHash: bcrypt.hashSync('admin@123', 10),
    role: 'super_admin',
    isActive: true,
    lastLogin: null,
    createdAt: nowDate(30),
  },
];

// ── Demo applications ───────────────────────────────────────────
const NAMES = [
  'Ramesh Kumar', 'Sunita Devi', 'Mohan Singh', 'Priya Sharma',
  'Arjun Patel', 'Kavitha Rao', 'Sanjay Mishra', 'Anita Verma',
  'Deepak Yadav', 'Meena Gupta', 'Raju Tiwari', 'Pooja Nair',
];
const OCCUPATIONS = ['farmer', 'student', 'self-employed', 'artisan', 'laborer', 'unemployed'];
const STATES = ['Maharashtra', 'Uttar Pradesh', 'Bihar', 'Rajasthan', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'West Bengal'];
const DISTRICTS = ['Pune', 'Nagpur', 'Lucknow', 'Patna', 'Jaipur', 'Ahmedabad', 'Bangalore', 'Chennai'];

function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function makeApp(overrides = {}, daysAgo = 0) {
  const id = genId();
  const date = nowDate(daysAgo);
  const scheme = rnd(SCHEMES);
  const base = {
    _id: `app-${id}`,
    applicationId: `APP-${id}`,
    schemeId: scheme._id,
    schemeName: scheme.name,
    applicant: {
      name: rnd(NAMES),
      age: 20 + Math.floor(Math.random() * 35),
      gender: Math.random() > 0.5 ? 'male' : 'female',
      occupation: rnd(OCCUPATIONS),
      income: 60000 + Math.floor(Math.random() * 200000),
      state: rnd(STATES),
      district: rnd(DISTRICTS),
      aadhaarHash: `HASH_AADHAAR_${id}`,
      bankAccountHash: `HASH_BANK_${id}`,
    },
    metadata: {
      ipAddress: `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.1`,
      userAgent: 'Mozilla/5.0',
      submittedAt: date,
    },
    fraudFlags: [],
    fraudScore: 0,
    fraudLevel: 'low',
    isFlagged: false,
    status: 'pending',
    createdAt: date,
    updatedAt: date,
  };
  // Deep merge applicant overrides
  if (overrides.applicant) {
    base.applicant = { ...base.applicant, ...overrides.applicant };
    delete overrides.applicant;
  }
  if (overrides.metadata) {
    base.metadata = { ...base.metadata, ...overrides.metadata };
    delete overrides.metadata;
  }
  return { ...base, ...overrides };
}

// 20 clean apps spread across last 14 days
const cleanApps = Array.from({ length: 20 }, (_, i) =>
  makeApp({ status: i % 3 === 0 ? 'approved' : i % 5 === 0 ? 'rejected' : 'pending' }, Math.floor(Math.random() * 14))
);

// Fraud patterns
const dupAadhaarHash = 'HASH_FRAUD_AADHAAR_DEMO';
const sharedBankHash = 'HASH_FRAUD_BANK_DEMO';

const fraudApps = [
  // Duplicate Aadhaar (same scheme)
  makeApp({ applicant: { aadhaarHash: dupAadhaarHash }, fraudScore: 40, fraudLevel: 'medium', isFlagged: true, status: 'under_review', fraudFlags: [{ rule: 'DUPLICATE_AADHAAR', score: 40, description: 'Aadhaar already used for 1 application(s) in this scheme.' }] }, 2),
  makeApp({ applicant: { aadhaarHash: dupAadhaarHash }, fraudScore: 40, fraudLevel: 'medium', isFlagged: true, status: 'under_review', fraudFlags: [{ rule: 'DUPLICATE_AADHAAR', score: 40, description: 'Aadhaar already used for 2 application(s) in this scheme.' }] }, 2),

  // Shared bank account
  makeApp({ applicant: { bankAccountHash: sharedBankHash }, fraudScore: 60, fraudLevel: 'medium', isFlagged: true, status: 'under_review', fraudFlags: [{ rule: 'SHARED_BANK_ACCOUNT', score: 30, description: 'Bank account linked to 3 applications.' }, { rule: 'DUPLICATE_AADHAAR', score: 30, description: 'Aadhaar reuse detected.' }] }, 3),
  makeApp({ applicant: { bankAccountHash: sharedBankHash }, fraudScore: 30, fraudLevel: 'low', isFlagged: false, status: 'pending', fraudFlags: [] }, 3),

  // Bulk IP submissions — high risk
  ...Array.from({ length: 5 }, (_, i) =>
    makeApp({
      metadata: { ipAddress: '203.0.113.42', userAgent: 'bot/2.0', submittedAt: nowDate(1) },
      fraudScore: 65,
      fraudLevel: 'high',
      isFlagged: true,
      status: 'under_review',
      fraudFlags: [
        { rule: 'MULTIPLE_IP_APPLICATIONS', score: 25, description: `${5 + i} applications from IP 203.0.113.42. Possible bulk submission.` },
        { rule: 'AGE_INCONSISTENCY', score: 40, description: 'Applicant age is below minimum required for this scheme.' },
      ],
    }, 1)
  ),

  // Age inconsistency
  makeApp({
    applicant: { name: 'Minor Applicant', age: 8, gender: 'male', occupation: 'student', income: 0, state: 'Bihar', district: 'Patna', aadhaarHash: 'HASH_MINOR_001', bankAccountHash: 'HASH_MINOR_BANK_001' },
    fraudScore: 35,
    fraudLevel: 'medium',
    isFlagged: true,
    status: 'under_review',
    fraudFlags: [{ rule: 'AGE_INCONSISTENCY', score: 35, description: 'Applicant age (8) is below minimum required age (18) for the scheme.' }],
  }, 5),
];

const APPLICATIONS = [...cleanApps, ...fraudApps];

// ── Demo Fraud Alerts ───────────────────────────────────────────
const FRAUD_ALERTS = [
  {
    _id: 'alert-001',
    alertId: 'ALERT-DEMO01',
    applicationId: fraudApps[0].applicationId,
    applicantName: fraudApps[0].applicant.name,
    schemeName: fraudApps[0].schemeName,
    state: fraudApps[0].applicant.state,
    district: fraudApps[0].applicant.district,
    fraudScore: 40,
    fraudLevel: 'medium',
    reasons: ['Aadhaar already used for 1 application(s) in this scheme.'],
    rulesTriggered: ['DUPLICATE_AADHAAR'],
    affectedScheme: fraudApps[0].schemeName,
    status: 'open',
    createdAt: fraudApps[0].createdAt,
    updatedAt: fraudApps[0].createdAt,
  },
  {
    _id: 'alert-002',
    alertId: 'ALERT-DEMO02',
    applicationId: fraudApps[2].applicationId,
    applicantName: fraudApps[2].applicant.name,
    schemeName: fraudApps[2].schemeName,
    state: fraudApps[2].applicant.state,
    district: fraudApps[2].applicant.district,
    fraudScore: 60,
    fraudLevel: 'medium',
    reasons: ['Bank account linked to 3 applications.', 'Aadhaar reuse detected.'],
    rulesTriggered: ['SHARED_BANK_ACCOUNT', 'DUPLICATE_AADHAAR'],
    affectedScheme: fraudApps[2].schemeName,
    status: 'open',
    createdAt: fraudApps[2].createdAt,
    updatedAt: fraudApps[2].createdAt,
  },
  ...fraudApps.slice(4, 9).map((app, i) => ({
    _id: `alert-${String(i + 3).padStart(3, '0')}`,
    alertId: `ALERT-IP${String(i + 1).padStart(3, '0')}`,
    applicationId: app.applicationId,
    applicantName: app.applicant.name,
    schemeName: app.schemeName,
    state: app.applicant.state,
    district: app.applicant.district,
    fraudScore: 65,
    fraudLevel: 'high',
    reasons: [`Multiple applications from IP 203.0.113.42.`, 'Applicant age below scheme minimum.'],
    rulesTriggered: ['MULTIPLE_IP_APPLICATIONS', 'AGE_INCONSISTENCY'],
    affectedScheme: app.schemeName,
    status: i < 2 ? 'investigating' : 'open',
    createdAt: app.createdAt,
    updatedAt: app.createdAt,
  })),
  {
    _id: 'alert-008',
    alertId: 'ALERT-AGE001',
    applicationId: fraudApps[fraudApps.length - 1].applicationId,
    applicantName: 'Minor Applicant',
    schemeName: fraudApps[fraudApps.length - 1].schemeName,
    state: 'Bihar',
    district: 'Patna',
    fraudScore: 35,
    fraudLevel: 'medium',
    reasons: ['Applicant age (8) is below minimum required age (18) for the scheme.'],
    rulesTriggered: ['AGE_INCONSISTENCY'],
    affectedScheme: fraudApps[fraudApps.length - 1].schemeName,
    status: 'open',
    createdAt: fraudApps[fraudApps.length - 1].createdAt,
    updatedAt: fraudApps[fraudApps.length - 1].createdAt,
  },
];

// ── Store Singleton ─────────────────────────────────────────────
const store = {
  schemes: [...SCHEMES],
  applications: [...APPLICATIONS],
  fraudAlerts: [...FRAUD_ALERTS],
  admins: [...ADMINS],

  // ── Scheme helpers ────────────────────────────────────────────
  getSchemes(filter = {}) {
    let list = this.schemes;
    if (filter.isActive !== undefined) list = list.filter(s => s.isActive === filter.isActive);
    if (filter.category) list = list.filter(s => s.category === filter.category);
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.shortName.toLowerCase().includes(q) ||
        (s.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  },

  getSchemeById(id) {
    return this.schemes.find(s => s._id === id) || null;
  },

  // ── Application helpers ───────────────────────────────────────
  getApplications(filter = {}, opts = {}) {
    const { skip = 0, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = opts;
    let list = this.applications;
    if (filter.status) list = list.filter(a => a.status === filter.status);
    if (filter.isFlagged !== undefined) list = list.filter(a => a.isFlagged === filter.isFlagged);
    if (filter.schemeName) {
      const q = filter.schemeName.toLowerCase();
      list = list.filter(a => a.schemeName.toLowerCase().includes(q));
    }
    list = [...list].sort((a, b) => {
      const av = a[sortBy] instanceof Date ? a[sortBy].getTime() : (a[sortBy] || 0);
      const bv = b[sortBy] instanceof Date ? b[sortBy].getTime() : (b[sortBy] || 0);
      return sortOrder === 'asc' ? av - bv : bv - av;
    });
    return { data: list.slice(skip, skip + limit), total: list.length };
  },

  countApplications(filter = {}) {
    let list = this.applications;
    if (filter.status) list = list.filter(a => a.status === filter.status);
    if (filter.isFlagged !== undefined) list = list.filter(a => a.isFlagged === filter.isFlagged);
    return list.length;
  },

  addApplication(app) {
    this.applications.push(app);
    return app;
  },

  updateApplication(applicationId, updates) {
    const idx = this.applications.findIndex(a => a.applicationId === applicationId);
    if (idx === -1) return null;
    this.applications[idx] = { ...this.applications[idx], ...updates, updatedAt: new Date() };
    return this.applications[idx];
  },

  // Returns [{ name, count }] sorted desc
  groupApplicationsBy(field, limit = 8) {
    const counts = {};
    this.applications.forEach(a => {
      const val = a[field] || 'Unknown';
      counts[val] = (counts[val] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  },

  getDailyApplications(days = 14) {
    const result = {};
    const now = Date.now();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      result[d.toISOString().slice(0, 10)] = { total: 0, flagged: 0 };
    }
    this.applications.forEach(a => {
      const day = (a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt)).toISOString().slice(0, 10);
      if (result[day] !== undefined) {
        result[day].total++;
        if (a.isFlagged) result[day].flagged++;
      }
    });
    return Object.entries(result).map(([date, v]) => ({
      date,
      applications: v.total,
      fraudulent: v.flagged,
    }));
  },

  // ── Fraud alert helpers ───────────────────────────────────────
  getAlerts(filter = {}, opts = {}) {
    const { skip = 0, limit = 50, sortBy = 'fraudScore', sortOrder = 'desc' } = opts;
    let list = this.fraudAlerts;
    if (filter.status) list = list.filter(a => a.status === filter.status);
    if (filter.fraudLevel) list = list.filter(a => a.fraudLevel === filter.fraudLevel);
    list = [...list].sort((a, b) => {
      const av = a[sortBy] instanceof Date ? a[sortBy].getTime() : (a[sortBy] || 0);
      const bv = b[sortBy] instanceof Date ? b[sortBy].getTime() : (b[sortBy] || 0);
      return sortOrder === 'asc' ? av - bv : bv - av;
    });
    return { data: list.slice(skip, skip + limit), total: list.length };
  },

  countAlerts(filter = {}) {
    let list = this.fraudAlerts;
    if (filter.status) list = list.filter(a => a.status === filter.status);
    if (filter.fraudLevel) list = list.filter(a => a.fraudLevel === filter.fraudLevel);
    return list.length;
  },

  getAlertById(id) {
    return this.fraudAlerts.find(a => a._id === id) || null;
  },

  addAlert(alert) {
    this.fraudAlerts.push(alert);
    return alert;
  },

  updateAlert(id, updates) {
    const idx = this.fraudAlerts.findIndex(a => a._id === id);
    if (idx === -1) return null;
    this.fraudAlerts[idx] = { ...this.fraudAlerts[idx], ...updates, updatedAt: new Date() };
    return this.fraudAlerts[idx];
  },

  groupAlertsBy(field, limit = 5) {
    const counts = {};
    this.fraudAlerts.forEach(a => {
      const val = a[field] || 'Unknown';
      counts[val] = (counts[val] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  },

  // ── Admin helpers ─────────────────────────────────────────────
  getAdminByUsername(username) {
    return this.admins.find(a => a.username === username || a.email === username) || null;
  },

  getAdminById(id) {
    return this.admins.find(a => a._id === id) || null;
  },

  updateAdmin(id, updates) {
    const idx = this.admins.findIndex(a => a._id === id);
    if (idx === -1) return null;
    this.admins[idx] = { ...this.admins[idx], ...updates };
    return this.admins[idx];
  },
};

module.exports = store;
