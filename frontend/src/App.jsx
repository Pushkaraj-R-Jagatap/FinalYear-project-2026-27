import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import ChatbotPage from './pages/ChatbotPage';
import EligibilityPage from './pages/EligibilityPage';
import AdminPage from './pages/AdminPage';
import LoginRegisterPage from './pages/LoginRegisterPage';
import ProfilePage from './pages/ProfilePage';
import FraudDetectionPage from './pages/FraudDetectionPage';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <div className="min-h-screen flex flex-col relative selection:bg-primary-100 selection:text-primary-900">
              <Navbar />
              <main className="flex-1 relative z-10 pt-24 pb-12">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/chatbot" element={<ChatbotPage />} />
                  <Route path="/eligibility" element={<EligibilityPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/login" element={<LoginRegisterPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/fraud" element={<FraudDetectionPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;

