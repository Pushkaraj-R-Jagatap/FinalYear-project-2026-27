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
    const { age, income, occupation, state, gender, education, socialCategory } = req.body;

    if (!age || !income) {
      return res.status(400).json({
        success: false,
        error: 'Age and income are required to check eligibility.',
      });
    }

    const ageNum = parseInt(age);
    const incomeNum = parseInt(income);

    // ── Rule-Based Local Filtering ────────────────────────────────
    let databaseSchemes = [];
    if (global.useMemoryStore) {
      databaseSchemes = store.schemes.filter(s => s.isActive);
    } else {
      const Scheme = require('../models/Scheme');
      databaseSchemes = await Scheme.find({ isActive: true });
    }

    const ruleMatchedSchemes = databaseSchemes.filter(scheme => {
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

    const ruleMatchedFormatted = ruleMatchedSchemes.map(s => {
      const obj = typeof s.toObject === 'function' ? s.toObject() : s;
      return {
        ...obj,
        matchReasons: ['Profile matches age, income, and geographical eligibility parameters.'],
        isRuleMatched: true,
      };
    });

    // ── AI-Powered Recommendations (Groq Llama 3) ─────────────────
    const prompt = `You are an expert on Indian Government Schemes. A citizen has provided their profile. Based on these details, identify ALL government schemes they are eligible for.

User Profile:
- Age: ${ageNum} years
- Annual Income: ₹${incomeNum.toLocaleString('en-IN')} per year
- Occupation: ${occupation || 'Not specified'}
- State: ${state || 'All India'}
- Gender: ${gender || 'Not specified'}
- Education: ${education || 'Not specified'}
- Social Category: ${socialCategory || 'Not specified'}

Return ONLY a valid JSON array (no markdown, no code blocks, no explanation — raw JSON only) of eligible schemes. Each scheme object must have exactly these fields:
{
  "name": "Full official scheme name",
  "shortName": "Short acronym",
  "category": "one of: agriculture / health / housing / education / financial / women / pension / entrepreneur",
  "description": "2–3 sentence description of what the scheme offers",
  "benefits": ["benefit 1", "benefit 2", "benefit 3"],
  "documentsRequired": ["Aadhaar Card", "Bank Passbook"],
  "applicationProcess": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
  "officialLink": "https://official-url.gov.in",
  "matchReasons": ["Specific reason this user qualifies based on their profile"],
  "ministry": "Ministry of ...",
  "launchYear": "YYYY"
}

Include 6 to 12 relevant schemes. Be precise and specific about matchReasons using the user's actual profile.`;

    let aiSchemes = [];
    try {
      const aiMessages = [{ role: 'user', content: prompt }];
      const aiResponse = await callAI(aiMessages, 'en');

      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        aiSchemes = JSON.parse(jsonMatch[0]);
      } else {
        aiSchemes = JSON.parse(aiResponse);
      }
    } catch (parseErr) {
      console.warn('AI eligibility finder failed, falling back to database rule-based matches:', parseErr.message);
    }

    // Merge & Deduplicate
    const mergedSchemes = [...ruleMatchedFormatted];
    
    aiSchemes.forEach((aiScheme, idx) => {
      // Check if already in ruleMatched list by shortName or name
      const alreadyMatched = ruleMatchedFormatted.some(
        s => (s.shortName && s.shortName.toLowerCase() === (aiScheme.shortName || '').toLowerCase()) ||
             s.name.toLowerCase().includes(aiScheme.name.toLowerCase()) ||
             aiScheme.name.toLowerCase().includes(s.name.toLowerCase())
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
      profile: { age: ageNum, income: incomeNum, occupation, state, gender, education, socialCategory },
      data: mergedSchemes,
      aiPowered: aiSchemes.length > 0,
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

