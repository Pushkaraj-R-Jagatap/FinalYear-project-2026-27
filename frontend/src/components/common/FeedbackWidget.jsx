import { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, Send, CheckCircle } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import axios from 'axios';

/**
 * FeedbackWidget — Reusable feedback component for scheme cards, chatbot messages, fraud results
 * Props:
 *   targetType: 'chatbot' | 'scheme' | 'fraud'
 *   targetId: string
 *   label?: string
 *   compact?: boolean (thumbs only if true)
 */
export default function FeedbackWidget({ targetType, targetId, label = 'Was this helpful?', compact = false }) {
  const { addToast } = useNotifications();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [helpful, setHelpful] = useState(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || '/api';

  const handleSubmit = async (overrideHelpful) => {
    const effectiveHelpful = typeof overrideHelpful === 'boolean' ? overrideHelpful : helpful;
    if (compact && effectiveHelpful === null) return;
    if (!compact && rating === 0) {
      setError('Please select a rating.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/feedback`, {
        targetType,
        targetId,
        rating: compact ? (effectiveHelpful ? 5 : 1) : rating,
        comment: comment.trim(),
        helpful: effectiveHelpful,
      });
      setSubmitted(true);
      addToast('Feedback Submitted', 'Thank you for helping us improve!', 'success');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-green-600">
        <CheckCircle size={14} />
        <span className="font-medium">Feedback recorded — thank you!</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3">
        <span className="text-xs text-slate-500">{label}</span>
        <button
          onClick={() => { setHelpful(true); handleSubmit(true); }}
          className={`p-1.5 rounded-lg transition-colors ${
            helpful === true ? 'bg-green-100 text-green-600' : 'text-slate-400 hover:text-green-500 hover:bg-green-50'
          }`}
          title="Yes, helpful"
        >
          <ThumbsUp size={13} />
        </button>
        <button
          onClick={() => { setHelpful(false); handleSubmit(false); }}
          className={`p-1.5 rounded-lg transition-colors ${
            helpful === false ? 'bg-red-100 text-red-500' : 'text-slate-400 hover:text-red-400 hover:bg-red-50'
          }`}
          title="Not helpful"
        >
          <ThumbsDown size={13} />
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-slate-100">
      <p className="text-xs font-semibold text-slate-500 mb-2">{label}</p>

      {/* Star Rating */}
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              size={18}
              className={star <= (hovered || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="text-xs text-slate-500 ml-2">
            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
          </span>
        )}
      </div>

      {/* Helpful toggle */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setHelpful(helpful === true ? null : true)}
          className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-colors ${
            helpful === true
              ? 'bg-green-100 border-green-300 text-green-700'
              : 'border-slate-200 text-slate-500 hover:border-green-300 hover:text-green-600'
          }`}
        >
          <ThumbsUp size={11} /> Helpful
        </button>
        <button
          onClick={() => setHelpful(helpful === false ? null : false)}
          className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-colors ${
            helpful === false
              ? 'bg-red-100 border-red-300 text-red-600'
              : 'border-slate-200 text-slate-500 hover:border-red-300 hover:text-red-500'
          }`}
        >
          <ThumbsDown size={11} /> Not helpful
        </button>
      </div>

      {/* Comment (shown after rating selected) */}
      {rating > 0 && (
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, 200))}
          placeholder="Optional: Tell us more (max 200 chars)..."
          rows={2}
          className="input-field text-xs mb-2 resize-none"
        />
      )}

      {error && <p className="text-xs text-red-500 mb-2">⚠️ {error}</p>}

      <button
        onClick={() => handleSubmit()}
        disabled={loading || (rating === 0)}
        className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? <span className="animate-spin">⏳</span> : <Send size={11} />}
        {loading ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </div>
  );
}
