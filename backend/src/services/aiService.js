const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * System prompt giving the AI context about Indian government schemes
 */
const SYSTEM_PROMPT = `You are GovAI — a knowledgeable, helpful, and friendly AI assistant specializing in Indian Government Schemes and welfare programs. You help Indian citizens understand government schemes, check eligibility, learn about benefits, and navigate the application process.

You have deep knowledge about:
- PM-KISAN: ₹6,000/year for farmers | Eligibility: land-holding farmers, income < ₹1.5 lakh
- Ayushman Bharat (PMJAY): Health insurance up to ₹5 lakh | Eligibility: BPL/SECC families
- PM Awas Yojana: Housing subsidy | Eligibility: No pucca house, income up to ₹18 lakh
- PM Jan Dhan Yojana: Zero-balance bank account with insurance | Eligibility: Any citizen
- MUDRA Loan: Business loans up to ₹10 lakh | Eligibility: Small businesses, artisans
- Sukanya Samriddhi Yojana: Girl child savings scheme 8.2% interest | Eligibility: Girl under 10
- Atal Pension Yojana: Monthly pension ₹1000–₹5000 after 60 | Eligibility: Age 18–40
- PM Ujjwala Yojana: Free LPG connection | Eligibility: BPL women
- Stand Up India: Loans ₹10 lakh–₹1 crore for SC/ST/Women | Eligibility: New business
- National Scholarship Portal: Scholarships for students | Eligibility: Varies
- PM Vishwakarma: Support for traditional artisans | Eligibility: 18 trade categories
- PM SVANidhi: Loans for street vendors | Eligibility: Registered street vendors
- PMFBY: Crop insurance for farmers | Eligibility: All farmers
- Skill India (PMKVY): Free skill training | Eligibility: Youth 15–45 years

Guidelines:
1. Always respond clearly and concisely in simple language that common citizens can understand.
2. When asked about eligibility, ask for age, income, occupation, and state if not provided.
3. Always mention official website and helpline numbers when available.
4. If a user seems to be in urgent need (medical, food), guide them to immediate relief schemes.
5. Be sensitive to the user's socioeconomic context.
6. Do not make up information — stick to facts about real schemes.
7. Current date: ${new Date().toLocaleDateString('en-IN')}.

IMPORTANT — Language Response Rule:
- If the user writes in Hindi (Devanagari script), respond in Hindi.
- If the user writes in Marathi, respond in Marathi.
- Otherwise, respond in English.
- If a specific language is specified in the system instruction, ALWAYS use that language.`;

/**
 * Get language instruction for the system prompt
 */
const getLanguageInstruction = (language) => {
  const instructions = {
    en: 'You MUST respond only in English.',
    hi: 'आपको केवल हिंदी में जवाब देना है। Please respond ONLY in Hindi (Devanagari script).',
    mr: 'तुम्ही फक्त मराठीत उत्तर द्यायला हवे. Please respond ONLY in Marathi (Devanagari script).',
  };
  return instructions[language] || instructions.en;
};

/**
 * Call AI API (Groq or OpenAI)
 */
