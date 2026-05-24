import { useEffect, useRef, useState } from 'react';
import { Bot, User, Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Renders a single chat message bubble
 * Supports AI markdown-like formatting (bold, bullet lists)
 */
export default function MessageBubble({ message }) {
  const { role, content, timestamp } = message;
  const { language } = useLanguage();
  const isUser = role === 'user';
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Stop speaking when component unmounts
  useEffect(() => {
    return () => {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSpeaking]);

  // Handle Text to Speech synthesis
  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel(); // cancel any ongoing speech
      const textToSpeak = content.replace(/\*\*|•|\*|-/g, ''); // strip formatting
      const utterance = new SpeechSynthesisUtterance(textToSpeak);

      // Match voices/language codes
      if (language === 'hi') utterance.lang = 'hi-IN';
      else if (language === 'mr') utterance.lang = 'mr-IN';
      else utterance.lang = 'en-IN';

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Simple markdown-like rendering for AI responses
  const formatContent = (text) => {
    if (!text) return '';

    // Handle **bold** text
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Handle bullet points (lines starting with •, *, or -)
    formatted = formatted.replace(
      /^[•\-\*]\s(.+)$/gm,
      '<li class="ml-4">$1</li>'
    );

    // Wrap <li> sequences in <ul>
    formatted = formatted.replace(
      /(<li[^>]*>.*?<\/li>\n?)+/gs,
      (match) => `<ul class="list-disc list-inside space-y-1 my-1">${match}</ul>`
    );

    // Convert line breaks to <br> outside of lists
    formatted = formatted.replace(/\n(?![<])/g, '<br/>');

    return formatted;
  };

  const timeStr = timestamp
    ? new Date(timestamp).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div
      className={`flex items-start gap-3 animate-fade-in ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm
          ${isUser
            ? 'bg-primary-700 text-white'
            : 'bg-[#eef4fb] border border-slate-200 text-primary-700'
          }`}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className="relative group/bubble">
          <div
            className={isUser ? 'chat-bubble-user' : 'chat-bubble-ai ai-response pr-8'}
            dangerouslySetInnerHTML={{
              __html: formatContent(content),
            }}
          />
          
          {/* TTS Speaker Toggle Button for AI responses */}
          {!isUser && content && (
            <button
              onClick={handleSpeak}
              className="absolute right-2 bottom-2 text-slate-400 hover:text-primary-700 transition-colors p-1 rounded-lg hover:bg-slate-100"
              title={isSpeaking ? 'Stop Reading' : 'Read Aloud'}
            >
              {isSpeaking ? <VolumeX size={14} className="text-red-500" /> : <Volume2 size={14} />}
            </button>
          )}
        </div>
        {timeStr && (
          <span className="text-xs text-slate-400 px-1">{timeStr}</span>
        )}
      </div>
    </div>
  );
}


/**
 * Animated typing indicator (three bouncing dots)
 */
export function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 animate-fade-in">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#eef4fb] border border-slate-200 flex items-center justify-center">
        <Bot size={16} className="text-primary-700" />
      </div>
      <div className="chat-bubble-ai flex items-center gap-1 px-4 py-3">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}
