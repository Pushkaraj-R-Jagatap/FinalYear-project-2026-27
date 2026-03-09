const store = require('../data/memoryStore');
const { callAI } = require('../services/aiService');

/**
 * GET /api/schemes
 * Retrieve all active schemes with optional category filter
 */
const getAllSchemes = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const schemes = store.getSchemes({
      isActive: true,
      ...(category && { category }),
      ...(search && { search }),
    });

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
    const scheme = store.getSchemeById(req.params.id);

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
    const { age, income, occupation, state, gender } = req.body;

    if (!age || !income) {
      return res.status(400).json({
        success: false,
        error: 'Age and income are required to check eligibility.',
      });
    }

    const ageNum = parseInt(age);
    const incomeNum = parseInt(income);

    const prompt = `You are an expert on Indian Government Schemes. A citizen has provided their profile. Based on these details, identify ALL government schemes they are eligible for.

User Profile:
- Age: ${ageNum} years
- Annual Income: ₹${incomeNum.toLocaleString('en-IN')} per year
- Occupation: ${occupation || 'Not specified'}
- State: ${state || 'All India'}
- Gender: ${gender || 'Not specified'}

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

Include 6 to 12 relevant schemes. Be precise and specific about matchReasons using the user's actual age, income, occupation, and state.`;

    const aiMessages = [{ role: 'user', content: prompt }];
    const aiResponse = await callAI(aiMessages, 'en');

    // Extract JSON array from the AI response
    let schemes = [];
    try {
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        schemes = JSON.parse(jsonMatch[0]);
      } else {
        schemes = JSON.parse(aiResponse);
      }
    } catch (parseErr) {
      console.error('❌ Failed to parse AI eligibility response:', parseErr.message);
      return res.status(500).json({
        success: false,
        error: 'AI returned an unexpected response. Please try again.',
      });
    }

    // Attach stable generated IDs
    const enriched = schemes.map((s, idx) => ({
      ...s,
      _id: `ai-${idx}-${Date.now()}`,
    }));

    res.status(200).json({
      success: true,
      count: enriched.length,
      profile: { age: ageNum, income: incomeNum, occupation, state, gender },
      data: enriched,
      aiPowered: true,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllSchemes, getSchemeById, findEligibleSchemes };