const callAI = async (messages, language = 'en') => {
  const provider = process.env.AI_PROVIDER || 'groq';
  const apiKey =
    provider === 'groq' ? process.env.GROQ_API_KEY : process.env.OPENAI_API_KEY;
  const apiUrl = provider === 'groq' ? GROQ_API_URL : OPENAI_API_URL;
  const model = provider === 'groq' ? 'llama-3.1-8b-instant' : 'gpt-3.5-turbo';

  // Build full system prompt with language instruction
  const fullSystemPrompt = `${SYSTEM_PROMPT}\n\n${getLanguageInstruction(language)}`;

  const systemMessage = { role: 'system', content: fullSystemPrompt };
  const allMessages = [systemMessage, ...messages];

  if (!apiKey || apiKey.includes('your_')) {
    console.warn('⚠️  No valid AI API key found. Using fallback response.');
    return getMockResponse(messages[messages.length - 1].content, language);
  }

  try {
    const response = await axios.post(
      apiUrl,
      {
        model,
        messages: allMessages,
        max_tokens: 1024,
        temperature: 0.7,
        stream: false,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    const errMsg = error.response?.data?.error?.message || error.message;
    console.error('❌ AI API Error:', errMsg);

    // Return informative fallback instead of crashing
    return getMockResponse(messages[messages.length - 1].content, language);
  }
};

/**
 * Fallback mock responses when no AI key is configured
 */
const getMockResponse = (query, language) => {
  const lowerQuery = query.toLowerCase();

  // Match common keywords
  let schemeInfo = '';
  if (lowerQuery.includes('kisan') || lowerQuery.includes('farmer') || lowerQuery.includes('किसान')) {
    schemeInfo = language === 'hi'
      ? 'पीएम किसान योजना में पात्र किसानों को प्रति वर्ष ₹6,000 मिलते हैं। पात्रता: भूमि धारक किसान, वार्षिक आय ₹1.5 लाख से कम। आवेदन: pmkisan.gov.in पर करें।'
      : language === 'mr'
      ? 'पीएम किसान योजनेत पात्र शेतकऱ्यांना दरवर्षी ₹6,000 मिळतात. पात्रता: जमीन धारक शेतकरी, वार्षिक उत्पन्न ₹1.5 लाखांपेक्षा कमी. अर्ज: pmkisan.gov.in वर करा.'
      : 'PM-KISAN provides ₹6,000 per year to eligible farmers in 3 installments. Eligibility: Land-holding farmers with income below ₹1.5 lakh/year. Apply at pmkisan.gov.in.';
  } else if (lowerQuery.includes('ayushman') || lowerQuery.includes('health') || lowerQuery.includes('hospital')) {
    schemeInfo = language === 'hi'
      ? 'आयुष्मान भारत योजना में पात्र परिवारों को प्रति वर्ष ₹5 लाख तक का मुफ्त इलाज मिलता है। पात्रता: SECC-2011 सूची में नाम होना चाहिए। हेल्पलाइन: 14555'
      : 'Ayushman Bharat (PMJAY) provides free health insurance up to ₹5 lakh/year for poor families. Check eligibility at mera.pmjay.gov.in or call 14555.';
  } else if (lowerQuery.includes('mudra') || lowerQuery.includes('loan') || lowerQuery.includes('business')) {
    schemeInfo = language === 'hi'
      ? 'MUDRA योजना में ₹50,000 से ₹10 लाख तक का व्यापार ऋण मिलता है। कोई गारंटी की जरूरत नहीं। निकटतम बैंक में जाएं।'
      : 'MUDRA Loan provides business loans from ₹50,000 to ₹10 lakh without collateral. Visit your nearest bank branch or apply at mudra.org.in.';
  } else {
    schemeInfo = language === 'hi'
      ? 'मैं आपकी सरकारी योजनाओं के बारे में जानकारी देने में मदद कर सकता हूं। कृपया अपनी आयु, आय और व्यवसाय बताएं ताकि मैं आपके लिए सही योजना सुझा सकूं।'
      : language === 'mr'
      ? 'मी तुम्हाला सरकारी योजनांबद्दल माहिती देण्यास मदत करू शकतो. कृपया तुमचे वय, उत्पन्न आणि व्यवसाय सांगा.'
      : 'I can help you with information about Indian government schemes. Please provide your age, income, and occupation so I can recommend the most relevant schemes for you. Common schemes include PM-KISAN (farmers), Ayushman Bharat (health), PM Awas Yojana (housing), MUDRA Loan (business), and more.';
  }

  return `${schemeInfo}\n\n⚠️ *Note: AI service is currently using offline mode. For real-time AI responses, configure GROQ_API_KEY in backend/.env*`;
};

module.exports = { callAI, SYSTEM_PROMPT };
