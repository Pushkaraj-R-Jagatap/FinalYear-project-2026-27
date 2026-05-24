import { useState, useEffect, useRef } from 'react';
import { Send, Trash2, Lightbulb, Mic, MicOff } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { t } from '../../utils/translations';
import { chatbotAPI } from '../../services/api';
import MessageBubble, { TypingIndicator } from './MessageBubble';
import axios from 'axios';

export default function Chatbot() {
  const { language } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const userToken = localStorage.getItem('userToken');

  // Load chat history or welcome message on mount / language change
  useEffect(() => {
    const welcome = {
      role: 'assistant',
      content: t('welcomeMessage', language),
      timestamp: new Date().toISOString(),
    };

    if (userToken) {
      loadChatHistory(welcome);
    } else {
      setMessages([welcome]);
    }
    loadSuggestions();
  }, [language]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const loadChatHistory = async (fallbackWelcome) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api';
      const res = await axios.get(`${API_URL}/chatbot/history`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (res.data.data && res.data.data.length > 0) {
        setMessages(res.data.data);
        setShowSuggestions(false);
      } else {
        setMessages([fallbackWelcome]);
      }
    } catch {
      setMessages([fallbackWelcome]);
    }
  };

  const loadSuggestions = async () => {
    try {
      const res = await chatbotAPI.getSuggestions(language);
      setSuggestions(res.data.data || []);
    } catch {
      setSuggestions([
        'Am I eligible for PM-KISAN scheme?',
        'How to apply for Ayushman Bharat?',
        'Tell me about MUDRA loan',
      ]);
    }
  };

  // Web Speech API: Speech-to-Text
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please try Chrome or Edge.');
      return;
    }

    if (isListening) {
      window.recognitionInstance?.stop();
      setIsListening(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;

    // Set voice capture locale
    if (language === 'hi') rec.lang = 'hi-IN';
    else if (language === 'mr') rec.lang = 'mr-IN';
    else rec.lang = 'en-IN';

    rec.onstart = () => {
      setIsListening(true);
    };

    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
    };

    rec.onerror = () => {
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    window.recognitionInstance = rec;
    rec.start();
  };

  const sendMessage = async (messageText) => {
    const text = (messageText || input).trim();
    if (!text || isLoading) return;

    setInput('');
    setShowSuggestions(false);

    // Stop listening if active
    if (isListening) {
      window.recognitionInstance?.stop();
      setIsListening(false);
    }

    // Add user message
    const userMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const history = updatedMessages
        .filter((m) => m.role !== 'system')
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      // Add Authorization header inline if user is logged in
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || '/api'}/chatbot/message`,
        { message: text, language, conversationHistory: history.slice(0, -1) },
        {
          headers: userToken ? { Authorization: `Bearer ${userToken}` } : {},
        }
      );

      const aiMessage = {
        role: 'assistant',
        content: res.data.data.message,
        timestamp: res.data.data.timestamp,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessages = {
        en: 'Sorry, I encountered an error. Please try again.',
        hi: 'क्षमा करें, एक त्रुटि हुई। कृपया पुनः प्रयास करें।',
        mr: 'माफ करा, एक त्रुटी झाली. कृपया पुन्हा प्रयत्न करा.',
      };
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: errorMessages[language] || errorMessages.en,
          timestamp: new Date().toISOString(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = async () => {
    if (userToken) {
      try {
        const API_URL = import.meta.env.VITE_API_URL || '/api';
        await axios.delete(`${API_URL}/chatbot/history`, {
          headers: { Authorization: `Bearer ${userToken}` },
        });
      } catch (err) {
        console.error('Failed to clear chat history:', err.message);
      }
    }

    const welcome = {
      role: 'assistant',
      content: t('welcomeMessage', language),
      timestamp: new Date().toISOString(),
    };
    setMessages([welcome]);
    setShowSuggestions(true);
    loadSuggestions();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fbff]" style={{ minHeight: 'calc(100vh - 130px)' }}>
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-3xl mx-auto w-full">
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} />
        ))}

        {isLoading && <TypingIndicator />}

        {/* Suggested Questions (shown initially) */}
        {showSuggestions && suggestions.length > 0 && !isLoading && (
          <div className="mt-4 animate-fade-in">
            <p className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-3">
              <Lightbulb size={13} />
              {t('suggestedQuestions', language)}
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(s)}
                  className="text-xs bg-white border border-slate-200 text-primary-700 px-3 py-2
                             rounded-full hover:bg-primary-50 transition-colors shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-3">
            {/* Speech to Text Microphone Button */}
            <button
              onClick={toggleListening}
              className={`flex-shrink-0 p-3 rounded-xl border transition-all ${
                isListening
                  ? 'bg-red-500 text-white border-red-500 animate-pulse'
                  : 'bg-white text-slate-500 hover:text-primary-700 hover:bg-slate-50 border-slate-200'
              }`}
              title={isListening ? 'Stop Listening' : 'Speak Message'}
              disabled={isLoading}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? 'Listening...' : t('chatPlaceholder', language)}
              rows={2}
              className="flex-1 input-field resize-none overflow-hidden py-3 min-h-[60px] max-h-48"
              style={{ height: 'auto' }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 192) + 'px';
              }}
              disabled={isLoading || isListening}
            />

            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="btn-primary flex-shrink-0 flex items-center gap-2 py-3"
            >
              <Send size={16} />
              <span className="hidden sm:inline">{t('send', language)}</span>
            </button>

            <button
              onClick={clearChat}
              className="flex-shrink-0 p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100
                         rounded-lg transition-colors"
              title={t('clearChat', language)}
            >
              <Trash2 size={16} />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Press <kbd className="bg-gray-100 px-1 py-0.5 rounded text-gray-500">Enter</kbd> to send •
            Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}

