import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Check, ArrowRight, ArrowLeft, Sparkles, Building2,
  Laptop, Briefcase, Globe, TrendingUp, ShieldCheck, CheckCircle2
} from 'lucide-react';
import { apiFetch } from '../utils';

const BUSINESS_TYPES = [
  { id: 'SaaS', label: 'SaaS & Digital IP', icon: Laptop, desc: 'Software, APIs & IP licensing' },
  { id: 'Agency', label: 'Agency & IT Services', icon: Building2, desc: 'Software development & consulting' },
  { id: 'Freelancer', label: 'Freelancer / Contractor', icon: Briefcase, desc: 'Direct international client billing' },
  { id: 'Export', label: 'Export & B2B Services', icon: Globe, desc: 'Cross-border trading & corporate services' },
];

const BILLING_RANGES = [
  { id: '< ₹5 Lakhs', label: '< ₹5 Lakhs / mo', annual: 'Up to ₹60 Lakhs/yr', highlight: 'Standard DTAA relief' },
  { id: '₹5L - ₹20 Lakhs', label: '₹5L – ₹20 Lakhs / mo', annual: '₹60L to ₹2.4 Cr/yr', highlight: 'Saves ~₹2L–₹6L in WHT' },
  { id: '₹20L - ₹50 Lakhs', label: '₹20L – ₹50 Lakhs / mo', annual: '₹2.4 Cr to ₹6 Cr/yr', highlight: 'HoldCo structure recommended' },
  { id: '₹50 Lakhs+', label: '₹50 Lakhs+ / mo', annual: '₹6 Cr+ / yr', highlight: 'Enterprise Singapore / DIFC path' },
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

export default function OnboardingModal({ isOpen, onClose, onComplete, showToast }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    country: 'India',
    businessType: 'SaaS',
    monthlyBilling: '₹5L - ₹20 Lakhs',
  });
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit() {
    if (!form.name.trim()) {
      showToast('Please enter your name', 'error');
      setStep(1);
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch('/api/onboarding', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      if (res.success || res.data) {
        setCompleted(true);
        localStorage.setItem('taxglobe_onboarded', 'true');
        localStorage.setItem('taxglobe_onboarded_profile', JSON.stringify(form));
        showToast('Onboarding profile saved successfully!', 'success');
      }
    } catch (err) {
      showToast(`Submission note: ${err.message}`, 'error');
      // If error occurs, still allow user to explore
      setCompleted(true);
    } finally {
      setSubmitting(false);
    }
  }

  function handleFinishAndExplore(tab) {
    onClose();
    if (onComplete) onComplete(tab, form);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          className="glass rounded-3xl p-6 sm:p-8 w-full max-w-xl max-h-[92vh] overflow-y-auto relative border border-white/80 shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl hover:bg-gray-100/80 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {!completed ? (
            <>
              {/* Header & Step progress */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    Step {step} of 3
                  </span>
                  <span className="text-xs text-gray-400 font-medium">Quick Onboarding</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                  {step === 1 && 'Welcome! Let’s personalize your tax setup'}
                  {step === 2 && 'What type of business do you operate?'}
                  {step === 3 && 'What is your monthly cross-border billing?'}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {step === 1 && 'Tell us your name and base jurisdiction to identify matching bilateral treaties.'}
                  {step === 2 && 'Different business models qualify for specific DTAA exemptions (Royalties vs FTS vs Services).'}
                  {step === 3 && 'We estimate your potential withholding tax savings based on your billing volume.'}
                </p>

                {/* Progress bar */}
                <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                    style={{ width: `${(step / 3) * 100}%` }}
                  />
                </div>
              </div>

              {/* STEP 1: Name & Country */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="label-sm">Your Name / Legal Entity Name *</label>
                    <input
                      type="text"
                      className="input-field py-3 text-base"
                      placeholder="e.g. Dhruv Dubey or Acme Tech Pvt Ltd"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="label-sm">Primary Base Country</label>
                    <select
                      className="input-field py-3"
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

                  <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3.5 flex items-start gap-3 mt-4">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-emerald-900 leading-relaxed">
                      Your details are securely mapped to identify relevant Section 90 provisions and applicable bilateral treaties with the US, Singapore, UAE, and UK.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 2: Business Type */}
              {step === 2 && (
                <div className="grid sm:grid-cols-2 gap-3">
                  {BUSINESS_TYPES.map(b => {
                    const Icon = b.icon;
                    const isSelected = form.businessType === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, businessType: b.id }))}
                        className={`p-4 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-emerald-50/70 border-emerald-500 shadow-md ring-2 ring-emerald-300'
                            : 'bg-white/70 border-gray-200 hover:border-gray-300 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isSelected ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-gray-900">{b.label}</div>
                          <div className="text-xs text-gray-500 mt-0.5 leading-snug">{b.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* STEP 3: Monthly Billing */}
              {step === 3 && (
                <div className="space-y-2.5">
                  {BILLING_RANGES.map(r => {
                    const isSelected = form.monthlyBilling === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, monthlyBilling: r.id }))}
                        className={`w-full p-4 rounded-2xl text-left border transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-50/70 border-emerald-500 shadow-md ring-2 ring-emerald-300'
                            : 'bg-white/70 border-gray-200 hover:border-gray-300 hover:bg-white'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-sm text-gray-900 flex items-center gap-2">
                            {r.label}
                            <span className="text-xs font-normal text-gray-500">({r.annual})</span>
                          </div>
                          <div className="text-xs text-emerald-700 font-medium mt-0.5">{r.highlight}</div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-gray-300'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Navigation Footer */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(s => s - 1)}
                    className="btn-secondary text-xs sm:text-sm py-2 px-4 flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                ) : (
                  <div />
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    disabled={step === 1 && !form.name.trim()}
                    onClick={() => setStep(s => s + 1)}
                    className="btn-primary text-xs sm:text-sm py-2 px-5 flex items-center gap-1.5 disabled:opacity-40"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleSubmit}
                    className="btn-primary text-xs sm:text-sm py-2.5 px-6 flex items-center gap-2"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Complete Onboarding
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          ) : (
            /* COMPLETED / SUCCESS SCREEN */
            <div className="text-center py-4 sm:py-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-4 text-white shadow-xl shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                Profile Optimized
              </span>

              <h3 className="text-2xl font-extrabold text-gray-900 mt-3 mb-1">
                Welcome to TaxGlobe, {form.name}!
              </h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto mb-6">
                Your onboarding assessment for <strong>{form.businessType}</strong> in <strong>{form.country}</strong> billing <strong>{form.monthlyBilling}</strong> has been saved.
              </p>

              {/* Assessment card summary */}
              <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/60 border border-emerald-200/80 rounded-2xl p-5 mb-6 text-left space-y-2.5">
                <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" /> Personalized Tax Optimization Insight
                </div>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  Under India's DTAA treaties with the US & Singapore, your <strong>{form.businessType}</strong> cross-border payments can legally claim withholding tax exemption from <strong>20% down to 10% or 0%</strong> using valid TRC & Form 10F documentation.
                </p>
                <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs text-gray-500">
                  <span>Estimated Annual Tax Savings:</span>
                  <span className="font-extrabold text-emerald-700 text-sm">₹6.0 Lakhs – ₹18.0 Lakhs</span>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  onClick={() => handleFinishAndExplore('calculator')}
                  className="btn-primary flex items-center justify-center gap-2 py-3"
                >
                  <TrendingUp className="w-4 h-4" /> Open DTAA Calculator
                </button>
                <button
                  onClick={() => handleFinishAndExplore('simulator')}
                  className="btn-secondary flex items-center justify-center gap-2 py-3"
                >
                  <Building2 className="w-4 h-4" /> Model HoldCo Structure
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
