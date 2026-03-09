import { Link } from 'react-router-dom';
import { Bot, Github, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary-700 flex items-center justify-center">
                <span className="text-white font-bold">G</span>
              </div>
              <span className="text-white text-lg font-bold">
                Gov<span className="text-orange-400">AI</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              AI-powered platform helping Indian citizens discover government schemes,
              check eligibility, and detect fraud.
            </p>
            <p className="text-xs mt-3 text-gray-600">
              🏆 Built for GovTech Hackathon 2026
            </p>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Features</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/chatbot" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Bot size={13} /> Multilingual AI Chatbot
                </Link>
              </li>
              <li>
                <Link to="/eligibility" className="hover:text-white transition-colors">
                  📋 Eligibility Finder
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors">
                  🔍 Fraud Detection System
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors">
                  📊 Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Government Resources</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'india.gov.in', url: 'https://www.india.gov.in' },
                { label: 'myscheme.gov.in', url: 'https://www.myscheme.gov.in' },
                { label: 'pmkisan.gov.in', url: 'https://pmkisan.gov.in' },
                { label: 'pmjay.gov.in', url: 'https://pmjay.gov.in' },
              ].map(({ label, url }) => (
                <li key={label}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors flex items-center gap-1"
                  >
                    {label}
                    <ExternalLink size={11} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs">
            © 2026 GovAI. Built with ❤️ for Indian Citizens. For demonstration purposes only.
          </p>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-600">Supported Languages:</span>
            <span className="bg-gray-800 px-2 py-0.5 rounded text-gray-300">🇬🇧 English</span>
            <span className="bg-gray-800 px-2 py-0.5 rounded text-gray-300">🇮🇳 हिंदी</span>
            <span className="bg-gray-800 px-2 py-0.5 rounded text-gray-300">🇮🇳 मराठी</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
