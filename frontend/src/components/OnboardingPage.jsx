import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Check, ArrowRight, ArrowLeft, Building2,
  Laptop, Briefcase, Globe, TrendingUp, ShieldCheck, CheckCircle2,
  Mail, Phone, KeyRound, Loader2, RefreshCw, Award, Shield,
  Zap, HelpCircle, FileCheck, ArrowDown, Users, AlertCircle,
  FileText, ExternalLink, ChevronRight, Lock
} from 'lucide-react';
import { apiFetch } from '../utils';

const BUSINESS_TYPES = [
  { id: 'SaaS', label: 'SaaS & Digital IP', icon: Laptop, desc: 'Software subscriptions, APIs, Cloud & IP licensing' },
  { id: 'Agency', label: 'Agency & IT Services', icon: Building2, desc: 'Custom software, design, DevOps & tech consulting' },
  { id: 'Freelancer', label: 'Freelancer / Contractor', icon: Briefcase, desc: 'Direct international client billing & remote contracts' },
  { id: 'Export', label: 'Export & B2B Services', icon: Globe, desc: 'Cross-border trading, logistics & corporate services' },
];

const BILLING_RANGES = [
  { id: '< ₹5 Lakhs', label: '< ₹5 Lakhs / mo', annual: 'Up to ₹60 Lakhs/yr', highlight: 'Standard bilateral DTAA relief' },
  { id: '₹5L - ₹20 Lakhs', label: '₹5L – ₹20 Lakhs / mo', annual: '₹60L to ₹2.4 Cr/yr', highlight: 'Saves ~₹2L–₹6L in WHT with TRC' },
  { id: '₹20L - ₹50 Lakhs', label: '₹20L – ₹50 Lakhs / mo', annual: '₹2.4 Cr to ₹6 Cr/yr', highlight: 'HoldCo structure highly recommended' },
  { id: '₹50 Lakhs+', label: '₹50 Lakhs+ / mo', annual: '₹6 Cr+ / yr', highlight: 'Enterprise Singapore / UAE DIFC structure' },
];

const COUNTRIES_LIST = [
  { name: 'India', flag: '🇮🇳' },
  { name: 'United States', flag: '🇺🇸' },
  { name: 'Singapore', flag: '🇸🇬' },
  { name: 'United Arab Emirates', flag: '🇦🇪' },
  { name: 'United Kingdom', flag: '🇬🇧' },
  { name: 'Canada', flag: '🇨🇦' },
  { name: 'Germany', flag: '🇩🇪' },
  { name: 'Australia', flag: '🇦🇺' },
];

