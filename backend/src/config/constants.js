const LANGUAGES = {
  ENGLISH: 'en',
  HINDI: 'hi',
  MARATHI: 'mr',
};

const FRAUD_RULES = {
  DUPLICATE_AADHAAR: { score: 40, label: 'Duplicate Aadhaar' },
  SHARED_BANK_ACCOUNT: { score: 30, label: 'Shared Bank Account' },
  MULTIPLE_IP_APPLICATIONS: { score: 25, label: 'IP Flood' },
  DISTRICT_ANOMALY: { score: 20, label: 'District Anomaly' },
  AGE_INCONSISTENCY: { score: 35, label: 'Age Inconsistency' },
  INCOME_INCONSISTENCY: { score: 30, label: 'Income Inconsistency' },
};

const FRAUD_LEVELS = {
  LOW: 'low',      // 0–30
  MEDIUM: 'medium', // 31–60
  HIGH: 'high',    // 61–100
};

const SCHEME_CATEGORIES = {
  AGRICULTURE: 'agriculture',
  HEALTH: 'health',
  HOUSING: 'housing',
  EDUCATION: 'education',
  FINANCIAL: 'financial',
  WOMEN: 'women',
  PENSION: 'pension',
  ENTREPRENEUR: 'entrepreneur',
};

const OCCUPATIONS = [
  'farmer',
  'daily-wage-worker',
  'small-business-owner',
  'student',
  'unemployed',
  'government-employee',
  'private-employee',
  'self-employed',
  'fisherman',
  'artisan',
];

module.exports = {
  LANGUAGES,
  FRAUD_RULES,
  FRAUD_LEVELS,
  SCHEME_CATEGORIES,
  OCCUPATIONS,
};
