import { Shield } from 'lucide-react';
import EligibilityFinder from '../components/eligibility/EligibilityFinder';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../utils/translations';

export default function EligibilityPage() {
  const { language } = useLanguage();

  return (
    <div className="bg-slate-100 min-h-screen px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="max-w-6xl mx-auto scheme-shell gradient-hero text-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
              <Shield size={24} className="text-primary-700" />
            </div>
          </div>
          <h1 className="scheme-section-title mb-2">{t('eligibilityTitle', language)}</h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            {t('eligibilitySubtitle', language)}
          </p>

          {/* Hint badges */}
          <div className="flex flex-wrap gap-2 justify-center mt-5">
            {['PM-KISAN', 'Ayushman Bharat', 'MUDRA Loan', 'PM Awas Yojana', 'APY Pension', '+10 more'].map((s) => (
              <span key={s} className="scheme-chip">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Eligibility Finder */}
      <div className="max-w-6xl mx-auto mt-6">
        <EligibilityFinder />
      </div>
    </div>
  );
}
