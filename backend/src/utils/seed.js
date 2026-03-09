/**
 * Database Seeder
 * Populates MongoDB with:
 *  - 15 Government Schemes
 *  - 1 Admin account (admin / admin@123)
 *  - 60 Sample Applications (with realistic fraud patterns)
 *  - Auto-generated Fraud Alerts
 *
 * Run: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const connectDB = require('../config/db');
const Scheme = require('../models/Scheme');
const Application = require('../models/Application');
const FraudAlert = require('../models/FraudAlert');
const Admin = require('../models/Admin');
const schemesData = require('../data/schemesData');
const { detectFraud, createFraudAlert } = require('../services/fraudDetectionService');

// ── Sample Indian Data ───────────────────────────────────────────────
const indianNames = [
  'Ramesh Kumar', 'Sunita Devi', 'Mohan Lal', 'Priya Sharma', 'Vijay Singh',
  'Anita Patel', 'Suresh Verma', 'Meena Kumari', 'Rajendra Prasad', 'Geeta Rani',
  'Arun Tiwari', 'Savita Yadav', 'Dinesh Gupta', 'Rekha Mishra', 'Ajay Joshi',
  'Kavita Nair', 'Santosh Pandey', 'Usha Sinha', 'Mahesh Dubey', 'Pooja Agarwal',
  'Sanjay Chaudhary', 'Lakshmi Reddy', 'Naresh Sharma', 'Parvati Devi', 'Om Prakash',
  'Shanta Bai', 'Kishore Kumar', 'Asha Kumari', 'Vikas Tiwari', 'Nirmala Singh',
];

const states = [
  'Maharashtra', 'Uttar Pradesh', 'Rajasthan', 'Bihar', 'Madhya Pradesh',
  'Gujarat', 'West Bengal', 'Andhra Pradesh', 'Tamil Nadu', 'Karnataka',
  'Punjab', 'Haryana', 'Odisha', 'Jharkhand', 'Chhattisgarh',
];

const districts = {
  'Maharashtra': ['Pune', 'Nashik', 'Aurangabad', 'Nagpur', 'Solapur'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Meerut'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner'],
  'Bihar': ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'],
  'West Bengal': ['Kolkata', 'Howrah', 'Asansol', 'Durgapur', 'Siliguri'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Nellore'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda'],
  'Haryana': ['Faridabad', 'Gurugram', 'Hisar', 'Rohtak', 'Panipat'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Rajnandgaon'],
};

const occupations = ['farmer', 'daily-wage-worker', 'small-business-owner', 'student', 'artisan'];

const getRandomDistrict = (state) => {
  const d = districts[state] || ['Unknown'];
  return d[Math.floor(Math.random() * d.length)];
};

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ── Seed Functions ─────────────────────────────────────────────────

async function seedSchemes() {
  await Scheme.deleteMany({});
  const schemes = await Scheme.insertMany(schemesData);
  console.log(`✅ Inserted ${schemes.length} government schemes`);
  return schemes;
}

async function seedAdmin() {
  await Admin.deleteMany({});
  const admin = await Admin.create({
    username: 'admin',
    email: 'admin@govai.in',
    password: 'admin@123',
    role: 'super_admin',
  });
  console.log(`✅ Admin created — username: admin | password: admin@123`);
  return admin;
}

async function seedApplications(schemes) {
  await Application.deleteMany({});
  await FraudAlert.deleteMany({});

  const applications = [];

  // ── 30 Normal applications ─────────────────────────
  for (let i = 0; i < 30; i++) {
    const state = getRandom(states);
    const scheme = getRandom(schemes);
    const name = getRandom(indianNames);
    const age = 22 + (i % 40);
    const income = 40000 + (i * 8000);

    applications.push({
      applicationId: `APP-${String(i + 1).padStart(5, '0')}`,
      schemeId: scheme._id,
      schemeName: scheme.name,
      applicant: {
        name,
        age,
        gender: i % 2 === 0 ? 'male' : 'female',
        occupation: getRandom(occupations),
        income,
        state,
        district: getRandomDistrict(state),
        aadhaarHash: `HASH_AADHAAR_${String(i + 1000).padStart(6, '0')}`,
        bankAccountHash: `HASH_BANK_${String(i + 2000).padStart(6, '0')}`,
        phone: `98${String(7000000000 + i)}`,
      },
      metadata: {
        ipAddress: `192.168.${10 + (i % 200)}.${1 + (i % 250)}`,
        submittedAt: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000),
      },
      status: ['pending', 'approved', 'pending', 'approved', 'approved'][i % 5],
      fraudFlags: [],
      fraudScore: 0,
      fraudLevel: 'low',
      isFlagged: false,
    });
  }

  // ── Fraud Pattern 1: Duplicate Aadhaar (same Aadhaar, same scheme) ─────
  const schemeForFraud = schemes[0]; // PM-KISAN
  for (let i = 0; i < 4; i++) {
    const state = 'Uttar Pradesh';
    applications.push({
      applicationId: `APP-FRAUD-AA-${i + 1}`,
      schemeId: schemeForFraud._id,
      schemeName: schemeForFraud.name,
      applicant: {
        name: `Fraud Aadhaar User ${i + 1}`,
        age: 35,
        gender: 'male',
        occupation: 'farmer',
        income: 80000,
        state,
        district: 'Lucknow',
        aadhaarHash: 'FRAUD_AADHAAR_DUPLICATE_001', // Same Aadhaar
        bankAccountHash: `HASH_BANK_FRAUD_${i}`,
        phone: `96${String(1000000 + i)}`,
      },
      metadata: {
        ipAddress: `10.0.1.${50 + i}`,
        submittedAt: new Date(Date.now() - i * 3 * 60 * 60 * 1000),
      },
      status: 'pending',
      fraudFlags: [],
      fraudScore: 0,
      fraudLevel: 'low',
      isFlagged: false,
    });
  }

  // ── Fraud Pattern 2: Shared Bank Account ───────────────────────────────
  for (let i = 0; i < 5; i++) {
    const state = getRandom(states);
    const scheme = getRandom(schemes);
    applications.push({
      applicationId: `APP-FRAUD-BA-${i + 1}`,
      schemeId: scheme._id,
      schemeName: scheme.name,
      applicant: {
        name: `Shared Bank User ${i + 1}`,
        age: 28 + i,
        gender: i % 2 === 0 ? 'male' : 'female',
        occupation: getRandom(occupations),
        income: 60000 + i * 5000,
        state,
        district: getRandomDistrict(state),
        aadhaarHash: `HASH_AADHAAR_BANK_FRAUD_${i}`,
        bankAccountHash: 'FRAUD_SHARED_BANK_ACCOUNT_001', // Same bank account
        phone: `95${String(2000000 + i)}`,
      },
      metadata: {
        ipAddress: `10.0.2.${100 + i}`,
        submittedAt: new Date(Date.now() - (5 - i) * 24 * 60 * 60 * 1000),
      },
      status: 'pending',
      fraudFlags: [],
      fraudScore: 0,
      fraudLevel: 'low',
      isFlagged: false,
    });
  }

  // ── Fraud Pattern 3: IP Flood (6+ applications from same IP) ──────────
  for (let i = 0; i < 8; i++) {
    const scheme = getRandom(schemes);
    applications.push({
      applicationId: `APP-FRAUD-IP-${i + 1}`,
      schemeId: scheme._id,
      schemeName: scheme.name,
      applicant: {
        name: `IP Flood User ${i + 1}`,
        age: 25 + i,
        gender: 'male',
        occupation: getRandom(occupations),
        income: 50000,
        state: 'Maharashtra',
        district: 'Pune',
        aadhaarHash: `HASH_AADHAAR_IP_FLOOD_${i}`,
        bankAccountHash: `HASH_BANK_IP_FLOOD_${i}`,
        phone: `94${String(3000000 + i)}`,
      },
      metadata: {
        ipAddress: '203.0.113.42', // Same IP for all 8
        submittedAt: new Date(Date.now() - i * 30 * 60 * 1000),
      },
      status: 'pending',
      fraudFlags: [],
      fraudScore: 0,
      fraudLevel: 'low',
      isFlagged: false,
    });
  }

  // ── Fraud Pattern 4: District Anomaly (Nagpur) ────────────────────────
  for (let i = 0; i < 15; i++) {
    const scheme = getRandom(schemes);
    applications.push({
      applicationId: `APP-FRAUD-DT-${i + 1}`,
      schemeId: scheme._id,
      schemeName: scheme.name,
      applicant: {
        name: `${getRandom(indianNames)} (${i})`,
        age: 30 + (i % 15),
        gender: i % 2 === 0 ? 'male' : 'female',
        occupation: getRandom(occupations),
        income: 55000 + i * 2000,
        state: 'Maharashtra',
        district: 'Nagpur', // All from Nagpur — will trigger district anomaly
        aadhaarHash: `HASH_AADHAAR_DIST_FRAUD_${i}`,
        bankAccountHash: `HASH_BANK_DIST_FRAUD_${i}`,
        phone: `93${String(4000000 + i)}`,
      },
      metadata: {
        ipAddress: `172.16.${i % 50}.${1 + i}`,
        submittedAt: new Date(Date.now() - i * 2 * 60 * 60 * 1000),
      },
      status: 'pending',
      fraudFlags: [],
      fraudScore: 0,
      fraudLevel: 'low',
      isFlagged: false,
    });
  }

  // ── Fraud Pattern 5: Age inconsistency ────────────────────────────────
  // Apply for PM-KISAN (minAge: 18) but with age < 18
  const pmkisan = schemes.find(s => s.shortName === 'PM-KISAN') || schemes[0];
  applications.push({
    applicationId: 'APP-FRAUD-AGE-001',
    schemeId: pmkisan._id,
    schemeName: pmkisan.name,
    applicant: {
      name: 'Minor Age Fraud',
      age: 12, // Below minimum age for PM-KISAN
      gender: 'male',
      occupation: 'farmer',
      income: 90000,
      state: 'Bihar',
      district: 'Patna',
      aadhaarHash: 'HASH_AADHAAR_AGE_FRAUD_001',
      bankAccountHash: 'HASH_BANK_AGE_FRAUD_001',
      phone: '9800000001',
    },
    metadata: {
      ipAddress: '10.10.10.10',
      submittedAt: new Date(),
    },
    status: 'pending',
    fraudFlags: [],
    fraudScore: 0,
    fraudLevel: 'low',
    isFlagged: false,
  });

  // Insert all applications first (so fraud detection queries work correctly)
  const inserted = await Application.insertMany(applications);
  console.log(`✅ Inserted ${inserted.length} sample applications`);

  // ── Run fraud detection on flagged applications ────────────────────────
  // Re-query and run detection on suspicious ones
  const suspiciousApps = await Application.find({
    $or: [
      { 'applicant.aadhaarHash': 'FRAUD_AADHAAR_DUPLICATE_001' },
      { 'applicant.bankAccountHash': 'FRAUD_SHARED_BANK_ACCOUNT_001' },
      { 'metadata.ipAddress': '203.0.113.42' },
      { applicationId: 'APP-FRAUD-AGE-001' },
    ],
  });

  let alertCount = 0;
  for (const app of suspiciousApps) {
    const fraudResult = await detectFraud({
      applicant: app.applicant,
      schemeId: app.schemeId,
      metadata: app.metadata,
    });

    if (fraudResult.isFlagged) {
      await Application.findByIdAndUpdate(app._id, {
        fraudFlags: fraudResult.fraudFlags,
        fraudScore: fraudResult.fraudScore,
        fraudLevel: fraudResult.fraudLevel,
        isFlagged: true,
        status: 'under_review',
      });

      await createFraudAlert(
        { ...app.toObject(), ...fraudResult },
        fraudResult
      );
      alertCount++;
    }
  }

  // Also manually create a few compelling demo alerts for the dashboard
  const demoAlerts = [
    {
      alertId: 'ALERT-DEMO-001',
      applicationId: 'APP-FRAUD-AA-1',
      applicantName: 'Fraud Aadhaar User 1',
      schemeName: 'Pradhan Mantri Kisan Samman Nidhi',
      state: 'Uttar Pradesh',
      district: 'Lucknow',
      fraudScore: 85,
      fraudLevel: 'high',
      reasons: ['Aadhaar number used in 3 previous applications for PM-KISAN', 'Bank account linked to 2 other beneficiaries'],
      rulesTriggered: ['DUPLICATE_AADHAAR', 'SHARED_BANK_ACCOUNT'],
      affectedScheme: 'Pradhan Mantri Kisan Samman Nidhi',
      status: 'open',
    },
    {
      alertId: 'ALERT-DEMO-002',
      applicationId: 'APP-FRAUD-IP-1',
      applicantName: 'IP Flood User 1',
      schemeName: 'Ayushman Bharat PMJAY',
      state: 'Maharashtra',
      district: 'Pune',
      fraudScore: 65,
      fraudLevel: 'high',
      reasons: ['8 applications submitted from IP 203.0.113.42 in under 4 hours'],
      rulesTriggered: ['MULTIPLE_IP_APPLICATIONS'],
      affectedScheme: 'Ayushman Bharat',
      status: 'investigating',
    },
    {
      alertId: 'ALERT-DEMO-003',
      applicationId: 'APP-FRAUD-DT-1',
      applicantName: 'District Fraud User',
      schemeName: 'PM Awas Yojana',
      state: 'Maharashtra',
      district: 'Nagpur',
      fraudScore: 48,
      fraudLevel: 'medium',
      reasons: ['15 applications from Nagpur district — 5x above normal average'],
      rulesTriggered: ['DISTRICT_ANOMALY'],
      affectedScheme: 'Pradhan Mantri Awas Yojana',
      status: 'open',
    },
    {
      alertId: 'ALERT-DEMO-004',
      applicationId: 'APP-FRAUD-AGE-001',
      applicantName: 'Minor Age Fraud',
      schemeName: 'Pradhan Mantri Kisan Samman Nidhi',
      state: 'Bihar',
      district: 'Patna',
      fraudScore: 72,
      fraudLevel: 'high',
      reasons: ['Applicant age (12) is below minimum required age (18) for PM-KISAN'],
      rulesTriggered: ['AGE_INCONSISTENCY'],
      affectedScheme: 'Pradhan Mantri Kisan Samman Nidhi',
      status: 'open',
    },
    {
      alertId: 'ALERT-DEMO-005',
      applicationId: 'APP-FRAUD-BA-1',
      applicantName: 'Shared Bank User 1',
      schemeName: 'MUDRA Loan',
      state: 'Karnataka',
      district: 'Bengaluru',
      fraudScore: 55,
      fraudLevel: 'medium',
      reasons: ['Single bank account used by 5 different beneficiaries'],
      rulesTriggered: ['SHARED_BANK_ACCOUNT'],
      affectedScheme: 'Pradhan Mantri MUDRA Yojana',
      status: 'resolved',
      resolvedBy: 'admin',
      resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      notes: 'Verified — all applicants are family members. Case closed.',
    },
  ];

  await FraudAlert.insertMany(demoAlerts, { ordered: false }).catch(() => {});
  console.log(`✅ Generated fraud alerts (auto: ${alertCount}, demo: ${demoAlerts.length})`);
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌱 Starting database seed...\n');
  await connectDB();

  try {
    const schemes = await seedSchemes();
    await seedAdmin();
    await seedApplications(schemes);

    console.log('\n✅ Database seeded successfully!');
    console.log('────────────────────────────────────');
    console.log('👤 Admin Login: admin / admin@123');
    console.log('🌐 Frontend:    http://localhost:5173');
    console.log('🔗 Backend:     http://localhost:5000');
    console.log('────────────────────────────────────\n');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
