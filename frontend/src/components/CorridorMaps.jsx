import React from 'react';
import { motion } from 'framer-motion';
import { Map, ArrowRight } from 'lucide-react';

const corridors = [
  {
    from: 'IN 🇮🇳', to: 'US 🇺🇸', treaties: 5, avgSavings: '10–20%',
    highlight: 'Royalty & FTS at 10% WHT',
    tags: ['Royalty', 'Dividends', 'Interest', 'FTS', 'Capital Gains'],
    color: 'from-blue-400 to-indigo-500',
    bg: 'from-blue-50 to-indigo-50',
  },
  {
    from: 'IN 🇮🇳', to: 'SG 🇸🇬', treaties: 5, avgSavings: '10–20%',
    highlight: 'Capital Gains exempt, 10% Royalty',
    tags: ['Royalty', 'FTS', 'Dividends', 'Interest', 'Capital Gains'],
    color: 'from-emerald-400 to-teal-500',
    bg: 'from-emerald-50 to-teal-50',
  },
  {
    from: 'IN 🇮🇳', to: 'UAE 🇦🇪', treaties: 5, avgSavings: '0–20%',
    highlight: '0% WHT on Royalties & Dividends',
    tags: ['Royalty', 'FTS', 'Dividends', 'Interest', 'Capital Gains'],
    color: 'from-amber-400 to-orange-500',
    bg: 'from-amber-50 to-orange-50',
  },
  {
    from: 'IN 🇮🇳', to: 'UK 🇬🇧', treaties: 5, avgSavings: '10–20%',
    highlight: 'Capital Gains exempt, 15% Dividends',
    tags: ['Royalty', 'FTS', 'Dividends', 'Interest', 'Capital Gains'],
    color: 'from-purple-400 to-pink-500',
    bg: 'from-purple-50 to-pink-50',
  },
];

export default function CorridorMaps() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
          <span className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow">
            <Map className="w-5 h-5 text-white" />
          </span>
          Tax Corridor Maps
        </h2>
        <p className="text-gray-500 mt-1">Explore tax-efficient corridors for cross-border structuring</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-6">
        {corridors.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass rounded-3xl p-6 relative overflow-hidden glass-hover`}
          >
            <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl ${c.bg} rounded-full -translate-y-1/2 translate-x-1/2 opacity-60 pointer-events-none`} />
            <div className="relative">
              {/* Corridor header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`bg-gradient-to-r ${c.color} text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-md`}>
                  {c.from} <ArrowRight className="w-3.5 h-3.5" /> {c.to}
                </div>
                <div className="glass-sm px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600">
                  {c.treaties} Treaties
                </div>
              </div>

              {/* Highlight */}
              <div className={`bg-gradient-to-r ${c.bg} border border-white/60 rounded-2xl p-3 mb-4`}>
                <p className="text-sm font-semibold text-gray-800">{c.highlight}</p>
                <p className="text-xs text-gray-500 mt-0.5">Average savings: <span className="font-bold text-emerald-600">{c.avgSavings}</span></p>
              </div>

              {/* Income types */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Covered Income Types</p>
                <div className="flex flex-wrap gap-2">
                  {c.tags.map(t => (
                    <span key={t} className="text-xs bg-white/80 border border-gray-200 text-gray-600 px-2.5 py-1 rounded-lg font-medium">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Info footer */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 glass-sm rounded-2xl p-4 text-center text-sm text-gray-500"
      >
        All corridors are based on official DTAA agreements. Always verify with a qualified tax professional for specific transactions.
      </motion.div>
    </div>
  );
}
