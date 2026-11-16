import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ArrowRight, TrendingUp, Shield, Zap, Globe } from 'lucide-react';

const stats = [
  { label: 'Average WHT Saved', value: '50–100%', sub: 'vs domestic rates' },
  { label: 'DTAA Corridors', value: '85+', sub: 'active treaties' },
  { label: 'Singapore HoldCo', value: '0%', sub: 'Capital Gains' },
  { label: 'Compliance', value: 'Instant', sub: 'Audit ready' },
];

const features = [
  { icon: TrendingUp, title: 'DTAA Calculator', desc: 'Calculate exact WHT savings across 85+ bilateral treaties in seconds.' },
  { icon: Globe, title: 'HoldCo Simulator', desc: 'Model Singapore, UAE & UK holding structures for optimal tax efficiency.' },
  { icon: Shield, title: 'Treaty Registry', desc: 'Live database of all treaty rates, articles and legal provisions.' },
  { icon: Zap, title: 'Corridor Maps', desc: 'Visual mapping of tax-efficient corridors for cross-border structuring.' },
];

export default function HeroSection({ onGetStarted }) {
  const statsRef = useRef([]);

  useEffect(() => {
    gsap.fromTo(
      statsRef.current.filter(Boolean),
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, stagger: 0.12, duration: 0.7, ease: 'power3.out', delay: 0.4 }
    );
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="glass rounded-3xl p-8 sm:p-12 mb-8 relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-100/60 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-teal-100/40 to-transparent rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Double Tax Avoidance Agreement Engine
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-4 max-w-3xl">
            Slash Cross-Border{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">
              Withholding Tax
            </span>{' '}
            & Structure Global Entities
          </h1>

          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mb-8 leading-relaxed">
            Calculate legal tax exemptions across India–US, Singapore, UAE & UK bilateral treaties.
            Avoid 20–30% double tax leakage on SaaS IP, royalties, dividends and cross-border billing.
          </p>

          <div className="flex flex-wrap gap-3">
            <button onClick={() => onGetStarted('calculator')} className="btn-primary flex items-center gap-2 text-sm sm:text-base">
              Calculate My Savings <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => onGetStarted('treaties')} className="btn-secondary flex items-center gap-2 text-sm sm:text-base">
              View Treaty Registry
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div
            key={s.label}
            ref={el => (statsRef.current[i] = el)}
            className="glass rounded-2xl p-4 sm:p-6 text-center opacity-0"
          >
            <div className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 mb-1">
              {s.value}
            </div>
            <div className="text-xs sm:text-sm font-semibold text-gray-700">{s.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Feature Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map(({ icon: Icon, title, desc }, i) => (
          <motion.button
            key={title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
            onClick={() => onGetStarted(['calculator', 'simulator', 'treaties', 'corridors'][i])}
            className="glass glass-hover rounded-2xl p-5 text-left group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
              <Icon className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 text-sm">{title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
