import { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { t } from '../../utils/translations';

const CATEGORY_COLORS = {
  agriculture: 'bg-green-100 text-green-800 border-green-200',
  health: 'bg-red-100 text-red-800 border-red-200',
  housing: 'bg-blue-100 text-blue-800 border-blue-200',
  education: 'bg-purple-100 text-purple-800 border-purple-200',
  financial: 'bg-amber-100 text-amber-800 border-amber-200',
  women: 'bg-pink-100 text-pink-800 border-pink-200',
  pension: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  entrepreneur: 'bg-orange-100 text-orange-800 border-orange-200',
};

const CATEGORY_EMOJI = {
  agriculture: '🌾',
  health: '🏥',
  housing: '🏠',
  education: '📚',
  financial: '💰',
  women: '👩',
  pension: '🧓',
  entrepreneur: '💼',
};

export default function SchemeCard({ scheme }) {
  const { language } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const categoryStyle =
    CATEGORY_COLORS[scheme.category] || 'bg-gray-100 text-gray-800 border-gray-200';
  const emoji = CATEGORY_EMOJI[scheme.category] || '📋';

  return (
    <div className="card hover:border-primary-200 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{emoji}</span>
          <div>
            <h3 className="font-semibold text-gray-900 text-base leading-snug">
              {scheme.name}
            </h3>
            {scheme.shortName && (
              <span className="text-xs text-primary-600 font-medium">
                {scheme.shortName}
              </span>
            )}
          </div>
        </div>
        <span
          className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${categoryStyle}`}
        >
          {scheme.category}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-3">
        {scheme.description}
      </p>

      {/* Match Reasons */}
      {scheme.matchReasons && scheme.matchReasons.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {scheme.matchReasons.map((reason, idx) => (
            <span
              key={idx}
              className="flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full"
            >
              <CheckCircle size={10} />
              {reason}
            </span>
          ))}
        </div>
      )}

      {/* Quick Benefits Preview */}
      {scheme.benefits && scheme.benefits.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Key Benefits
          </p>
          <ul className="space-y-1">
            {scheme.benefits.slice(0, 2).map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-1.5 text-sm text-gray-700">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Expandable Details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-4 animate-fade-in">
          {/* Full Benefits */}
          {scheme.benefits && scheme.benefits.length > 2 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {t('benefits', language)}
              </p>
              <ul className="space-y-1.5">
                {scheme.benefits.map((b, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-sm text-gray-700">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* How to Apply */}
          {scheme.applicationProcess && scheme.applicationProcess.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {t('howToApply', language)}
              </p>
              <ol className="space-y-1.5">
                {scheme.applicationProcess.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="flex-shrink-0 w-5 h-5 bg-primary-100 text-primary-700 rounded-full text-xs flex items-center justify-center font-medium">
                      {idx + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Documents Required */}
          {scheme.documentsRequired && scheme.documentsRequired.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {t('documents', language)}
              </p>
              <div className="flex flex-wrap gap-2">
                {scheme.documentsRequired.map((doc, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full"
                  >
                    📄 {doc}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
            {scheme.ministry && (
              <div>
                <span className="font-medium">{t('ministry', language)}:</span>
                <p className="text-gray-700">{scheme.ministry}</p>
              </div>
            )}
            {scheme.launchYear && (
              <div>
                <span className="font-medium">{t('launchYear', language)}:</span>
                <p className="text-gray-700">{scheme.launchYear}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800 font-medium"
        >
          {expanded ? (
            <>
              <ChevronUp size={14} /> Show Less
            </>
          ) : (
            <>
              <ChevronDown size={14} /> {t('learnMoreAbout', language)}
            </>
          )}
        </button>

        {scheme.officialLink && (
          <a
            href={scheme.officialLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-saffron-500 hover:text-saffron-600 font-medium"
          >
            {t('applyNow', language)}
            <ExternalLink size={13} />
          </a>
        )}
      </div>
    </div>
  );
}
