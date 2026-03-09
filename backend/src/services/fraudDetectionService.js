const store = require('../data/memoryStore');
const { FRAUD_RULES } = require('../config/constants');
const { v4: uuidv4 } = require('uuid');

/**
 * Main fraud detection engine
 * Runs all rules against an incoming application
 * Returns fraud flags, score, level, and whether to flag
 */
const detectFraud = (applicationData) => {
  const { applicant, schemeId, metadata } = applicationData;
  const fraudFlags = [];
  let fraudScore = 0;

  // ─────────────────────────────────────────────
  // RULE 1: Duplicate Aadhaar in same scheme
  // ─────────────────────────────────────────────
  if (applicant.aadhaarHash) {
    const aadhaarCount = store.applications.filter(
      a => a.applicant.aadhaarHash === applicant.aadhaarHash && a.schemeId === schemeId
    ).length;

    if (aadhaarCount > 0) {
      const ruleScore = FRAUD_RULES.DUPLICATE_AADHAAR.score;
      fraudScore += ruleScore;
      fraudFlags.push({
        rule: 'DUPLICATE_AADHAAR',
        score: ruleScore,
        description: `Aadhaar already used for ${aadhaarCount} application(s) in this scheme. Possible duplicate application.`,
      });
    }
  }

  // ─────────────────────────────────────────────
  // RULE 2: Bank account shared by multiple beneficiaries
  // ─────────────────────────────────────────────
  if (applicant.bankAccountHash) {
    const bankCount = store.applications.filter(
      a => a.applicant.bankAccountHash === applicant.bankAccountHash
    ).length;

    if (bankCount > 1) {
      const ruleScore = FRAUD_RULES.SHARED_BANK_ACCOUNT.score;
      fraudScore += ruleScore;
      fraudFlags.push({
        rule: 'SHARED_BANK_ACCOUNT',
        score: ruleScore,
        description: `Bank account is linked to ${bankCount} different applications/beneficiaries. Possible money routing fraud.`,
      });
    }
  }

  // ─────────────────────────────────────────────
  // RULE 3: Multiple applications from same IP address
  // ─────────────────────────────────────────────
  if (metadata && metadata.ipAddress) {
    const ipCount = store.applications.filter(
      a => a.metadata && a.metadata.ipAddress === metadata.ipAddress
    ).length;

    if (ipCount >= 5) {
      const ruleScore = FRAUD_RULES.MULTIPLE_IP_APPLICATIONS.score;
      fraudScore += ruleScore;
      fraudFlags.push({
        rule: 'MULTIPLE_IP_APPLICATIONS',
        score: ruleScore,
        description: `${ipCount + 1} applications submitted from IP address ${metadata.ipAddress}. Possible bulk/bot submission.`,
      });
    }
  }

  // ─────────────────────────────────────────────
  // RULE 4: District anomaly — statistically unusual volume
  // ─────────────────────────────────────────────
  if (applicant.district) {
    const districtCount = store.applications.filter(
      a => a.applicant.district === applicant.district
    ).length;
    const totalApps = store.applications.length;
    const anomalyThreshold = Math.max(10, totalApps * 0.05);

    if (districtCount >= anomalyThreshold) {
      const ruleScore = FRAUD_RULES.DISTRICT_ANOMALY.score;
      fraudScore += ruleScore;
      fraudFlags.push({
        rule: 'DISTRICT_ANOMALY',
        score: ruleScore,
        description: `Unusually high number of applications (${districtCount}) from ${applicant.district} district. Possible coordinated fraud ring.`,
      });
    }
  }

  // ─────────────────────────────────────────────
  // RULE 5 & 6: Age/Income inconsistency with scheme requirements
  // ─────────────────────────────────────────────
  if (schemeId) {
    const scheme = store.getSchemeById(schemeId);
    if (scheme && scheme.eligibility) {
      // Age check
      if (scheme.eligibility.minAge && applicant.age < scheme.eligibility.minAge) {
        const ruleScore = FRAUD_RULES.AGE_INCONSISTENCY.score;
        fraudScore += ruleScore;
        fraudFlags.push({
          rule: 'AGE_INCONSISTENCY',
          score: ruleScore,
          description: `Applicant age (${applicant.age}) is below minimum required age (${scheme.eligibility.minAge}) for ${scheme.shortName || scheme.name}.`,
        });
      }
      if (scheme.eligibility.maxAge && applicant.age > scheme.eligibility.maxAge) {
        const ruleScore = FRAUD_RULES.AGE_INCONSISTENCY.score;
        fraudScore += ruleScore;
        fraudFlags.push({
          rule: 'AGE_INCONSISTENCY',
          score: ruleScore,
          description: `Applicant age (${applicant.age}) exceeds maximum age (${scheme.eligibility.maxAge}) for ${scheme.shortName || scheme.name}.`,
        });
      }

      // Income check
      if (scheme.eligibility.maxIncome && applicant.income > scheme.eligibility.maxIncome) {
        const ruleScore = FRAUD_RULES.INCOME_INCONSISTENCY.score;
        fraudScore += ruleScore;
        fraudFlags.push({
          rule: 'INCOME_INCONSISTENCY',
          score: ruleScore,
          description: `Applicant income (₹${applicant.income.toLocaleString('en-IN')}) exceeds maximum limit (₹${scheme.eligibility.maxIncome.toLocaleString('en-IN')}) for ${scheme.shortName || scheme.name}.`,
        });
      }
    }
  }

  // Cap at 100
  fraudScore = Math.min(fraudScore, 100);

  const fraudLevel =
    fraudScore <= 30 ? 'low' : fraudScore <= 60 ? 'medium' : 'high';

  return {
    fraudFlags,
    fraudScore,
    fraudLevel,
    isFlagged: fraudScore > 30,
  };
};

/**
 * Create a FraudAlert record for flagged applications
 */
const createFraudAlert = async (application, fraudResult) => {
  if (!fraudResult.isFlagged) return null;

  const now = new Date();
  const alert = store.addAlert({
    _id: `alert-${uuidv4().split('-')[0].toUpperCase()}`,
    alertId: `ALERT-${uuidv4().split('-')[0].toUpperCase()}`,
    applicationId: application.applicationId,
    applicantName: application.applicant.name,
    schemeName: application.schemeName,
    state: application.applicant.state,
    district: application.applicant.district,
    fraudScore: fraudResult.fraudScore,
    fraudLevel: fraudResult.fraudLevel,
    reasons: fraudResult.fraudFlags.map((f) => f.description),
    rulesTriggered: fraudResult.fraudFlags.map((f) => f.rule),
    affectedScheme: application.schemeName,
    status: 'open',
    createdAt: now,
    updatedAt: now,
  });

  return alert;
};

/**
 * Get fraud statistics for admin dashboard
 */
const getFraudStats = async () => {
  const total = store.fraudAlerts.length;
  const byLevel = store.groupAlertsBy('fraudLevel');
  const ruleCounts = {};
  store.fraudAlerts.forEach(a => {
    (a.rulesTriggered || []).forEach(r => { ruleCounts[r] = (ruleCounts[r] || 0) + 1; });
  });
  const byRule = Object.entries(ruleCounts)
    .map(([_id, count]) => ({ _id, count }))
    .sort((a, b) => b.count - a.count);
  const recentAlerts = store.fraudAlerts
    .filter(a => a.status === 'open')
    .sort((a, b) => b.fraudScore - a.fraudScore)
    .slice(0, 5);

  return { total, byLevel, byRule, recentAlerts };
};

module.exports = { detectFraud, createFraudAlert, getFraudStats };
