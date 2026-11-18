import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, RefreshCw, Plus, Calendar, Building2,
  Globe, DollarSign, CheckCircle2, Loader2, ArrowUpRight
} from 'lucide-react';
import { apiFetch } from '../utils';

export default function OnboardingLeads({ onOpenOnboarding, showToast }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  async function fetchLeads() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/onboarding');
      if (res.success && Array.isArray(res.data)) {
        setLeads(res.data);
      } else if (Array.isArray(res)) {
        setLeads(res);
      }
    } catch (err) {
      showToast(`Error fetching onboarding leads: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeads();
  }, []);

  const filtered = leads.filter(item => {
    const q = search.toLowerCase();
    const matchSearch =
      (item.name || '').toLowerCase().includes(q) ||
      (item.country || '').toLowerCase().includes(q) ||
      (item.businessType || '').toLowerCase().includes(q) ||
      (item.monthlyBilling || '').toLowerCase().includes(q);

    const matchType = filterType === 'ALL' || item.businessType === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Title & Actions Bar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-md">
                <Users className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                  Onboarding Leads
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                    {leads.length} Total
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  Real-time cross-border leads & client profiles captured via onboarding
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={fetchLeads}
              disabled={loading}
              className="btn-secondary text-xs sm:text-sm py-2 px-3 flex items-center gap-1.5"
              title="Refresh list"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={onOpenOnboarding}
              className="btn-primary text-xs sm:text-sm py-2 px-4 flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Start New Onboarding
            </button>
          </div>
        </div>
      </motion.div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search leads by name, country, or business..."
            className="input-field pl-10 text-xs sm:text-sm py-2.5"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {['ALL', 'SaaS', 'Agency', 'Freelancer', 'Export'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                filterType === t
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white/80 border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t === 'ALL' ? 'All Leads' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table / Cards */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-3xl overflow-hidden shadow-lg border border-white/80">
        {loading && leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-2" />
            <span className="text-xs text-gray-500">Loading onboarding submissions...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-gray-400">
              <Users className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-gray-800 text-base mb-1">No Leads Found</h4>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto mb-4">
              {leads.length === 0
                ? 'No onboarding profiles have been submitted yet. Be the first to complete onboarding!'
                : 'No leads match your current search and filter criteria.'}
            </p>
            <button onClick={onOpenOnboarding} className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Start Onboarding
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-white/60">
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client Name</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Business Type</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Base Jurisdiction</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Monthly Billing</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Submission Date</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/60">
                <AnimatePresence>
                  {filtered.map((item, index) => {
                    const formattedDate = item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Recently';

                    return (
                      <motion.tr
                        key={item._id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-white/70 transition-colors"
                      >
                        <td className="px-5 py-4 font-bold text-gray-900 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                              {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <div className="text-sm">{item.name}</div>
                              <div className="text-[10px] text-gray-400 font-mono">ID: {item._id?.slice(-6) || '—'}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            item.businessType === 'SaaS'
                              ? 'bg-purple-100 text-purple-700'
                              : item.businessType === 'Agency'
                              ? 'bg-blue-100 text-blue-700'
                              : item.businessType === 'Freelancer'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            <Building2 className="w-3 h-3" />
                            {item.businessType || 'Freelancer'}
                          </span>
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap font-medium text-gray-700">
                          <div className="flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-gray-400" />
                            {item.country || 'India'}
                          </div>
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap font-bold text-emerald-700">
                          {item.monthlyBilling || '< ₹5 Lakhs'}
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap text-xs text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {formattedDate}
                          </div>
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
