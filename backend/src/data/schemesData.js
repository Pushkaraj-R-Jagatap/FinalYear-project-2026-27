/**
 * Static data for 15 real Indian Government Schemes
 * Used for seeding MongoDB and for LLM context
 */

const schemesData = [
  {
    name: 'Pradhan Mantri Kisan Samman Nidhi',
    shortName: 'PM-KISAN',
    description:
      'PM-KISAN provides financial support of ₹6,000 per year to all land-holding farmer families across India. The amount is paid in three equal installments of ₹2,000 directly to the beneficiary bank account via DBT.',
    category: 'agriculture',
    benefits: [
      '₹6,000 per year in three installments of ₹2,000 each',
      'Direct Bank Transfer (DBT) to beneficiary account',
      'No middlemen involved',
    ],
    eligibility: {
      minAge: 18,
      maxIncome: 150000,
      occupations: ['farmer'],
      otherCriteria: [
        'Must be a land-holding farmer family',
        'Should not be an income tax payer',
        'Should not hold any constitutional post',
        'Retired pensioners with monthly pension above ₹10,000 are excluded',
      ],
    },
    applicationProcess: [
      'Visit nearest Common Service Centre (CSC) or State Government Portal',
      'Submit PM-KISAN Self-Registration form online at pmkisan.gov.in',
      'Provide land records, Aadhaar, and bank details',
      'Village-level verification by Patwari/Lekhpal',
      'State Government approves and forwards to Centre',
    ],
    documentsRequired: ['Aadhaar Card', 'Land Ownership Document / Khatoni', 'Bank Account Passbook', 'Mobile Number'],
    officialLink: 'https://pmkisan.gov.in',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    launchYear: 2019,
    tags: ['farmer', 'agriculture', 'direct-benefit', 'income-support'],
  },

  {
    name: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana',
    shortName: 'PMJAY / Ayushman Bharat',
    description:
      'World\'s largest health insurance scheme providing cover up to ₹5 lakh per family per year for secondary and tertiary hospitalization. Covers over 10 crore poor and vulnerable families (50 crore beneficiaries).',
    category: 'health',
    benefits: [
      'Cashless health coverage up to ₹5 lakh per family per year',
      'Covers pre and post-hospitalization expenses',
      'Covers 1,949 medical procedures',
      'Portability across India — treatment at any empanelled hospital',
      'No premium for beneficiaries',
    ],
    eligibility: {
      maxIncome: 100000,
      otherCriteria: [
        'Must be listed in SECC 2011 database',
        'Covers rural families based on deprivation criteria',
        'Covers urban workers in identified occupational categories',
        'No family size or age restriction',
      ],
    },
    applicationProcess: [
      'Check eligibility at mera.pmjay.gov.in or call 14555',
      'Visit nearest Ayushman Bharat Empanelled Hospital',
      'Present Aadhaar / Ration Card for identification',
      'Hospital will generate e-card on the spot',
      'Avail cashless treatment',
    ],
    documentsRequired: ['Aadhaar Card', 'Ration Card', 'SECC 2011 enrollment proof'],
    officialLink: 'https://pmjay.gov.in',
    ministry: 'Ministry of Health & Family Welfare',
    launchYear: 2018,
    tags: ['health', 'insurance', 'hospital', 'bpl', 'cashless'],
  },

  {
    name: 'Pradhan Mantri Awas Yojana',
    shortName: 'PMAY',
    description:
      'Housing for All scheme providing affordable housing to urban and rural poor. Offers interest subsidy on home loans for EWS, LIG, and MIG categories. Aims to build pucca houses for every Indian family by 2024.',
    category: 'housing',
    benefits: [
      'Interest subsidy of 6.5% for EWS/LIG on loans up to ₹6 lakh',
      'Interest subsidy of 4% for MIG-I on loans up to ₹9 lakh',
      'Interest subsidy of 3% for MIG-II on loans up to ₹12 lakh',
      'Central assistance of ₹1.5 lakh for beneficiary-led construction',
      'Houses with basic amenities — toilet, water, electricity',
    ],
    eligibility: {
      minAge: 18,
      maxIncome: 1800000,
      otherCriteria: [
        'Should not own a pucca house anywhere in India',
        'EWS: Annual income up to ₹3 lakh',
        'LIG: Annual income ₹3–6 lakh',
        'MIG-I: Annual income ₹6–12 lakh',
        'MIG-II: Annual income ₹12–18 lakh',
        'Woman must be co-owner for EWS/LIG categories',
      ],
    },
    applicationProcess: [
      'Apply online at pmaymis.gov.in',
      'Or visit nearest bank/housing finance company',
      'Fill application form with income and property details',
      'Submit required documents',
      'Bank verifies and processes loan/subsidy',
    ],
    documentsRequired: [
      'Aadhaar Card',
      'Income Certificate',
      'Property Documents',
      'Bank Account Details',
      'Caste Certificate (if applicable)',
    ],
    officialLink: 'https://pmaymis.gov.in',
    ministry: 'Ministry of Housing & Urban Affairs',
    launchYear: 2015,
    tags: ['housing', 'home-loan', 'subsidy', 'urban', 'rural'],
  },

  {
    name: 'Pradhan Mantri Jan Dhan Yojana',
    shortName: 'PMJDY',
    description:
      'National mission for financial inclusion to ensure access to financial services to all households. Provides zero-balance bank accounts with RuPay debit card, accident insurance of ₹2 lakh, and overdraft facility.',
    category: 'financial',
    benefits: [
      'Zero-balance savings bank account',
      'RuPay Debit Card with ₹2 lakh accident insurance',
      'Overdraft facility up to ₹10,000',
      'Life cover of ₹30,000',
      'Access to DBT benefits',
      'Mobile banking and micro-insurance facilities',
    ],
    eligibility: {
      minAge: 10,
      otherCriteria: [
        'Any Indian citizen without a bank account',
        'Minor accounts allowed with guardian',
        'No minimum income requirement',
      ],
    },
    applicationProcess: [
      'Visit any bank branch or Business Correspondent (Bank Mitra)',
      'Fill Jan Dhan account opening form',
      'Submit KYC documents (Aadhaar + one address proof)',
      'Account opened immediately',
      'RuPay card issued within 10 working days',
    ],
    documentsRequired: ['Aadhaar Card', 'Voter ID / Passport / Driving License (for address proof)'],
    officialLink: 'https://pmjdy.gov.in',
    ministry: 'Ministry of Finance',
    launchYear: 2014,
    tags: ['banking', 'financial-inclusion', 'zero-balance', 'insurance'],
  },

  {
    name: 'Pradhan Mantri MUDRA Yojana',
    shortName: 'PMMY / MUDRA',
    description:
      'Provides loans to non-agricultural micro and small enterprises. Three categories: Shishu (up to ₹50,000), Kishore (₹50,000 to ₹5 lakh), and Tarun (₹5 lakh to ₹10 lakh). No collateral required for Shishu and Kishore.',
    category: 'entrepreneur',
    benefits: [
      'Loans up to ₹10 lakh without collateral (Shishu & Kishore)',
      'Mudra Card for working capital requirements',
      'Shishu: Up to ₹50,000',
      'Kishore: ₹50,000 to ₹5 lakh',
      'Tarun: ₹5 lakh to ₹10 lakh',
      'Support for business expansion',
    ],
    eligibility: {
      minAge: 18,
      occupations: ['small-business-owner', 'self-employed', 'artisan'],
      otherCriteria: [
        'Non-agricultural micro/small/medium enterprises',
        'Manufacturing, trading, or service sector',
        'Not a defaulter of any bank/financial institution',
      ],
    },
    applicationProcess: [
      'Approach any bank, MFI, or NBFC',
      'Prepare business plan / project report',
      'Fill MUDRA loan application',
      'Submit KYC and business documents',
      'Bank processes and disburses within 7–30 days',
    ],
    documentsRequired: [
      'Aadhaar Card & PAN Card',
      'Business Registration Proof',
      'Bank Statement (6 months)',
      'Business Plan / Project Report',
      'Caste Certificate (if SC/ST/OBC)',
    ],
    officialLink: 'https://mudra.org.in',
    ministry: 'Ministry of Finance',
    launchYear: 2015,
    tags: ['business-loan', 'entrepreneur', 'startup', 'self-employment'],
  },

  {
    name: 'Sukanya Samriddhi Yojana',
    shortName: 'SSY',
    description:
      'Small savings scheme for the girl child under Beti Bachao Beti Padhao campaign. Offers high interest rate (currently 8.2% p.a.) and tax benefits. Account matures after 21 years from opening or at marriage (after 18).',
    category: 'women',
    benefits: [
      'High interest rate — currently 8.2% per annum (tax-free)',
      'Tax deduction under Section 80C up to ₹1.5 lakh',
      'Maturity amount fully tax-free',
      '50% withdrawal allowed after girl turns 18 (for education)',
      'Account active for 21 years from opening date',
    ],
    eligibility: {
      maxAge: 10, // Maximum age of girl at account opening
      gender: 'female',
      otherCriteria: [
        'Account opened in name of girl child under 10 years old',
        'By parents or legal guardians',
        'Maximum two accounts per family (twins: three)',
        'Minimum deposit ₹250 per year, maximum ₹1.5 lakh',
      ],
    },
    applicationProcess: [
      'Visit Post Office or authorized bank branch',
      'Fill Sukanya Samriddhi account opening form',
      'Initial deposit (minimum ₹250)',
      'Submit girl\'s birth certificate and KYC of guardian',
      'Passbook issued immediately',
    ],
    documentsRequired: [
      'Girl Child\'s Birth Certificate',
      'Aadhaar Card of Parent/Guardian',
      'Address Proof of Parent/Guardian',
      'Initial Deposit Amount',
    ],
    officialLink: 'https://www.indiapost.gov.in',
    ministry: 'Ministry of Finance',
    launchYear: 2015,
    tags: ['girl-child', 'savings', 'education', 'women', 'tax-benefit'],
  },

  {
    name: 'Atal Pension Yojana',
    shortName: 'APY',
    description:
      'Pension scheme for unorganized sector workers. Guarantees monthly pension of ₹1,000 to ₹5,000 after age 60, depending on contribution amount and age at joining. Government co-contributes 50% for eligible subscribers.',
    category: 'pension',
    benefits: [
      'Guaranteed monthly pension of ₹1,000 / ₹2,000 / ₹3,000 / ₹4,000 / ₹5,000',
      'Same pension amount to spouse after subscriber\'s death',
      '100% corpus return to nominee on death of both',
      'Government co-contributes 50% of contribution (for eligible subscribers)',
      'Tax benefit under Section 80CCD',
    ],
    eligibility: {
      minAge: 18,
      maxAge: 40,
      otherCriteria: [
        'Indian citizen between 18–40 years',
        'Must have savings bank account and Aadhaar-linked mobile number',
        'Not an income tax payer (for govt co-contribution)',
        'Not a member of any statutory social security scheme',
      ],
    },
    applicationProcess: [
      'Visit bank branch or open online through net banking',
      'Fill APY registration form',
      'Link savings account for auto-debit',
      'Choose pension amount (₹1000–₹5000)',
      'PRAN (Permanent Retirement Account Number) issued',
    ],
    documentsRequired: ['Aadhaar Card', 'Bank Account with Aadhaar-linked mobile', 'Nominee details'],
    officialLink: 'https://npscra.nsdl.co.in',
    ministry: 'Ministry of Finance',
    launchYear: 2015,
    tags: ['pension', 'retirement', 'unorganized-sector', 'social-security'],
  },

  {
    name: 'Pradhan Mantri Ujjwala Yojana',
    shortName: 'PMUY',
    description:
      'Provides free LPG connections to women from Below Poverty Line (BPL) households to replace harmful cooking fuels. Aims to safeguard health of women and children and reduce indoor air pollution.',
    category: 'women',
    benefits: [
      'Free LPG connection with security deposit waiver',
      'One free refill cylinder and hotplate',
      'EMI facility for purchase of first stove and refill',
      'Promotes clean cooking fuel',
      'Reduces indoor air pollution',
    ],
    eligibility: {
      minAge: 18,
      maxIncome: 150000,
      gender: 'female',
      otherCriteria: [
        'Women from BPL households',
        'Name should be in SECC-2011 data or BPL list',
        'Should not have existing LPG connection in household',
        'Minimum 18 years of age',
      ],
    },
    applicationProcess: [
      'Visit nearest LPG distributor (IOC, HPCL, BPCL)',
      'Fill PMUY application form',
      'Submit KYC documents and BPL certificate',
      'Distributor verifies and submits to oil company',
      'Connection approved and delivered to doorstep',
    ],
    documentsRequired: [
      'Aadhaar Card',
      'BPL Ration Card / SECC-2011 list proof',
      'Bank Account Details',
      'Photograph',
    ],
    officialLink: 'https://pmuy.gov.in',
    ministry: 'Ministry of Petroleum & Natural Gas',
    launchYear: 2016,
    tags: ['lpg', 'cooking-gas', 'women', 'bpl', 'clean-energy'],
  },

  {
    name: 'Stand Up India Scheme',
    shortName: 'Stand Up India',
    description:
      'Facilitates bank loans between ₹10 lakh and ₹1 crore to at least one Scheduled Caste (SC) or Scheduled Tribe (ST) borrower and at least one woman borrower per bank branch for setting up greenfield enterprises.',
    category: 'entrepreneur',
    benefits: [
      'Bank loans from ₹10 lakh to ₹1 crore',
      'Covers 75% of project cost',
      'Repayment period up to 7 years',
      'Moratorium period of 18 months',
      'Working capital in the form of overdraft / cash credit',
      'Rupay debit card for working capital access',
    ],
    eligibility: {
      minAge: 18,
      otherCriteria: [
        'SC, ST, or Woman entrepreneur',
        'Setting up a Greenfield enterprise',
        'Manufacturing, services, or trading sector',
        'Should not be a defaulter',
        'If existing enterprise, must be upgrading to new production',
      ],
    },
    applicationProcess: [
      'Apply online at standupmitra.in',
      'Or approach bank branch directly',
      'Submit business plan and project report',
      'Bank evaluates and sanctions loan',
      'Hand-holding support through SIDBI/NABARD',
    ],
    documentsRequired: [
      'Aadhaar & PAN Card',
      'SC/ST Certificate or Gender Proof',
      'Business Plan / Project Report',
      'Property/Lease Documents',
      'Bank Statement',
    ],
    officialLink: 'https://standupmitra.in',
    ministry: 'Ministry of Finance',
    launchYear: 2016,
    tags: ['sc-st', 'women', 'business-loan', 'entrepreneur', 'greenfield'],
  },

  {
    name: 'National Scholarship Portal Schemes',
    shortName: 'NSP Scholarships',
    description:
      'A one-stop platform for various central and state government scholarships for meritorious students from economically weaker sections. Covers pre-matric, post-matric, and merit-cum-means scholarships.',
    category: 'education',
    benefits: [
      'Scholarships ranging from ₹1,000 to ₹20,000 per year',
      'Covers tuition fees, hostel charges, and maintenance allowance',
      'Direct transfer to student\'s bank account',
      'Renewable every year based on performance',
      'Covers various minorities, SC, ST, OBC, and general categories',
    ],
    eligibility: {
      minAge: 6,
      maxAge: 35,
      maxIncome: 250000,
      occupations: ['student'],
      otherCriteria: [
        'Enrolled in recognized institution',
        'Minimum 50% marks in previous examination',
        'Family income below threshold (varies by scheme)',
        'SC/ST/OBC/Minority category (varies by scheme)',
      ],
    },
    applicationProcess: [
      'Register on scholarships.gov.in',
      'Choose applicable scholarship',
      'Fill application form with academic details',
      'Upload documents and submit',
      'Institute verifies and approves',
      'Amount transferred to bank account',
    ],
    documentsRequired: [
      'Aadhaar Card',
      'Mark Sheets of Last Qualifying Exam',
      'Income Certificate',
      'Caste/Category Certificate',
      'Bank Account Details',
      'Institution Enrollment Proof',
    ],
    officialLink: 'https://scholarships.gov.in',
    ministry: 'Ministry of Education',
    launchYear: 2015,
    tags: ['scholarship', 'education', 'student', 'minority', 'sc-st'],
  },

  {
    name: 'PM Vishwakarma Yojana',
    shortName: 'PM Vishwakarma',
    description:
      'Supports traditional artisans and craftspeople (Vishwakarmas) with skill training, modern tools, digital empowerment, and collateral-free credit. Covers 18 traditional occupations like blacksmiths, carpenters, potters, etc.',
    category: 'entrepreneur',
    benefits: [
      'Recognition through PM Vishwakarma certificate and ID card',
      'Skill training of 5 to 15 days with ₹500/day stipend',
      'Modern toolkit grant worth ₹15,000',
      'Collateral-free loans: ₹1 lakh (first tranche) & ₹2 lakh (second tranche)',
      'Incentive for digital transactions: ₹1/transaction (max 100/month)',
      'Digital marketing support',
    ],
    eligibility: {
      minAge: 18,
      occupations: ['artisan'],
      otherCriteria: [
        'Must work with hands and tools in one of 18 designated trades',
        'Self-employed, not salaried government employee',
        'Age 18 or above at the time of registration',
        'Not enrolled in PMEGP / PM SVANidhi / Mudra schemes',
      ],
    },
    applicationProcess: [
      'Register through Common Service Centre (CSC)',
      'Biometric verification via CSC',
      'Skill training enrollment',
      'Receive toolkit grant post-training',
      'Apply for collateral-free loan through bank',
    ],
    documentsRequired: ['Aadhaar Card', 'Mobile Number linked to Aadhaar', 'Bank Account Details', 'Ration Card'],
    officialLink: 'https://pmvishwakarma.gov.in',
    ministry: 'Ministry of Micro, Small and Medium Enterprises',
    launchYear: 2023,
    tags: ['artisan', 'craftsman', 'skill', 'tool-grant', 'traditional'],
  },

  {
    name: 'PM SVANidhi — Street Vendor Scheme',
    shortName: 'PM SVANidhi',
    description:
      'Provides affordable working capital loans to street vendors to restart their livelihoods affected by COVID-19. Offers ₹10,000 initially, scaling up to ₹50,000. Rewards digital transactions with cashback.',
    category: 'entrepreneur',
    benefits: [
      'Initial loan of ₹10,000, then ₹20,000, then ₹50,000',
      'No collateral required',
      '7% interest subsidy',
      'Cashback incentive for digital transactions (up to ₹1,200/year)',
      'Credit score improvement support',
    ],
    eligibility: {
      minAge: 18,
      otherCriteria: [
        'Street vendor identified in survey or holding vending certificate',
        'Vendors who missed the survey can apply with recommendation letter',
        'All urban local body recognized street vendors eligible',
      ],
    },
    applicationProcess: [
      'Download PM SVANidhi app or visit lending institution',
      'Submit application with vending certificate / LoR',
      'Bank processes and approves',
      'Loan disbursed to bank account',
      'Repay with digital transactions for better credit profile',
    ],
    documentsRequired: ['Aadhaar Card', 'Vendor ID / Vending Certificate', 'Bank Account Details', 'Photograph'],
    officialLink: 'https://pmsvanidhi.mohua.gov.in',
    ministry: 'Ministry of Housing & Urban Affairs',
    launchYear: 2020,
    tags: ['street-vendor', 'working-capital', 'urban', 'micro-loan'],
  },

  {
    name: 'Beti Bachao Beti Padhao',
    shortName: 'BBBP',
    description:
      'A social campaign aimed at addressing the declining Child Sex Ratio (CSR) and promoting the welfare and education of the girl child. Focuses on preventing gender-biased sex selective elimination and ensuring education and participation of girls.',
    category: 'women',
    benefits: [
      'Scholarships and incentives for girls\' education',
      'Skill development programs for adolescent girls',
      'Awareness campaigns against child marriage',
      'Improved birth registration and healthcare for girls',
      'Community engagement programs',
    ],
    eligibility: {
      maxAge: 18,
      gender: 'female',
      otherCriteria: [
        'Girl child from any background',
        'Priority to 100 selected districts with low sex ratio',
        'No income restriction',
      ],
    },
    applicationProcess: [
      'Contact local ASHA worker or Anganwadi center',
      'Register daughter\'s birth at local municipality',
      'Enroll in Sukanya Samriddhi Yojana for financial benefits',
      'Contact District Collector\'s office for scheme details',
    ],
    documentsRequired: ['Birth Certificate of Girl Child', 'Aadhaar Card of Parent', 'Address Proof'],
    officialLink: 'https://wcd.nic.in',
    ministry: 'Ministry of Women & Child Development',
    launchYear: 2015,
    tags: ['girl-child', 'women-empowerment', 'education', 'social'],
  },

  {
    name: 'Pradhan Mantri Fasal Bima Yojana',
    shortName: 'PMFBY',
    description:
      'Crop insurance scheme protecting farmers against losses due to natural calamities, pests, and diseases. Farmers pay very low premiums (2% for Kharif, 1.5% for Rabi, 5% for commercial crops) and government subsidizes the rest.',
    category: 'agriculture',
    benefits: [
      'Insurance coverage for crop losses from natural calamities',
      'Very low premium: 2% Kharif, 1.5% Rabi, 5% horticulture',
      'Uses Satellite imagery and drones for loss assessment',
      'Claims settled within 2 months of harvest',
      'Prevents distress sale of assets',
      'Covers pre-sowing and post-harvest losses',
    ],
    eligibility: {
      minAge: 18,
      occupations: ['farmer'],
      otherCriteria: [
        'All farmers including sharecroppers and tenant farmers',
        'Compulsory for loanee farmers',
        'Voluntary for non-loanee farmers',
      ],
    },
    applicationProcess: [
      'Loanee farmers: enrolled automatically through bank',
      'Non-loanee: visit CSC, bank, or insurance company agent',
      'Fill application form with land details and crop info',
      'Pay premium amount',
      'Confirmation slip received',
      'In case of loss, notify within 72 hours to insurance company/bank/CSC/1800-180-1551',
    ],
    documentsRequired: ['Aadhaar Card', 'Land Records / Khatoni', 'Bank Account Details', 'Sowing Certificate'],
    officialLink: 'https://pmfby.gov.in',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    launchYear: 2016,
    tags: ['crop-insurance', 'farmer', 'natural-calamity', 'agriculture'],
  },

  {
    name: 'Skill India Mission — PMKVY',
    shortName: 'PMKVY',
    description:
      'Pradhan Mantri Kaushal Vikas Yojana provides free, industry-relevant skill training to youth across India. Offers monetary rewards for successful completion and focuses on building employable skills matching market demand.',
    category: 'education',
    benefits: [
      'Free skill training with government-certified curriculum',
      'Monetary reward upon successful training & assessment',
      'Placement assistance after training',
      'Recognition of Prior Learning (RPL) for existing skills',
      'Insurance coverage during training period',
    ],
    eligibility: {
      minAge: 15,
      maxAge: 45,
      otherCriteria: [
        'Indian citizen between 15–45 years',
        'Class 8 passed (for some courses)',
        'Unemployed, school/college dropout, or seeking skill upgrade',
        'Priority to youth with no formal skill certification',
      ],
    },
    applicationProcess: [
      'Visit skillindiadigital.gov.in or nearest PMKVY Training Centre',
      'Register with Aadhaar and mobile number',
      'Choose desired skill course',
      'Attend training at empanelled Training Partner centre',
      'Appear in assessment exam',
      'Receive skill certificate and job placement support',
    ],
    documentsRequired: ['Aadhaar Card', 'Age Proof / Date of Birth Certificate', 'Bank Account Details', 'Photograph'],
    officialLink: 'https://skillindiadigital.gov.in',
    ministry: 'Ministry of Skill Development & Entrepreneurship',
    launchYear: 2015,
    tags: ['skill', 'youth', 'training', 'employment', 'certification'],
  },
];

module.exports = schemesData;
