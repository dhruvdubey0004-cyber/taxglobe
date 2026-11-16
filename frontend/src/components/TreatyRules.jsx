import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Search, Edit2, Trash2, X, Save, Loader2 } from 'lucide-react';
import { apiFetch, COUNTRIES, INCOME_TYPES } from '../utils';

const EMPTY_FORM = {
  from: 'IN', to: 'US', incomeType: 'Royalty',
  article: 'Art. 12', domesticRate: 20, treatyRate: 10,
  status: 'Active', legalNote: 'Standard DTAA rate with valid TRC.',
};

function TreatyModal({ treaty, onClose, onSave, loading }) {
  const [form, setForm] = useState(treaty || EMPTY_FORM);
  const h = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="glass rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">{treaty?._id ? 'Edit Treaty' : 'Add New Treaty'}</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-sm">From Country</label>
            <select value={form.from} onChange={h('from')} className="input-field"><option value="">Select</option>{COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}</select>
          </div>
          <div>
            <label className="label-sm">To Country</label>
            <select value={form.to} onChange={h('to')} className="input-field">{COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}</select>
          </div>
          <div className="col-span-2">
            <label className="label-sm">Income Type</label>
            <select value={form.incomeType} onChange={h('incomeType')} className="input-field">{INCOME_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</select>
          </div>
          <div>
            <label className="label-sm">Article No.</label>
            <input value={form.article} onChange={h('article')} className="input-field" placeholder="Art. 12" />
          </div>
          <div>
            <label className="label-sm">Status</label>
            <select value={form.status} onChange={h('status')} className="input-field">
              <option>Active</option><option>Under Review</option><option>Suspended</option>
            </select>
          </div>
          <div>
            <label className="label-sm">Domestic WHT %</label>
            <input type="number" value={form.domesticRate} onChange={h('domesticRate')} className="input-field" min="0" max="100" />
          </div>
          <div>
            <label className="label-sm">Treaty WHT %</label>
            <input type="number" value={form.treatyRate} onChange={h('treatyRate')} className="input-field" min="0" max="100" />
          </div>
          <div className="col-span-2">
            <label className="label-sm">Legal Note</label>
            <textarea value={form.legalNote} onChange={h('legalNote')} className="input-field resize-none" rows={3} />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => onSave(form)} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {treaty?._id ? 'Update' : 'Save Treaty'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function TreatyRules({ showToast, setApiStatus }) {
  const [treaties, setTreaties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | treaty object (edit)
  const [deleting, setDeleting] = useState(null);

  async function fetchTreaties() {
    setLoading(true);
    try {
      const data = await apiFetch('/api/v1/treaties');
      setTreaties(Array.isArray(data) ? data : []);
      setApiStatus('connected');
    } catch {
      setApiStatus('fallback');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchTreaties(); }, []);

  async function saveTreaty(form) {
    setSaving(true);
    try {
      if (modal?._id) {
        await apiFetch(`/api/v1/treaties/${modal._id}`, { method: 'PUT', body: JSON.stringify(form) });
        showToast('Treaty updated!', 'success');
      } else {
        await apiFetch('/api/v1/treaties', { method: 'POST', body: JSON.stringify(form) });
        showToast('Treaty added!', 'success');
      }
      setModal(null);
      await fetchTreaties();
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function deleteTreaty(id) {
    setDeleting(id);
    try {
      await apiFetch(`/api/v1/treaties/${id}`, { method: 'DELETE' });
      showToast('Treaty deleted', 'success');
      await fetchTreaties();
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setDeleting(null);
    }
  }

  const filtered = treaties.filter(t => {
    const q = search.toLowerCase();
    return (
      t.from?.toLowerCase().includes(q) ||
      t.to?.toLowerCase().includes(q) ||
      t.incomeType?.toLowerCase().includes(q) ||
      t.article?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <span className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow">
                <BookOpen className="w-5 h-5 text-white" />
              </span>
              Bilateral DTAA Treaty Registry
            </h2>
            <p className="text-gray-500 mt-1">Active treaty withholding rates synced with MongoDB</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="input-field pl-9 w-56"
                placeholder="Search treaties..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button onClick={() => setModal({})} className="btn-primary flex items-center gap-2 whitespace-nowrap">
              <Plus className="w-4 h-4" /> Add Treaty
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass rounded-3xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">
              {treaties.length === 0 ? 'No treaties found. Add your first treaty!' : 'No treaties match your search.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-white/40">
                  {['Corridor', 'Income Type', 'Article', 'Domestic WHT', 'Treaty WHT', 'Savings', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <AnimatePresence>
                  {filtered.map((t, i) => {
                    const savings = t.domesticRate - t.treatyRate;
                    return (
                      <motion.tr
                        key={t._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-white/60 transition-colors group"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{t.from} → {t.to}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{t.incomeType}</td>
                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">{t.article}</td>
                        <td className="px-4 py-3 text-red-500 font-semibold">{t.domesticRate}%</td>
                        <td className="px-4 py-3 text-blue-500 font-semibold">{t.treatyRate}%</td>
                        <td className="px-4 py-3">
                          <span className={`font-bold ${savings > 0 ? 'text-emerald-600' : 'text-gray-500'}`}>
                            {savings > 0 ? `${savings}%` : '0%'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                            t.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                            t.status === 'Suspended' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'
                          }`}>{t.status || 'Active'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setModal(t)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteTreaty(t._id)}
                              disabled={deleting === t._id}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                            >
                              {deleting === t._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            </button>
                          </div>
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

      <AnimatePresence>
        {modal !== null && (
          <TreatyModal
            treaty={modal?._id ? modal : null}
            onClose={() => setModal(null)}
            onSave={saveTreaty}
            loading={saving}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
