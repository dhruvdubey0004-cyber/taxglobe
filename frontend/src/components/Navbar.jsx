import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Calculator, Layers, BookOpen, Map, LogOut,
  User, Menu, X, Wifi, WifiOff, Users, Sparkles, ChevronDown
} from 'lucide-react';

const tabs = [
  { id: 'calculator', label: 'Calculator', icon: Calculator },
  { id: 'simulator', label: 'HoldCo Simulator', icon: Layers },
  { id: 'treaties', label: 'Treaty Rules', icon: BookOpen },
  { id: 'corridors', label: 'Corridors', icon: Map },
  { id: 'leads', label: 'Leads', icon: Users },
];

export default function Navbar({
  activeTab,
  setActiveTab,
  user,
  apiStatus,
  onAuthClick,
  onLogout,
  onOpenOnboarding
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-gray-200/60 shadow-[0_2px_15px_-4px_rgba(0,0,0,0.05)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">

          {/* 1. Left: Brand Logo */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 shrink-0 text-left group transition-transform active:scale-95"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:shadow-emerald-500/30 transition-shadow">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-gray-900 text-lg tracking-tight leading-none">
                  TaxGlobe
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-1.5 py-0.5 rounded-md">
                  DTAA
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium leading-none mt-1">
                Cross-Border Optimization
              </p>
            </div>
          </button>

          {/* 2. Center: Segmented Floating Navigation Control */}
          <nav className="hidden xl:flex items-center bg-gray-100/80 p-1 rounded-full border border-gray-200/60 shadow-inner">
            {tabs.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'text-gray-900'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className="absolute inset-0 bg-white rounded-full shadow-sm border border-gray-200/50"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                    {label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* 3. Right: Status, Actions & Auth Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">

            {/* API Status Badge */}
            <div
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                apiStatus === 'connected'
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-700'
                  : apiStatus === 'fallback'
                  ? 'bg-amber-50/80 border-amber-200 text-amber-700'
                  : 'bg-gray-50 border-gray-200 text-gray-500'
              }`}
              title={apiStatus === 'connected' ? 'Connected to live MongoDB backend' : 'Running in fallback/demo mode'}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${
                apiStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`} />
              {apiStatus === 'connected' ? 'Live' : 'Demo'}
            </div>

            {/* Start Onboarding Button */}
            <button
              onClick={onOpenOnboarding}
              className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-500 text-emerald-800 hover:text-white border border-emerald-200 hover:border-emerald-500 text-xs font-bold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full shadow-xs hover:shadow-md transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Quick</span> Setup
            </button>

            {/* User Profile or Sign In */}
            {user ? (
              <div className="flex items-center gap-1.5 pl-1 border-l border-gray-200/60">
                <div className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200/80 px-2.5 py-1 rounded-full transition-colors">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold text-gray-800 max-w-[90px] truncate">
                    {user.name?.split(' ')[0]}
                  </span>
                </div>

                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="btn-primary text-xs font-bold py-1.5 px-3.5 sm:py-2 sm:px-4 rounded-full"
              >
                Sign In
              </button>
            )}

            {/* Mobile / Tablet Menu Toggle */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="xl:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-700 transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile & Tablet Dropdown Navigation */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl overflow-hidden shadow-xl"
          >
            <div className="px-4 py-3 space-y-1.5">
              {tabs.map(({ id, label, icon: Icon }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => { setActiveTab(id); setMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                      {label}
                    </div>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    )}
                  </button>
                );
              })}

              <div className="pt-2 border-t border-gray-100">
                <button
                  onClick={() => { onOpenOnboarding(); setMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm"
                >
                  <Sparkles className="w-4 h-4" /> Start Onboarding Setup
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