export default function OnboardingPage({ onNavigateTab, showToast, user }) {
  const formRef = useRef(null);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('taxglobe_onboarded_profile') || '{}');
      return {
        name: saved.name || user?.name || '',
        email: saved.email || user?.email || '',
        phone: saved.phone || '',
        country: saved.country || 'India',
        businessType: saved.businessType || 'SaaS',
        monthlyBilling: saved.monthlyBilling || '₹5L - ₹20 Lakhs',
      };
    } catch {
      return {
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        country: 'India',
        businessType: 'SaaS',
        monthlyBilling: '₹5L - ₹20 Lakhs',
      };
    }
  });

  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(() => {
    return localStorage.getItem('taxglobe_onboarded') === 'true';
  });

  // OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(0);

  // Cooldown countdown
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = setTimeout(() => setOtpCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [otpCooldown]);

  // Reset OTP if email changes
  useEffect(() => {
    if (otpSent && !otpVerified) {
      setOtpSent(false);
      setOtpValue('');
      setOtpError('');
    }
  }, [form.email]);

  const scrollToSetup = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Send OTP
  async function handleSendOTP() {
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) {
      setOtpError('Please enter a valid email address');
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await apiFetch('/api/otp/send', {
        method: 'POST',
        body: JSON.stringify({ email: form.email }),
      });
      if (res.success) {
        setOtpSent(true);
        setOtpCooldown(60);
        showToast?.('OTP sent to your email! Please check your inbox.', 'success');
      }
    } catch (err) {
      setOtpError(err.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  }

  // Verify OTP
  async function handleVerifyOTP() {
    if (!otpValue.trim() || otpValue.length !== 6) {
      setOtpError('Please enter the 6-digit OTP');
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await apiFetch('/api/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ email: form.email, otp: otpValue }),
      });
      if (res.success) {
        setOtpVerified(true);
        setOtpError('');
        showToast?.('Email verified successfully! ✅', 'success');
      }
    } catch (err) {
      setOtpError(err.message || 'Invalid or expired OTP');
    } finally {
      setOtpLoading(false);
    }
  }

  // Submit onboarding
  async function handleSubmit() {
    if (!form.name.trim()) {
      showToast?.('Please enter your name / company name', 'error');
      setStep(1);
      return;
    }
    if (!form.email.trim()) {
      showToast?.('Please enter your email', 'error');
      setStep(1);
      return;
    }
    if (!form.phone.trim()) {
      showToast?.('Please enter your phone number', 'error');
      setStep(1);
      return;
    }
    if (!otpVerified) {
      showToast?.('Please verify your email with OTP first', 'error');
      setStep(1);
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch('/api/onboarding', {
        method: 'POST',
        body: JSON.stringify({ ...form, emailVerified: otpVerified }),
      });

      if (res.success || res.data) {
        setCompleted(true);
        localStorage.setItem('taxglobe_onboarded', 'true');
        localStorage.setItem('taxglobe_onboarded_profile', JSON.stringify(form));
        showToast?.('Onboarding profile saved successfully! 🎉', 'success');
      }
    } catch (err) {
      showToast?.(`Submission notice: ${err.message}`, 'error');
      setCompleted(true);
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setCompleted(false);
    setStep(1);
    setOtpVerified(false);
    setOtpSent(false);
    setOtpValue('');
  }

  return (
    <div className="space-y-10 sm:space-y-16 pb-12 overflow-x-hidden max-w-full">

      {/* ========================================================================= */}
      {/* 1. HERO INTRO SECTION: KYA HAI, KYO HAI, KIS LIYE HAI                     */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-6 sm:pt-14 pb-4 sm:pb-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="text-center max-w-3xl mx-auto">
            {/* Mission Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 sm:gap-2 bg-emerald-100/90 border border-emerald-300 text-emerald-800 text-[11px] sm:text-xs font-bold px-3 sm:px-4 py-1.5 rounded-full mb-4 sm:mb-6 shadow-xs max-w-full text-center leading-tight"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse shrink-0" />
              <span>Double Tax Avoidance (DTAA) & Structuring</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight tracking-tight mb-4 sm:mb-6 break-words"
            >
              Stop Losing{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 inline-block">
                20% to 30%
              </span>{' '}
              of Your Global Revenue to Withholding Tax
            </motion.h1>

            {/* Core Explanation: Kya Hai & Kis Liye Hai */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xs sm:text-base lg:text-lg text-gray-600 leading-relaxed mb-6 sm:mb-8 max-w-2xl mx-auto px-1"
            >
              <strong>TaxGlobe</strong> is India’s first comprehensive cross-border tax optimization and bilateral treaty engine.
              We legally slash foreign client withholding tax (WHT) from <strong>30% down to 0%–10%</strong> and model offshore
              holding structures (Singapore, Dubai DIFC, Delaware, UK) for SaaS founders, IT agencies, and global contractors.
            </motion.p>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto px-2"
            >
              <button
                onClick={scrollToSetup}
                className="btn-primary text-xs sm:text-base px-6 sm:px-7 py-3 sm:py-3.5 flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 w-full sm:w-auto"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" /> Start Onboarding Setup
                <ArrowDown className="w-4 h-4 animate-bounce" />
              </button>
              <button
                onClick={() => onNavigateTab('calculator')}
                className="btn-secondary text-xs sm:text-base px-5 sm:px-6 py-3 sm:py-3.5 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" /> Open DTAA Calculator
              </button>
            </motion.div>
          </div>

          {/* 4 Core Value Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-8 sm:mt-16">
            <div className="glass p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/80 shadow-sm text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="text-xl sm:text-3xl font-black text-emerald-600 mb-0.5 sm:mb-1">50%–100%</div>
              <div className="text-xs sm:text-sm font-bold text-gray-800">Average WHT Saved</div>
              <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5 sm:mt-1 hidden xs:block">Section 90 treaty relief</p>
            </div>

            <div className="glass p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/80 shadow-sm text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="text-xl sm:text-3xl font-black text-teal-600 mb-0.5 sm:mb-1">85+ Treaties</div>
              <div className="text-xs sm:text-sm font-bold text-gray-800">Active Corridors</div>
              <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5 sm:mt-1 hidden xs:block">India–US, SG, UAE, UK</p>
            </div>

            <div className="glass p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/80 shadow-sm text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="text-xl sm:text-3xl font-black text-blue-600 mb-0.5 sm:mb-1">0% Gains</div>
              <div className="text-xs sm:text-sm font-bold text-gray-800">Singapore / UAE</div>
              <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5 sm:mt-1 hidden xs:block">Zero capital gains on HoldCo</p>
            </div>

            <div className="glass p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/80 shadow-sm text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <FileCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="text-xl sm:text-3xl font-black text-purple-600 mb-0.5 sm:mb-1">Audit-Ready</div>
              <div className="text-xs sm:text-sm font-bold text-gray-800">TRC & Form 10F</div>
              <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5 sm:mt-1 hidden xs:block">100% compliant documentation</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. THE PROBLEM (KYO HAI - WHY IT EXISTS)                                   */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="glass rounded-2xl sm:rounded-3xl p-5 sm:p-12 border border-white/80 shadow-xl">
          <div className="max-w-2xl mx-auto text-center mb-6 sm:mb-10">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
              The Cross-Border Dilemma
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold text-gray-900 mt-2 sm:mt-3">
              Why Indian Businesses Lose Lakhs Every Quarter
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
              When foreign clients pay an Indian entity, international tax rules trigger automatic withholding deductions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-4 sm:p-6 rounded-2xl bg-white/70 border border-red-100 shadow-sm space-y-2 sm:space-y-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="font-bold text-sm sm:text-base text-gray-900">20% to 30% Double Tax Leakage</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Without a documented bilateral DTAA claim, US clients automatically withhold 30% under IRS regulations, and European/Asian firms withhold 20% on software IP and fees.
              </p>
            </div>

            <div className="p-4 sm:p-6 rounded-2xl bg-white/70 border border-amber-100 shadow-sm space-y-2 sm:space-y-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="font-bold text-sm sm:text-base text-gray-900">Complex TRC & Form 10F Filing</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Claiming bilateral exemptions requires Tax Residency Certificates, non-PE declarations, and Form 10F. Traditional CAs charge hefty fees with long delays.
              </p>
            </div>

            <div className="p-4 sm:p-6 rounded-2xl bg-white/70 border border-blue-100 shadow-sm space-y-2 sm:space-y-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="font-bold text-sm sm:text-base text-gray-900">Unoptimized Domestic Entity</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Operating purely out of an Indian entity means paying up to 25%–35% corporate tax and missing out on zero-capital-gains corridors like Singapore or Dubai DIFC.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. WHAT TAXGLOBE OFFERS (KIS LIYE HAI & KYA FEATURES HAIN)                 */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            Complete Suite
          </span>
          <h2 className="text-xl sm:text-3xl font-extrabold text-gray-900 mt-2 sm:mt-3">
            What TaxGlobe Provides in One Integrated Engine
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
            Everything you need to legally structure global revenues, calculate tax relief, and maintain audit readiness.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Feature 1 */}
          <div
            onClick={() => onNavigateTab('calculator')}
            className="glass p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/80 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-500 text-white flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-gray-900 mb-1">DTAA Calculator</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Compute legal withholding tax exemptions across royalties, FTS, dividends, and interest with live DTAA rates.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
              Explore Calculator <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Feature 2 */}
          <div
            onClick={() => onNavigateTab('simulator')}
            className="glass p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/80 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-teal-500 text-white flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-gray-900 mb-1">HoldCo Simulator</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Compare multi-tier HoldCo structures (Singapore HoldCo + India OpCo, Dubai DIFC, Delaware) for 0% capital gains.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-teal-600 group-hover:translate-x-1 transition-transform">
              Simulate Structures <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Feature 3 */}
          <div
            onClick={() => onNavigateTab('treaties')}
            className="glass p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/80 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-500 text-white flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-gray-900 mb-1">Treaty Rules Registry</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Searchable repository of 85+ bilateral tax treaties, official articles, beneficial ownership, and protocol amendments.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
              View Treaty Rules <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Feature 4 */}
          <div
            onClick={() => onNavigateTab('corridors')}
            className="glass p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/80 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-500 text-white flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-gray-900 mb-1">Corridor Flow Maps</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Interactive cross-border visualization illustrating money flow, effective tax rates, and bilateral tax treaty credits.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-transform">
              View Corridors <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. BEFORE VS AFTER TAXGLOBE (COMPARISON)                                  */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="glass rounded-2xl sm:rounded-3xl p-5 sm:p-10 border border-white/80 shadow-xl overflow-hidden">
          <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-3xl font-extrabold text-gray-900">
              The Real Difference in Your Bank Account
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Here is how a ₹1 Crore / year international software or service billing compares:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            {/* Without TaxGlobe */}
            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-red-50/50 border border-red-200/80 space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-black uppercase text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full">
                  Without TaxGlobe
                </span>
                <span className="text-xs text-red-600 font-semibold">Standard WHT</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-red-700">₹25,00,000</div>
              <p className="text-xs text-red-900/80 leading-relaxed">
                Withheld at 25% by default across foreign clients. Lost capital, painful FTC refunds, and manual paperwork.
              </p>
              <ul className="text-xs text-red-800 space-y-1.5 sm:space-y-2 pt-2 border-t border-red-200/60">
                <li className="flex items-center gap-2">❌ 20%–30% cash flow blocked at source</li>
                <li className="flex items-center gap-2">❌ Risk of international compliance audit</li>
                <li className="flex items-center gap-2">❌ No offshore HoldCo equity protection</li>
              </ul>
            </div>

            {/* With TaxGlobe */}
            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-emerald-50/60 border border-emerald-300 shadow-md space-y-3 sm:space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-black uppercase text-emerald-800 bg-emerald-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> With TaxGlobe
                </span>
                <span className="text-xs text-emerald-700 font-bold">DTAA Optimized</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700">₹0 – ₹10,00,000</div>
              <p className="text-xs text-emerald-900/80 leading-relaxed">
                Reduced to 0%–10% legally under Section 90 bilateral treaties. You pocket <strong>₹15,00,000+ extra cash</strong> every year.
              </p>
              <ul className="text-xs text-emerald-900 space-y-1.5 sm:space-y-2 pt-2 border-t border-emerald-200">
                <li className="flex items-center gap-2">✅ Valid TRC & Form 10F treaty relief</li>
                <li className="flex items-center gap-2">✅ Verified bilateral Section 90 exemptions</li>
                <li className="flex items-center gap-2">✅ 0% capital gains HoldCo structure path</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. HOW IT WORKS IN 3 SIMPLE STEPS                                         */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-6 sm:mb-10">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            Simple 3-Step Process
          </span>
          <h2 className="text-xl sm:text-3xl font-extrabold text-gray-900 mt-2 sm:mt-3">
            How to Claim Your Tax Relief
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          <div className="glass p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/80 shadow-sm text-center space-y-2 sm:space-y-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-500 text-white font-black text-base sm:text-lg flex items-center justify-center mx-auto shadow-md">
              1
            </div>
            <h3 className="font-bold text-sm sm:text-base text-gray-900">Complete Onboarding Below</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Fill in your legal name, business model, and verify your email with OTP. It takes less than 2 minutes.
            </p>
          </div>

          <div className="glass p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/80 shadow-sm text-center space-y-2 sm:space-y-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-teal-500 text-white font-black text-base sm:text-lg flex items-center justify-center mx-auto shadow-md">
              2
            </div>
            <h3 className="font-bold text-sm sm:text-base text-gray-900">Automated Treaty Matching</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Our bilateral engine matches your entity against India’s active DTAA corridors (US, Singapore, UAE, UK).
            </p>
          </div>

          <div className="glass p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/80 shadow-sm text-center space-y-2 sm:space-y-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-500 text-white font-black text-base sm:text-lg flex items-center justify-center mx-auto shadow-md">
              3
            </div>
            <h3 className="font-bold text-sm sm:text-base text-gray-900">Claim Savings & Structure</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Receive your personalized tax savings report, Form 10F documentation checklist, and HoldCo recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. LEAD SETUP FORM (FOOTER SE THEEK PEHLE)                                */}
      {/* ========================================================================= */}
      <section ref={formRef} id="onboarding-setup" className="max-w-6xl mx-auto px-3 sm:px-6 pt-2 sm:pt-4">
        {/* Section title */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-emerald-100/90 border border-emerald-300 text-emerald-800 text-[11px] sm:text-xs font-bold px-3 sm:px-4 py-1.5 rounded-full mb-2 sm:mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Start Your Assessment Now
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Claim Your Entity Tax Optimization Setup
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1.5 sm:mt-2">
            Enter your details, verify your business email with OTP, and get instant access to bilateral treaty savings.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Main Form Box */}
          <div className="lg:col-span-8">
            <div className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-10 border border-white/80 shadow-2xl relative overflow-hidden">
              {!completed ? (
                <>
                  {/* Step header */}
                  <div className="mb-6 sm:mb-8">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full">
                          Step {step} of 3
                        </span>
                        <span className="text-[10px] sm:text-xs text-gray-400 font-medium">Verified Onboarding</span>
                      </div>
                      <span className="text-[10px] sm:text-xs font-semibold text-gray-500">
                        {step === 1 && 'Entity (OTP)'}
                        {step === 2 && 'Category'}
                        {step === 3 && 'Billing'}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-2xl font-extrabold text-gray-900 leading-snug">
                      {step === 1 && 'Step 1: Contact Details & Email OTP Verification'}
                      {step === 2 && 'Step 2: What is your primary business model?'}
                      {step === 3 && 'Step 3: What is your monthly cross-border volume?'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {step === 1 && 'Bina OTP verify kiye aage nahi badh sakte. Details are encrypted.'}
                      {step === 2 && 'Different business models qualify for specific DTAA exemptions (Royalties vs FTS vs Services).'}
                      {step === 3 && 'We compute your exact withholding tax savings potential based on your billing volume.'}
                    </p>

                    {/* Progress bar */}
                    <div className="w-full bg-gray-100 h-1.5 sm:h-2 rounded-full mt-3 sm:mt-4 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                        style={{ width: `${(step / 3) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* STEP 1: Name, Email, OTP, Phone, Country */}
                  {step === 1 && (
                    <div className="space-y-4 sm:space-y-5">
                      {/* Name */}
                      <div>
                        <label className="label-sm">Legal Entity / Founder Name *</label>
                        <input
                          type="text"
                          className="input-field py-2.5 sm:py-3 text-sm sm:text-base"
                          placeholder="e.g. Dhruv Dubey or Acme Tech Pvt Ltd"
                          value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        />
                      </div>

                      {/* Email + Send OTP */}
                      <div>
                        <label className="label-sm flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-gray-500" /> Business Email Address *
                          {otpVerified && (
                            <span className="ml-auto text-[10px] sm:text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Verified
                            </span>
                          )}
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="email"
                            className={`input-field py-2.5 sm:py-3 text-sm sm:text-base flex-1 ${otpVerified ? 'bg-emerald-50/50 border-emerald-200' : ''}`}
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={e => {
                              setForm(f => ({ ...f, email: e.target.value }));
                              if (otpVerified) {
                                setOtpVerified(false);
                                setOtpSent(false);
                                setOtpValue('');
                              }
                            }}
                            disabled={otpVerified}
                          />
                          {!otpVerified && (
                            <button
                              type="button"
                              onClick={handleSendOTP}
                              disabled={otpLoading || !form.email.trim() || otpCooldown > 0}
                              className="btn-primary text-xs px-4 py-2.5 sm:py-2.5 whitespace-nowrap flex items-center justify-center gap-1.5 disabled:opacity-40 w-full sm:w-auto"
                            >
                              {otpLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <KeyRound className="w-3.5 h-3.5" />
                              )}
                              {otpCooldown > 0 ? `Resend (${otpCooldown}s)` : otpSent ? 'Resend OTP' : 'Send OTP'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* OTP Input — only shows after OTP sent */}
                      {otpSent && !otpVerified && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-2 bg-emerald-50/50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-emerald-100"
                        >
                          <label className="label-sm flex items-center gap-1.5">
                            <KeyRound className="w-3.5 h-3.5 text-emerald-600" /> Enter 6-Digit OTP Sent to Email
                          </label>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              className="input-field py-2.5 sm:py-3 text-base text-center tracking-[0.5em] font-bold flex-1 bg-white"
                              placeholder="● ● ● ● ● ●"
                              value={otpValue}
                              onChange={e => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                setOtpValue(val);
                                setOtpError('');
                              }}
                            />
                            <button
                              type="button"
                              onClick={handleVerifyOTP}
                              disabled={otpLoading || otpValue.length !== 6}
                              className="btn-primary text-xs px-5 py-2.5 whitespace-nowrap flex items-center justify-center gap-1.5 disabled:opacity-40 w-full sm:w-auto"
                            >
                              {otpLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                              Verify
                            </button>
                          </div>
                          {otpError && (
                            <p className="text-xs text-red-500 font-medium">{otpError}</p>
                          )}
                          <p className="text-[11px] text-gray-500">
                            OTP valid for 5 minutes. Check inbox and spam folder.
                          </p>
                        </motion.div>
                      )}

                      {/* Phone */}
                      <div>
                        <label className="label-sm flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-500" /> Phone Number *
                        </label>
                        <input
                          type="tel"
                          className="input-field py-2.5 sm:py-3 text-sm sm:text-base"
                          placeholder="+91 9876543210"
                          value={form.phone}
                          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        />
                      </div>

                      {/* Jurisdiction */}
                      <div>
                        <label className="label-sm">Primary Base Jurisdiction</label>
                        <select
                          className="input-field py-2.5 sm:py-3 text-sm"
                          value={form.country}
                          onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                        >
                          {COUNTRIES_LIST.map(c => (
                            <option key={c.name} value={c.name}>
                              {c.flag} {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex items-start gap-2.5 sm:gap-3 mt-3 sm:mt-4">
                        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-emerald-900 leading-relaxed">
                          OTP verification ensures valid entity mapping under Section 90 provisions and applicable bilateral treaties with the US, Singapore, UAE, and UK.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Business Type */}
                  {step === 2 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {BUSINESS_TYPES.map(b => {
                        const Icon = b.icon;
                        const isSelected = form.businessType === b.id;
                        return (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setForm(f => ({ ...f, businessType: b.id }))}
                            className={`p-4 sm:p-5 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                              isSelected
                                ? 'bg-emerald-50/80 border-emerald-500 shadow-md ring-2 ring-emerald-300'
                                : 'bg-white/70 border-gray-200 hover:border-gray-300 hover:bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2 sm:mb-3">
                              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${
                                isSelected ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'
                              }`}>
                                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                              </div>
                              {isSelected && <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />}
                            </div>
                            <div>
                              <div className="font-bold text-sm sm:text-base text-gray-900">{b.label}</div>
                              <div className="text-xs text-gray-500 mt-1 leading-relaxed">{b.desc}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* STEP 3: Monthly Billing */}
                  {step === 3 && (
                    <div className="space-y-2.5 sm:space-y-3">
                      {BILLING_RANGES.map(r => {
                        const isSelected = form.monthlyBilling === r.id;
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setForm(f => ({ ...f, monthlyBilling: r.id }))}
                            className={`w-full p-3.5 sm:p-5 rounded-2xl text-left border transition-all flex items-center justify-between ${
                              isSelected
                                ? 'bg-emerald-50/80 border-emerald-500 shadow-md ring-2 ring-emerald-300'
                                : 'bg-white/70 border-gray-200 hover:border-gray-300 hover:bg-white'
                            }`}
                          >
                            <div>
                              <div className="font-bold text-sm sm:text-base text-gray-900 flex flex-wrap items-center gap-1.5 sm:gap-2">
                                <span>{r.label}</span>
                                <span className="text-xs font-normal text-gray-500">({r.annual})</span>
                              </div>
                              <div className="text-xs text-emerald-700 font-medium mt-0.5 sm:mt-1">{r.highlight}</div>
                            </div>
                            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                              isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-gray-300'
                            }`}>
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-5 sm:pt-6 mt-6 sm:mt-8 border-t border-gray-100">
                    {step > 1 ? (
                      <button
                        type="button"
                        onClick={() => setStep(s => s - 1)}
                        className="btn-secondary text-xs sm:text-sm py-2 px-4 sm:py-2.5 sm:px-5 flex items-center gap-1.5"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                    ) : (
                      <div />
                    )}

                    {step < 3 ? (
                      <button
                        type="button"
                        disabled={step === 1 && (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !otpVerified)}
                        onClick={() => setStep(s => s + 1)}
                        className="btn-primary text-xs sm:text-sm py-2 px-5 sm:py-2.5 sm:px-6 flex items-center gap-2 disabled:opacity-40"
                      >
                        Continue <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={handleSubmit}
                        className="btn-primary text-xs sm:text-sm py-2.5 px-6 sm:py-3 sm:px-8 flex items-center gap-2 shadow-lg"
                      >
                        {submitting ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" /> Save Onboarding
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                /* COMPLETED ASSESSMENT VIEW */
                <div className="text-center py-4 sm:py-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-3 sm:mb-4 text-white shadow-xl shadow-emerald-500/20">
                    <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>

                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 border border-emerald-300 px-3 py-0.5 sm:py-1 rounded-full">
                    Profile Active & Optimized
                  </span>

                  <h3 className="text-xl sm:text-3xl font-extrabold text-gray-900 mt-3 sm:mt-4 mb-2">
                    Welcome to TaxGlobe, {form.name}!
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto mb-5 sm:mb-6 leading-relaxed">
                    Your cross-border profile for <strong>{form.businessType}</strong> in <strong>{form.country}</strong> billing <strong>{form.monthlyBilling}</strong> has been saved and mapped to our DTAA optimization engine.
                  </p>

                  {/* Benefit Card */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl sm:rounded-3xl p-4 sm:p-7 mb-6 sm:mb-8 text-left space-y-2 sm:space-y-3 shadow-inner">
                    <div className="text-[11px] sm:text-xs font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-emerald-600 shrink-0" /> Personalized DTAA Tax Benefit Assessment
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                      Under bilateral treaties with the United States, Singapore, UAE and the UK, your <strong>{form.businessType}</strong> revenues qualify for domestic withholding reduction from <strong>20%–30% down to 0%–10%</strong> using valid TRC and Form 10F filings.
                    </p>
                    <div className="pt-2 sm:pt-3 border-t border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 text-xs text-gray-600">
                      <span>Estimated Annual WHT Savings Potential:</span>
                      <span className="font-black text-emerald-700 text-sm sm:text-lg">₹6.0 Lakhs – ₹18.0 Lakhs / yr</span>
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="grid sm:grid-cols-2 gap-3 mb-5 sm:mb-6">
                    <button
                      onClick={() => onNavigateTab('calculator')}
                      className="btn-primary flex items-center justify-center gap-2 py-3 shadow-md text-xs sm:text-sm"
                    >
                      <TrendingUp className="w-4 h-4" /> Run DTAA Calculator
                    </button>
                    <button
                      onClick={() => onNavigateTab('simulator')}
                      className="btn-secondary flex items-center justify-center gap-2 py-3 shadow-sm text-xs sm:text-sm"
                    >
                      <Building2 className="w-4 h-4" /> Simulate HoldCo Structure
                    </button>
                  </div>

                  <button
                    onClick={handleReset}
                    className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1.5 mx-auto transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Re-run or update onboarding assessment
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Explanatory Guarantee & Compliance Cards */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/80 shadow-md">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> What Happens After Setup?
              </h3>
              <div className="space-y-2.5 sm:space-y-3 text-xs text-gray-600 leading-relaxed">
                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100">
                  <span className="font-bold text-emerald-950 block mb-0.5">1. Treaty Benefit Mapping</span>
                  Section 90 relief calculation applied automatically to your international revenue streams.
                </div>
                <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-100">
                  <span className="font-bold text-teal-950 block mb-0.5">2. TRC & Form 10F Filing Kit</span>
                  Pre-filled checklist of statutory documents required by US, UK & Singapore tax authorities.
                </div>
                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100">
                  <span className="font-bold text-blue-950 block mb-0.5">3. Entity Structuring Strategy</span>
                  HoldCo parent assessment to eliminate capital gains and streamline cross-border dividends.
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-white/80 shadow-xs flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-900">100% Confidential & Secure</div>
                <div className="text-[11px] text-gray-500 leading-tight">
                  Your billing numbers and entity details are encrypted and never shared.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
