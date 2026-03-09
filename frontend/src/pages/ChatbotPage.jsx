import { Bot, Globe } from 'lucide-react';
import Chatbot from '../components/chatbot/Chatbot';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../utils/translations';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी', flag: '🇮🇳' },
];

export default function ChatbotPage() {
  const { language, changeLanguage } = useLanguage();

  return (
    <div className="flex flex-col bg-slate-100" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Page Header */}
      <div className="px-4 sm:px-6 py-6">
        <div className="max-w-5xl mx-auto scheme-shell overflow-hidden">
          <div className="scheme-soft-header px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f5d67a] via-[#d9b14a] to-[#a77c1b] flex items-center justify-center shadow-sm">
              <Bot size={20} className="text-primary-800" />
            </div>
            <div>
              <h1 className="font-bold text-primary-900">SchemeAI Assistant</h1>
              <p className="text-xs text-slate-500">{t('chatSubtitle', language)}</p>
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${language === lang.code
                    ? 'bg-primary-50 shadow-sm text-primary-700'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <span>{lang.flag}</span>
                <span className="hidden sm:inline">{lang.label}</span>
              </button>
            ))}
          </div>
        </div>
        </div>
      </div>

      {/* Chatbot component */}
      <div className="flex-1 overflow-hidden px-4 sm:px-6 pb-6">
        <div className="max-w-5xl mx-auto scheme-shell h-full overflow-hidden">
        <Chatbot />
        </div>
      </div>
    </div>
  );
}
