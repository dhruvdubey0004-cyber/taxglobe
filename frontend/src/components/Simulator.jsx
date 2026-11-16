import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, CheckCircle, XCircle, Star, TrendingUp, Calendar, ArrowRight, X, User, Mail, Phone, MessageSquare } from 'lucide-react';
import { apiFetch, formatCurrency } from '../utils';

const LOC = ['IN', 'US', 'SG', 'UAE', 'UK'];
const BIZ = ['SaaS', 'Consulting', 'Manufacturing', 'E-commerce', 'FinTech'];

// Booking Modal Component
function BookingModal({ structure, onClose, showToast }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const h = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  function submit(e) {
    e.preventDefault();
    // In production, this would call a booking API
    setSubmitted(true);
    showToast(`Booking confirmed for ${structure.name}!`, 'success');
    setTimeout(onClose, 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="glass rounded-3xl p-6 w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
            <p className="text-gray-500 text-sm">Our tax expert will reach out within 24 hours.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-lg font-bold text-gray-900">Book a Consultation</h3>
                </div>
                <div className="glass-sm rounded-xl px-3 py-1.5 inline-flex items-center gap-2 mt-1">
                  <span className="text-xs font-semibold text-indigo-600">{structure.name}</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-xs text-gray-500 font-mono">{structure.path}</span>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Summary strip */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-3 mb-5 flex items-center gap-4">
              <div className="text-center">
                <div className="text-xs text-gray-500">Effective Tax</div>
                <div className="font-bold text-gray-900">{structure.effective_tax_rate}%</div>
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <div className="text-center">
                <div className="text-xs text-gray-500">Annual Savings</div>
                <div className="font-bold text-emerald-600">{formatCurrency(structure.annual_savings)}</div>
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <div className="text-center">
                <div className="text-xs text-gray-500">Setup Cost</div>
                <div className="font-bold text-gray-700">${structure.setup_cost?.toLocaleString()}</div>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input className="input-field pl-10" placeholder="Your full name" value={form.name} onChange={h('name')} required autoComplete="off" />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input className="input-field pl-10" type="email" placeholder="Email address" value={form.email} onChange={h('email')} required autoComplete="off" />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input className="input-field pl-10" type="tel" placeholder="Phone number (optional)" value={form.phone} onChange={h('phone')} autoComplete="off" />
              </div>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea
                  className="input-field pl-10 resize-none"
                  rows={3}
                  placeholder="Tell us about your business structure needs..."
                  value={form.message}
                  onChange={h('message')}
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 text-white"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                >
                  <Calendar className="w-4 h-4" /> Book Now
                </button>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function Simulator({ showToast, setApiStatus }) {
  const [form, setForm] = useState(() => {
    try {
      const saved = sessionStorage.getItem('taxglobe_sim_form');
      return saved ? JSON.parse(saved) : {
        customer_location: 'US',
        investor_location: 'US',
        founder_location: 'IN',
        business_type: 'SaaS',
      };
    } catch {
      return {
        customer_location: 'US',
        investor_location: 'US',
        founder_location: 'IN',
        business_type: 'SaaS',
      };
    }
  });

  const [structures, setStructures] = useState(() => {
    try {
      const saved = sessionStorage.getItem('taxglobe_sim_structures');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [ran, setRan] = useState(() => {
    try {
      const saved = sessionStorage.getItem('taxglobe_sim_structures');
      return saved ? JSON.parse(saved).length > 0 : false;
    } catch {
      return false;
    }
  });
  const [selectedBooking, setSelectedBooking] = useState(null);

  const h = (k) => (e) => {
    const next = { ...form, [k]: e.target.value };
    setForm(next);
    sessionStorage.setItem('taxglobe_sim_form', JSON.stringify(next));
  };

  async function simulate(e) {
    e?.preventDefault();
    setLoading(true);
    try {
      const data = await apiFetch('/api/structure/simulate', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      const list = data.structures || [];
      setStructures(list);
      setRan(true);
      sessionStorage.setItem('taxglobe_sim_structures', JSON.stringify(list));
      sessionStorage.setItem('taxglobe_sim_form', JSON.stringify(form));
      setApiStatus('connected');
    } catch (err) {
      showToast(`Simulation error: ${err.message}`, 'error');
      setApiStatus('fallback');
    } finally {
      setLoading(false);
    }
  }

  // Auto-run on first mount if empty
  useEffect(() => {
    if (structures.length === 0) {
      simulate();
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
          <span className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow">
            <Layers className="w-5 h-5 text-white" />
          </span>
          HoldCo Structure Simulator
        </h2>
        <p className="text-gray-500 mt-1">Model optimal holding company structures for your business</p>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 glass rounded-3xl p-6"
        >
          <form onSubmit={simulate} className="space-y-5">
            {[
              { key: 'customer_location', label: 'Customer Location', opts: LOC },
              { key: 'investor_location', label: 'Investor Location', opts: LOC },
              { key: 'founder_location', label: 'Founder Location', opts: LOC },
              { key: 'business_type', label: 'Business Type', opts: BIZ },
            ].map(({ key, label, opts }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">{label}</label>
                <select value={form[key]} onChange={h(key)} className="input-field">
                  {opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Layers className="w-4 h-4" /> Run Simulation</>
              }
            </button>
          </form>
        </motion.div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          <AnimatePresence mode="wait">
            {ran && structures.length > 0 ? (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {structures.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`glass rounded-2xl p-5 relative overflow-hidden ${s.recommended ? 'ring-2 ring-emerald-400' : ''}`}
                  >
                    {s.recommended && (
                      <div className="absolute top-4 right-4 flex items-center gap-1 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        <Star className="w-3 h-3" /> Recommended
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-base mb-0.5">{s.name}</h3>
                        <p className="text-xs text-gray-500 font-mono mb-3">{s.path}</p>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="bg-white/60 rounded-xl p-3">
                            <div className="text-xs text-gray-500 mb-0.5">Effective Tax</div>
                            <div className="text-lg font-bold text-gray-900">{s.effective_tax_rate}%</div>
                          </div>
                          <div className="bg-white/60 rounded-xl p-3">
                            <div className="text-xs text-gray-500 mb-0.5">Annual Savings</div>
                            <div className="text-lg font-bold text-emerald-600">{formatCurrency(s.annual_savings)}</div>
                          </div>
                          <div className="bg-white/60 rounded-xl p-3">
                            <div className="text-xs text-gray-500 mb-0.5">Setup Cost</div>
                            <div className="text-lg font-bold text-gray-700">${s.setup_cost?.toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <div className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Pros</div>
                            <ul className="space-y-1">
                              {s.pros?.map((p, j) => <li key={j} className="text-xs text-gray-600 flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0" />{p}</li>)}
                            </ul>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1"><XCircle className="w-3.5 h-3.5 text-red-400" /> Cons</div>
                            <ul className="space-y-1">
                              {s.cons?.map((c, j) => <li key={j} className="text-xs text-gray-600 flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-red-400 rounded-full shrink-0" />{c}</li>)}
                            </ul>
                          </div>
                        </div>

                        {/* Action row */}
                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-xs text-gray-500">Need legal setup guidance?</span>
                          <button
                            type="button"
                            onClick={() => setSelectedBooking(s)}
                            className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-sm"
                            style={s.recommended ? { background: 'linear-gradient(135deg, #10b981, #059669)' } : {}}
                          >
                            <Calendar className="w-3.5 h-3.5" /> Book Consultation
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass rounded-3xl p-12 flex flex-col items-center justify-center text-center min-h-64"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-4">
                  <TrendingUp className="w-8 h-8 text-indigo-500" />
                </div>
                <h3 className="text-gray-700 font-semibold mb-2">Model Your Structure</h3>
                <p className="text-gray-400 text-sm max-w-xs">Configure your business parameters and run the simulation to see optimal holding structures.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {selectedBooking && (
          <BookingModal
            structure={selectedBooking}
            onClose={() => setSelectedBooking(null)}
            showToast={showToast}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
