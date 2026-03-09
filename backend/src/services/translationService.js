const axios = require('axios');

/**
 * Translation service using LLM
 * Falls back to simple offline dictionaries for common UI strings
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Translate text using the configured LLM
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - 'hi' (Hindi) or 'mr' (Marathi)
 * @returns {Promise<string>} Translated text
 */
const translateText = async (text, targetLanguage) => {
  if (targetLanguage === 'en') return text;

  const langName = targetLanguage === 'hi' ? 'Hindi' : 'Marathi';
  const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
  const apiUrl = process.env.AI_PROVIDER === 'openai'
    ? 'https://api.openai.com/v1/chat/completions'
    : GROQ_API_URL;
  const model = process.env.AI_PROVIDER === 'openai' ? 'gpt-3.5-turbo' : 'llama3-8b-8192';

  if (!apiKey || apiKey.includes('your_')) {
    return getOfflineTranslation(text, targetLanguage);
  }

  try {
    const response = await axios.post(
      apiUrl,
      {
        model,
        messages: [
          {
            role: 'system',
            content: `You are a professional translator specializing in Indian government documents. 
Translate the following text to ${langName}. 
- Preserve all numbers, names, and technical terms
- Keep formatting (line breaks, bullet points) intact
- Make the translation natural and easy to understand for common citizens
- Do NOT add any explanation, just provide the translation`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        max_tokens: 1024,
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Translation error:', error.message);
    return getOfflineTranslation(text, targetLanguage);
  }
};

/**
 * Simple offline fallback translations for common phrases
 */
const offlineTranslations = {
  hi: {
    'Error processing your request': 'आपके अनुरोध को संसाधित करने में त्रुटि',
    'Please try again': 'कृपया पुनः प्रयास करें',
    'Not found': 'नहीं मिला',
    'Success': 'सफलता',
    'Loading': 'लोड हो रहा है',
    'Submit': 'जमा करें',
    'Cancel': 'रद्द करें',
    'Search': 'खोजें',
    'Yes': 'हाँ',
    'No': 'नहीं',
  },
  mr: {
    'Error processing your request': 'तुमची विनंती प्रक्रिया करताना त्रुटी',
    'Please try again': 'कृपया पुन्हा प्रयत्न करा',
    'Not found': 'सापडले नाही',
    'Success': 'यश',
    'Loading': 'लोड होत आहे',
    'Submit': 'सबमिट करा',
    'Cancel': 'रद्द करा',
    'Search': 'शोधा',
    'Yes': 'होय',
    'No': 'नाही',
  },
};

const getOfflineTranslation = (text, language) => {
  // Try exact match
  const dict = offlineTranslations[language] || {};
  if (dict[text]) return dict[text];

  // Return original text (AI not available)
  return text;
};

module.exports = { translateText };
