import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { Calculator, ArrowRight, TrendingDown, Info } from 'lucide-react';
import { apiFetch, COUNTRIES, INCOME_TYPES, formatCurrency } from '../utils';

const PRESETS = [
  { label: '₹10L', val: 1000000 },
  { label: '₹50L', val: 5000000 },
  { label: '₹1Cr', val: 10000000 },
  { label: '₹5Cr', val: 50000000 },
];

export default function DTAACalculator({ showToast, setApiStatus }) {
  const [form, setForm] = useState(() => {
    try {
      const saved = sessionStorage.getItem('taxglobe_calc_form');
      return saved ? JSON.parse(saved) : { from: 'IN', to: 'US', income_type: 'Royalty', gross_income: 10000000 };
    } catch {
      return { from: 'IN', to: 'US', income_type: 'Royalty', gross_income: 10000000 };
    }
  });

  const [result, setResult] = useState(() => {
    try {
      const saved = sessionStorage.getItem('taxglobe_calc_result');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const savingsRef = useRef(null);

  const h = (k) => (e) => {
    const next = { ...form, [k]: e.target.value };
    setForm(next);
    sessionStorage.setItem('taxglobe_calc_form', JSON.stringify(next));
  };

  useEffect(() => {
    if (result?.savings && savingsRef.current) {
      gsap.fromTo(savingsRef.current,
        { textContent: 0 },
        {
          textContent: result.savings,
          duration: 1.2,
          ease: 'power2.out',
          snap: { textContent: 1000 },
          onUpdate() {
            const v = parseFloat(this.targets()[0].textContent);
            savingsRef.current.textContent = formatCurrency(v);
          }
        }
      );
    }
  }, [result?.savings]);

  async function calculate(e) {
    e?.preventDefault();
    setLoading(true);
    try {
      const data = await apiFetch('/api/v1/tax/calculate', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setResult(data);
      sessionStorage.setItem('taxglobe_calc_result', JSON.stringify(data));
      sessionStorage.setItem('taxglobe_calc_form', JSON.stringify(form));
      setApiStatus('connected');
    } catch (err) {
      showToast(`Calculation error: ${err.message}`, 'error');
      setApiStatus('fallback');
    } finally {
      setLoading(false);
    }
  }

  // Auto-run on mount if no previous result
  useEffect(() => {
    if (!result) {
      calculate();
    }
  }, []);

  const savingsPct = result ? ((result.savings / result.domestic_tax) * 100).toFixed(0) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
          <span className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow">
            <Calculator className="w-5 h-5 text-white" />
          </span>
          DTAA Tax Calculator
        </h2>
        <p className="text-gray-500 mt-1">Calculate your withholding tax savings across bilateral tax treaties</p>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 glass rounded-3xl p-6"
        >
          <form onSubmit={calculate} className="space-y-5">
            {/* From */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">From Country</label>
              <select value={form.from} onChange={h('from')} className="input-field">
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                ))}
              </select>
            </div>

            {/* To */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">To Country</label>
              <select value={form.to} onChange={h('to')} className="input-field">
                {COUNTRIES.filter(c => c.code !== form.from).map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                ))}
              </select>
            </div>

            {/* Income Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Income Type</label>
              <select value={form.income_type} onChange={h('income_type')} className="input-field">
                {INCOME_TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Gross Income (₹)</label>
              <input
                type="number"
                value={form.gross_income}
                onChange={h('gross_income')}
                className="input-field"
                min="0"
                required
              />
              <div className="flex gap-2 mt-2 flex-wrap">
                {PRESETS.map(p => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, gross_income: p.val }))}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                      form.gross_income === p.val
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-white/80 text-gray-600 hover:bg-emerald-50 border border-gray-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Calculator className="w-4 h-4" /> Calculate Savings</>
              )}
            </button>
          </form>
        </motion.div>

        {/* Result */}
        <div className="lg:col-span-3 space-y-4">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4"
              >
                {/* Savings Hero Card */}
                <div className="glass rounded-3xl p-6 sm:p-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 to-teal-50/50 rounded-3xl" />
                  <div className="relative">
                    <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold mb-3">
                      <TrendingDown className="w-4 h-4" /> Total Tax Savings
                    </div>
                    <div ref={savingsRef} className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 mb-2">
                      {formatCurrency(result.savings)}
                    </div>
                    <div className="text-gray-500 text-sm">
                      You save <span className="font-bold text-emerald-600">{savingsPct}%</span> vs domestic taxation
                    </div>
                    <div className="mt-4 inline-flex items-center gap-2 bg-white/70 rounded-xl px-3 py-1.5 text-xs text-gray-600">
                      <Info className="w-3.5 h-3.5 text-gray-400" />
                      {result.treaty_article} · Source: {result.source_reference || 'DTAA'}
                    </div>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Domestic Tax', val: result.domestic_tax, rate: `${result.domestic_rate}%`, color: 'red' },
                    { label: 'Treaty Tax', val: result.treaty_tax, rate: `${result.wht_rate}%`, color: 'blue' },
                    { label: 'Net Payable', val: result.tax_liability ?? result.treaty_tax, rate: 'After DTAA', color: 'emerald' },
                  ].map(item => (
                    <div key={item.label} className="glass-sm rounded-2xl p-4">
                      <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">{item.label}</div>
                      <div className={`text-xl font-bold ${item.color === 'red' ? 'text-red-500' : item.color === 'emerald' ? 'text-emerald-600' : 'text-blue-500'} mb-0.5`}>
                        {formatCurrency(item.val)}
                      </div>
                      <div className="text-xs text-gray-400">{item.rate}</div>
                    </div>
                  ))}
                </div>

                {/* Corridor Info */}
                <div className="glass-sm rounded-2xl p-4 flex items-start gap-3">
                  <Info className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div className="text-xs text-gray-600 leading-relaxed">
                    Under {form.from}–{form.to} DTAA, {form.income_type} income is taxed at <strong>{result.wht_rate}%</strong> WHT
                    instead of the domestic rate of <strong>{result.domestic_rate}%</strong>. Ensure a valid Tax Residency Certificate (TRC) is on file for compliance.
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass rounded-3xl p-12 flex flex-col items-center justify-center text-center min-h-64"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mb-4">
                  <Calculator className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-gray-700 font-semibold mb-2">Ready to Calculate</h3>
                <p className="text-gray-400 text-sm max-w-xs">
                  Select countries and income type, then click Calculate Savings to see your DTAA benefit.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
