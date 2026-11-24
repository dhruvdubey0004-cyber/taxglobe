import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import Calculator from './components/Calculator';
import Simulator from './components/Simulator';
import TreatyRules from './components/TreatyRules';
import CorridorMaps from './components/CorridorMaps';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';
import TaxBot from './components/TaxBot';
import OnboardingModal from './components/OnboardingModal';
import OnboardingPage from './components/OnboardingPage';
import OnboardingLeads from './components/OnboardingLeads';
import AdminPanel from './components/AdminPanel';
import { apiFetch } from './utils';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: 'easeIn' } },
};

export default function App() {
  // Read tab from URL hash on load, default to 'onboarding'
  const getTabFromHash = () => {
    const hash = window.location.hash.replace('#', '');
    const valid = ['onboarding', 'home', 'calculator', 'simulator', 'treaties', 'corridors', 'admin'];
    return valid.includes(hash) ? hash : 'onboarding';
  };

  const [activeTab, setActiveTab] = useState(getTabFromHash);
  const [apiStatus, setApiStatus] = useState('checking');
  const [authOpen, setAuthOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('taxglobe_user') || 'null'); } catch { return null; }
  });

  // Sync hash with active tab
  function changeTab(tab) {
    setActiveTab(tab);
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // Scroll restoration & scroll to top on mount
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  // On browser back/forward button
  useEffect(() => {
    const onHashChange = () => setActiveTab(getTabFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Auto-sync fresh role from database on load
  useEffect(() => {
    const token = localStorage.getItem('taxglobe_token');
    if (!token) return;
    apiFetch('/api/auth/me')
      .then(res => {
        if (res?.user) {
          localStorage.setItem('taxglobe_user', JSON.stringify(res.user));
          if (res.token) localStorage.setItem('taxglobe_token', res.token);
          setUser(res.user);
        }
      })
      .catch(() => {});
  }, []);

  const showToast = (message, type = 'success') => setToast({ message, type });

  function logout() {
    localStorage.removeItem('taxglobe_token');
    localStorage.removeItem('taxglobe_user');
    localStorage.removeItem('taxglobe_onboarded');
    localStorage.removeItem('taxglobe_onboarded_profile');
    sessionStorage.clear();
    setUser(null);
    if (activeTab === 'leads') {
      changeTab('home');
    }
    showToast('Logged out successfully', 'info');
  }

  function handleLogin(newUser) {
    sessionStorage.clear();
    localStorage.removeItem('taxglobe_onboarded');
    localStorage.removeItem('taxglobe_onboarded_profile');
    setUser(newUser);
  }

  const sharedProps = { showToast, setApiStatus };

  const userKey = user?._id || user?.id || 'guest';

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden w-full">
      <Navbar
        activeTab={activeTab}
        setActiveTab={changeTab}
        user={user}
        apiStatus={apiStatus}
        onAuthClick={() => setAuthOpen(true)}
        onLogout={logout}
        onOpenOnboarding={() => setOnboardingOpen(true)}
      />

      <main className="pb-12 flex-1">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div key="home" {...pageVariants}>
              <HeroSection onGetStarted={changeTab} onOpenOnboarding={() => changeTab('onboarding')} />
            </motion.div>
          )}
          {activeTab === 'onboarding' && (
            <motion.div key={`onboarding-${userKey}`} {...pageVariants}>
              <OnboardingPage
                onNavigateTab={changeTab}
                showToast={showToast}
                user={user}
              />
            </motion.div>
          )}
          {activeTab === 'calculator' && (
            <motion.div key={`calculator-${userKey}`} {...pageVariants}>
              <Calculator key={`calc-${userKey}`} {...sharedProps} user={user} />
            </motion.div>
          )}
          {activeTab === 'simulator' && (
            <motion.div key={`simulator-${userKey}`} {...pageVariants}>
              <Simulator key={`sim-${userKey}`} {...sharedProps} user={user} />
            </motion.div>
          )}
          {activeTab === 'treaties' && (
            <motion.div key="treaties" {...pageVariants}>
              <TreatyRules {...sharedProps} />
            </motion.div>
          )}
          {activeTab === 'corridors' && (
            <motion.div key="corridors" {...pageVariants}>
              <CorridorMaps />
            </motion.div>
          )}
          {activeTab === 'admin' && (
            <motion.div key={`admin-${userKey}`} {...pageVariants}>
              <AdminPanel
                key={`admin-comp-${userKey}`}
                user={user}
                onOpenAuth={() => setAuthOpen(true)}
                showToast={showToast}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global Disclaimer Footer */}
      <footer className="glass border-t border-white/80 mt-auto py-6 px-3 sm:px-4 max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
            <span className="font-bold text-gray-900 text-sm">TaxGlobe</span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-500">Cross-Border Tax & Structure Optimization</span>
          </div>

          <div className="inline-flex items-center gap-2 bg-amber-50/90 border border-amber-200/80 rounded-2xl sm:rounded-full px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs text-amber-800 font-medium shadow-xs text-center max-w-full leading-tight">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span>For Educational / Demo Purpose Only - Not Legal Tax Advice</span>
          </div>

          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} TaxGlobe. All rights reserved.
          </p>
        </div>
      </footer>

      <AnimatePresence>
        {authOpen && (
          <AuthModal
            onClose={() => setAuthOpen(false)}
            onLogin={handleLogin}
            showToast={showToast}
          />
        )}
      </AnimatePresence>

      <OnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        onComplete={(tab) => {
          setOnboardingOpen(false);
          if (tab) changeTab(tab);
        }}
        showToast={showToast}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
      <TaxBot key={`taxbot-${userKey}`} onNavigateTab={changeTab} />
    </div>
  );
}
