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

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: 'easeIn' } },
};

export default function App() {
  // Read tab from URL hash on load, default to 'calculator'
  const getTabFromHash = () => {
    const hash = window.location.hash.replace('#', '');
    const valid = ['home', 'calculator', 'simulator', 'treaties', 'corridors'];
    return valid.includes(hash) ? hash : 'calculator';
  };

  const [activeTab, setActiveTab] = useState(getTabFromHash);
  const [apiStatus, setApiStatus] = useState('checking');
  const [authOpen, setAuthOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('taxglobe_user') || 'null'); } catch { return null; }
  });

  // Sync hash with active tab
  function changeTab(tab) {
    setActiveTab(tab);
    window.location.hash = tab;
  }

  // On browser back/forward button
  useEffect(() => {
    const onHashChange = () => setActiveTab(getTabFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const showToast = (message, type = 'success') => setToast({ message, type });

  function logout() {
    localStorage.removeItem('taxglobe_token');
    localStorage.removeItem('taxglobe_user');
    setUser(null);
    showToast('Logged out successfully', 'info');
  }

  const sharedProps = { showToast, setApiStatus };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={changeTab}
        user={user}
        apiStatus={apiStatus}
        onAuthClick={() => setAuthOpen(true)}
        onLogout={logout}
      />

      <main className="pb-12 flex-1">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div key="home" {...pageVariants}>
              <HeroSection onGetStarted={changeTab} />
            </motion.div>
          )}
          {activeTab === 'calculator' && (
            <motion.div key="calculator" {...pageVariants}>
              <Calculator {...sharedProps} />
            </motion.div>
          )}
          {activeTab === 'simulator' && (
            <motion.div key="simulator" {...pageVariants}>
              <Simulator {...sharedProps} />
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
        </AnimatePresence>
      </main>

      {/* Global Disclaimer Footer */}
      <footer className="glass border-t border-white/80 mt-auto py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 text-sm">TaxGlobe</span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-500">Cross-Border Tax & Structure Optimization</span>
          </div>

          <div className="inline-flex items-center gap-2 bg-amber-50/90 border border-amber-200/80 rounded-full px-4 py-1.5 text-xs text-amber-800 font-medium shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            For Educational / Demo Purpose Only - Not Legal Tax Advice
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
            onLogin={setUser}
            showToast={showToast}
          />
        )}
      </AnimatePresence>

      <Toast toast={toast} onClose={() => setToast(null)} />
      <TaxBot onNavigateTab={changeTab} />
    </div>
  );
}
