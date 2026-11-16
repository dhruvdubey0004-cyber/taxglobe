import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Calculator, Layers, BookOpen, Map, LogOut, User, Menu, X, Wifi, WifiOff } from 'lucide-react';

const tabs = [
  { id: 'calculator', label: 'DTAA Calculator', icon: Calculator },
  { id: 'simulator', label: 'HoldCo Simulator', icon: Layers },
  { id: 'treaties', label: 'Treaty Rules', icon: BookOpen },
  { id: 'corridors', label: 'Corridor Maps', icon: Map },
];

export default function Navbar({ activeTab, setActiveTab, user, apiStatus, onAuthClick, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 glass border-b border-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 text-lg leading-none">TaxGlobe</span>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">DTAA</span>
              </div>
              <p className="text-xs text-gray-500 leading-none mt-0.5">Cross-Border Tax Platform</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`tab-btn ${activeTab === id ? 'active' : 'inactive'}`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2 shrink-0">
            {/* API Status */}
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
              apiStatus === 'connected'
                ? 'bg-emerald-100 text-emerald-700'
                : apiStatus === 'fallback'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {apiStatus === 'connected' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {apiStatus === 'connected' ? 'Live' : apiStatus === 'fallback' ? 'Demo' : '...'}
            </div>

            {/* Auth */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 glass-sm px-3 py-1.5 rounded-xl">
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.name?.split(' ')[0]}</span>
                </div>
                <button onClick={onLogout} className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Logout">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button onClick={onAuthClick} className="btn-primary text-sm py-2 px-4">
                Sign In
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="lg:hidden p-2 rounded-xl hover:bg-white/60 transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-white/60 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => { setActiveTab(id); setMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === id ? 'bg-emerald-500 text-white' : 'text-gray-700 hover:bg-white/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
