const store = require('../data/memoryStore');
const { callAI } = require('../services/aiService');

/**
 * GET /api/schemes
 * Retrieve all active schemes with optional category filter
 */
const getAllSchemes = async (req, res, next) => {
  try {
    const { category, search, includeInactive } = req.query;
    let schemes = [];

    const activeFilter = includeInactive === 'true' ? undefined : true;

    if (global.useMemoryStore) {
      schemes = store.getSchemes({
        ...(activeFilter !== undefined && { isActive: activeFilter }),
        ...(category && { category }),
        ...(search && { search }),
      });
    } else {
      const Scheme = require('../models/Scheme');
      const filter = {};
      if (activeFilter !== undefined) filter.isActive = activeFilter;
      if (category) filter.category = category;
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { shortName: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } },
        ];
      }
      schemes = await Scheme.find(filter).sort({ name: 1 });
    }

    res.status(200).json({
      success: true,
      count: schemes.length,
      data: schemes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/schemes/:id
 * Retrieve a single scheme by ID
 */
const getSchemeById = async (req, res, next) => {
  try {
    let scheme = null;

    if (global.useMemoryStore) {
      scheme = store.getSchemeById(req.params.id);
    } else {
      const Scheme = require('../models/Scheme');
      scheme = await Scheme.findById(req.params.id);
    }

    if (!scheme) {
      return res.status(404).json({
        success: false,
        error: 'Scheme not found.',
      });
    }

    res.status(200).json({ success: true, data: scheme });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/schemes/eligible
 * AI-powered: find schemes the user is eligible for based on their profile
 */
const findEligibleSchemes = async (req, res, next) => {
  try {
    const {
      age, income, occupation, state, gender, education, socialCategory,
      // NEW FIELDS:
      district, maritalStatus, disability, disabilityType,
      bplCard, landOwnership, hasCasteCertificate, religion,
      rationCardType, isMinority, numberOfDependents, annualHouseholdIncome,
    } = req.body;

    if (!age || !income) {
      return res.status(400).json({
        success: false,
        error: 'Age and income are required to check eligibility.',
      });
    }

    const profile = {
      age: parseInt(age),
      income: parseInt(income),
      occupation: occupation || null,
      state: state || null,
      gender: gender || null,
      education: education || null,
      socialCategory: socialCategory || null,
      // NEW:
      district: district || null,
      maritalStatus: maritalStatus || null,
      disability: disability || false,
      disabilityType: disabilityType || null,
      bplCard: bplCard || false,
      landOwnership: landOwnership || null,
      hasCasteCertificate: hasCasteCertificate || false,
      religion: religion || null,
      rationCardType: rationCardType || null,
      isMinority: isMinority || false,
      numberOfDependents: numberOfDependents ? parseInt(numberOfDependents) : null,
      annualHouseholdIncome: annualHouseholdIncome ? parseInt(annualHouseholdIncome) : null,
    };

    const ageNum = profile.age;
    const incomeNum = profile.income;

    // ── Rule-Based Local Filtering ────────────────────────────────
    let databaseSchemes = [];
    if (global.useMemoryStore) {
      databaseSchemes = store.schemes.filter(s => s.isActive);
    } else {
      const Scheme = require('../models/Scheme');
      databaseSchemes = await Scheme.find({ isActive: true });
    }

    let ruleMatchedSchemes = databaseSchemes.filter(scheme => {
      const elig = scheme.eligibility;
      if (!elig) return true;

      // Age check
      if (elig.minAge && ageNum < elig.minAge) return false;
      if (elig.maxAge && ageNum > elig.maxAge) return false;

      // Income check
      if (elig.maxIncome && incomeNum > elig.maxIncome) return false;
      if (elig.minIncome && incomeNum < elig.minIncome) return false;

      // Occupation check
      if (elig.occupations && elig.occupations.length > 0 && occupation) {
        const matchesOcc = elig.occupations.some(o => o.toLowerCase() === occupation.toLowerCase());
        if (!matchesOcc) return false;
      }

      // State check
      if (elig.states && elig.states.length > 0 && state) {
        const matchesState = elig.states.some(s => s.toLowerCase() === state.toLowerCase());
        if (!matchesState) return false;
      }

      // Gender check
      if (elig.gender && elig.gender !== 'any' && gender) {
        if (elig.gender.toLowerCase() !== gender.toLowerCase()) return false;
      }

      // Social Category / Other Criteria check
      if (elig.otherCriteria && elig.otherCriteria.length > 0) {
        if (socialCategory && socialCategory !== 'general') {
          // If scheme is only for general but user is reserved, or vice-versa, can check
        }
      }

      return true;
    });

    // Boost scores for special profile attributes
    ruleMatchedSchemes = ruleMatchedSchemes.map(scheme => {
      let boost = 0;
      const tags = (scheme.tags || []).map(t => t.toLowerCase());
      if (profile.disability && tags.some(t => ['disability','divyang','handicap','disabled'].includes(t))) boost += 20;
      if (profile.bplCard && tags.some(t => ['bpl','poverty','ration','poor'].includes(t))) boost += 25;
      if (profile.maritalStatus === 'widow' && tags.some(t => ['widow','mahila','women','woman'].includes(t))) boost += 20;
      if (profile.isMinority && tags.some(t => ['minority','minorities'].includes(t))) boost += 15;
      return { ...scheme, _boost: boost };
    }).sort((a, b) => (b._boost || 0) - (a._boost || 0));

    const ruleMatchedFormatted = ruleMatchedSchemes.map(s => {
      const obj = typeof s.toObject === 'function' ? s.toObject() : s;
      return {
        ...obj,
        matchReasons: ['Profile matches age, income, and geographical eligibility parameters.'],
        isRuleMatched: true,
      };
    });

    // ── AI-Powered Recommendations (Groq Llama 3) ─────────────────
    const systemPrompt = `You are GovAI, an expert on Indian government welfare schemes.
The citizen is from ${profile.state || 'India'}${profile.district ? `, ${profile.district} district` : ''}.

Citizen Profile:
- Age: ${profile.age}, Income: ₹${profile.income}/yr
- Occupation: ${profile.occupation || 'not specified'}, Gender: ${profile.gender || 'not specified'}
- Social Category: ${profile.socialCategory || 'general'}, Education: ${profile.education || 'not specified'}
- BPL Card: ${profile.bplCard ? 'Yes' : 'No'}, Ration Card: ${profile.rationCardType || 'none'}
- Disability: ${profile.disability ? (profile.disabilityType || 'Yes') : 'No'}
- Marital Status: ${profile.maritalStatus || 'not specified'}
- Religion: ${profile.religion || 'not specified'}, Minority: ${profile.isMinority ? 'Yes' : 'No'}
- Land Ownership: ${profile.landOwnership || 'unknown'}
- Dependents: ${profile.numberOfDependents !== null ? profile.numberOfDependents : 'not specified'}
- Household Income: ${profile.annualHouseholdIncome ? '₹' + profile.annualHouseholdIncome.toLocaleString('en-IN') : 'same as personal'}

These central government schemes exist: ${ruleMatchedSchemes.map(s => s.name).join(', ')}.

Task:
1. Return a JSON array of ALL schemes this citizen qualifies for (from the list above AND any well-known state-specific schemes for ${profile.state || 'their state'}).
2. For state-specific schemes NOT in the list, add them with ai_suggested: true.
3. Each item: { name, shortName, category, description, benefits: [], documentsRequired: [], applicationProcess: [], officialLink, matchReasons: [], ministry, launchYear, ai_suggested: false }
4. Also return a regionInsight string: 1-2 sentences about scheme availability specifically for ${profile.state || 'this region'}${profile.district ? ` / ${profile.district}` : ''}.

Return format:
{ "schemes": [...], "regionInsight": "..." }

Return ONLY raw JSON, no markdown, no code blocks.`;

    let aiSchemes = [];
    let regionInsight = '';
    try {
      const aiMessages = [{ role: 'user', content: systemPrompt }];
      const aiResponse = await callAI(aiMessages, 'en');

      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        aiSchemes = parsed.schemes || (Array.isArray(parsed) ? parsed : []);
        regionInsight = parsed.regionInsight || '';
      } else {
        aiSchemes = JSON.parse(aiResponse);
      }
    } catch (parseErr) {
      console.warn('AI eligibility finder failed, falling back to database rule-based matches:', parseErr.message);
      try {
        aiSchemes = JSON.parse(aiResponse);
      } catch (e2) {
        aiSchemes = [];
      }
    }

    // Merge & Deduplicate
    const mergedSchemes = [...ruleMatchedFormatted];

    aiSchemes.forEach((aiScheme, idx) => {
      // Check if already in ruleMatched list by shortName or name
      const alreadyMatched = ruleMatchedFormatted.some(
        s => (s.shortName && s.shortName.toLowerCase() === (aiScheme.shortName || '').toLowerCase()) ||
             (aiScheme.name && s.name.toLowerCase().includes(aiScheme.name.toLowerCase())) ||
             (aiScheme.name && aiScheme.name.toLowerCase().includes(s.name.toLowerCase()))
      );

      if (!alreadyMatched) {
        mergedSchemes.push({
          ...aiScheme,
          _id: `ai-${idx}-${Date.now()}`,
          isRuleMatched: false,
        });
      }
    });

    res.status(200).json({
      success: true,
      count: mergedSchemes.length,
      profile,
      data: mergedSchemes,
      aiPowered: true,
      regionInsight,
    });
  } catch (error) {
    next(error);
  }
};


/**
 * POST /api/schemes
 * Admin CRUD: Create a new government scheme
 */
const createScheme = async (req, res, next) => {
  try {
    const { name, description, category } = req.body;

    if (!name || !description || !category) {
      return res.status(400).json({
        success: false,
        error: 'Name, description, and category are required.',
      });
    }

    let created = null;
    if (global.useMemoryStore) {
      created = store.addScheme(req.body);
    } else {
      const Scheme = require('../models/Scheme');
      created = await Scheme.create(req.body);
    }

    res.status(201).json({
      success: true,
      message: 'Scheme created successfully.',
      data: created,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/schemes/:id
 * Admin CRUD: Edit an existing scheme
 */
const updateScheme = async (req, res, next) => {
  try {
    const { id } = req.params;

    let updated = null;
    if (global.useMemoryStore) {
      updated = store.updateScheme(id, req.body);
    } else {
      const Scheme = require('../models/Scheme');
      updated = await Scheme.findByIdAndUpdate(id, req.body, { new: true });
    }

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Scheme not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Scheme updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/schemes/:id
 * Admin CRUD: Delete a scheme
 */
const deleteScheme = async (req, res, next) => {
  try {
    const { id } = req.params;

    let success = false;
    if (global.useMemoryStore) {
      success = store.deleteScheme(id);
    } else {
      const Scheme = require('../models/Scheme');
      const result = await Scheme.findByIdAndDelete(id);
      success = !!result;
    }

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Scheme not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Scheme deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSchemes,
  getSchemeById,
  findEligibleSchemes,
  createScheme,
  updateScheme,
  deleteScheme,
};

