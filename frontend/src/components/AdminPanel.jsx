import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Users, FileText, KeyRound, Globe, Layers,
  Trash2, RefreshCw, Search, CheckCircle2, XCircle, AlertTriangle,
  Lock, TrendingUp, Filter, Phone, Mail, ChevronRight, Shield,
  UserPlus, Plus, X, Loader2
} from 'lucide-react';
import { apiFetch, formatCurrency } from '../utils';

export default function AdminPanel({ user, onOpenAuth, showToast }) {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [onboardingList, setOnboardingList] = useState([]);
  const [otpList, setOtpList] = useState([]);
  const [treatyList, setTreatyList] = useState([]);
  const [simulationList, setSimulationList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Add User Modal State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Founder',
  });
  const [creatingUser, setCreatingUser] = useState(false);

  const isAdmin = user && user.role === 'Admin';

  async function loadAllAdminData() {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [statsRes, usersRes, onbRes, otpsRes, treatiesRes, simsRes] = await Promise.allSettled([
        apiFetch('/api/admin/stats'),
        apiFetch('/api/admin/users'),
        apiFetch('/api/admin/onboarding'),
        apiFetch('/api/admin/otps'),
        apiFetch('/api/admin/treaties'),
        apiFetch('/api/admin/simulations'),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
        setStats(statsRes.value.data);
      }
      if (usersRes.status === 'fulfilled' && usersRes.value?.data) {
        setUsersList(usersRes.value.data);
      }
      if (onbRes.status === 'fulfilled' && onbRes.value?.data) {
        setOnboardingList(onbRes.value.data);
      }
      if (otpsRes.status === 'fulfilled' && otpsRes.value?.data) {
        setOtpList(otpsRes.value.data);
      }
      if (treatiesRes.status === 'fulfilled' && treatiesRes.value?.data) {
        setTreatyList(treatiesRes.value.data);
      }
      if (simsRes.status === 'fulfilled' && simsRes.value?.data) {
        setSimulationList(simsRes.value.data);
      }
    } catch (err) {
      showToast?.(`Error loading admin data: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAllAdminData();
  }, [user]);

  // Actions
  async function handleRoleChange(userId, newRole) {
    try {
      const res = await apiFetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      });
      if (res.success) {
        showToast?.(`User role updated to ${newRole}`, 'success');
        setUsersList(prev => prev.map(u => (u._id === userId ? { ...u, role: newRole } : u)));
      }
    } catch (err) {
      showToast?.(`Failed to update role: ${err.message}`, 'error');
    }
  }

  async function handleDeleteUser(userId) {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await apiFetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      showToast?.('User deleted', 'success');
      setUsersList(prev => prev.filter(u => u._id !== userId));
    } catch (err) {
      showToast?.(`Delete failed: ${err.message}`, 'error');
    }
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    if (!newUserForm.name.trim() || !newUserForm.email.trim() || !newUserForm.password) {
      showToast?.('Please fill in name, email, and password', 'error');
      return;
    }
    if (newUserForm.password.length < 6) {
      showToast?.('Password must be at least 6 characters', 'error');
      return;
    }
    setCreatingUser(true);
    try {
      const res = await apiFetch('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(newUserForm),
      });
      if (res.success) {
        showToast?.(`User "${res.data.name}" added successfully!`, 'success');
        setUsersList(prev => [res.data, ...prev]);
        setShowAddUserModal(false);
        setNewUserForm({ name: '', email: '', password: '', role: 'Founder' });
      }
    } catch (err) {
      showToast?.(err.message || 'Failed to add user', 'error');
    } finally {
      setCreatingUser(false);
    }
  }

  async function handleDeleteOnboarding(id) {
    if (!window.confirm('Delete this onboarding lead entry?')) return;
    try {
      await apiFetch(`/api/admin/onboarding/${id}`, { method: 'DELETE' });
      showToast?.('Onboarding entry deleted', 'success');
      setOnboardingList(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      showToast?.(`Delete failed: ${err.message}`, 'error');
    }
  }

  async function handleDeleteOtp(id) {
    try {
      await apiFetch(`/api/admin/otps/${id}`, { method: 'DELETE' });
      showToast?.('OTP entry removed', 'success');
      setOtpList(prev => prev.filter(o => o._id !== id));
    } catch (err) {
      showToast?.(`Delete failed: ${err.message}`, 'error');
    }
  }

  // If not logged in as admin
  if (!user || user.role !== 'Admin') {
    return (
      <div className="max-w-md mx-auto my-16 px-4">
        <div className="glass rounded-3xl p-8 text-center shadow-xl border border-white/80">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Admin Portal Restricted</h3>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            {user
              ? `You are logged in as "${user.name}" (${user.role}). Only users with "Admin" privilege can access the TaxGlobe control center.`
              : 'Please sign in with an Admin account to manage users, onboarding leads, treaties, and security audit logs.'}
          </p>
          <button
            onClick={onOpenAuth}
            className="btn-primary w-full py-3 shadow-md flex items-center justify-center gap-2 text-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            {user ? 'Switch / Sign in as Admin' : 'Sign In as Admin'}
          </button>
        </div>
      </div>
    );
  }

  const navTabs = [
    { id: 'overview', label: 'Dashboard Overview', icon: TrendingUp },
    { id: 'users', label: `Users (${usersList.length})`, icon: Users },
    { id: 'onboarding', label: `Onboarding Leads (${onboardingList.length})`, icon: FileText },
    { id: 'otps', label: `OTP Audits (${otpList.length})`, icon: KeyRound },
    { id: 'treaties', label: `Treaties (${treatyList.length})`, icon: Globe },
    { id: 'simulations', label: `Simulations (${simulationList.length})`, icon: Layers },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Header */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
              <Shield className="w-3.5 h-3.5 text-emerald-700" /> Super Admin Portal
            </span>
            <span className="text-xs text-gray-400">Live Production Control</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            TaxGlobe Central Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Real-time management for users, cross-border onboarding submissions, DTAA treaty corridors, and security verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAllAdminData}
            disabled={loading}
            className="btn-secondary py-2 px-4 text-xs font-bold flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Sub navigation bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {navTabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeSubTab === id;
          return (
            <button
              key={id}
              onClick={() => { setActiveSubTab(id); setSearchQuery(''); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                  : 'bg-white/80 text-gray-600 border-gray-200/80 hover:bg-white hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass p-5 rounded-2xl border border-white/80 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-gray-900">{usersList.length}</div>
              <div className="text-xs font-semibold text-gray-500">Registered Accounts</div>
              <div className="text-[11px] text-blue-600 font-medium mt-1">Founders, CAs & Admins</div>
            </div>

            <div className="glass p-5 rounded-2xl border border-white/80 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-gray-900">{onboardingList.length}</div>
              <div className="text-xs font-semibold text-gray-500">Onboarding Submissions</div>
              <div className="text-[11px] text-emerald-600 font-medium mt-1">
                {onboardingList.filter(o => o.emailVerified).length} Verified with OTP
              </div>
            </div>

            <div className="glass p-5 rounded-2xl border border-white/80 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                <Globe className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-gray-900">{treatyList.length}</div>
              <div className="text-xs font-semibold text-gray-500">DTAA Bilateral Treaties</div>
              <div className="text-[11px] text-purple-600 font-medium mt-1">US, SG, UAE, UK, etc.</div>
            </div>

            <div className="glass p-5 rounded-2xl border border-white/80 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <Layers className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-gray-900">{simulationList.length}</div>
              <div className="text-xs font-semibold text-gray-500">Entity Simulations</div>
              <div className="text-[11px] text-amber-600 font-medium mt-1">HoldCo & IP Structuring</div>
            </div>
          </div>

          {/* Breakdown cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass rounded-3xl p-6 border border-white/80 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" /> Users Role Distribution
              </h3>
              <div className="space-y-2">
                {['Admin', 'CA', 'Founder'].map(role => {
                  const count = usersList.filter(u => u.role === role).length;
                  const pct = usersList.length ? Math.round((count / usersList.length) * 100) : 0;
                  return (
                    <div key={role} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 border border-gray-100">
                      <span className="text-xs font-bold text-gray-800">{role}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">{count} users ({pct}%)</span>
                        <div className="w-24 bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass rounded-3xl p-6 border border-white/80 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" /> Onboarding by Business Segment
              </h3>
              <div className="space-y-2">
                {['SaaS', 'Agency', 'Freelancer', 'Export'].map(type => {
                  const count = onboardingList.filter(o => o.businessType === type).length;
                  const pct = onboardingList.length ? Math.round((count / onboardingList.length) * 100) : 0;
                  return (
                    <div key={type} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 border border-gray-100">
                      <span className="text-xs font-bold text-gray-800">{type}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">{count} submissions ({pct}%)</span>
                        <div className="w-24 bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-teal-500 h-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. USERS TAB */}
      {activeSubTab === 'users' && (
        <div className="glass rounded-3xl p-6 border border-white/80 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Registered Users</h3>
              <p className="text-xs text-gray-500">Manage user roles and platform access credentials.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="input-field pl-9 py-2 text-xs w-48 sm:w-60"
                />
              </div>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="btn-primary py-2 px-3.5 text-xs flex items-center gap-1.5 shadow-sm whitespace-nowrap"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add User</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200/80 text-gray-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">User</th>
                  <th className="py-3 px-3">Email</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Joined</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usersList
                  .filter(u =>
                    !searchQuery ||
                    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(u => (
                    <tr key={u._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                            {u.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <span className="font-bold text-gray-900">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-600 font-mono">{u.email}</td>
                      <td className="py-3 px-3">
                        <select
                          value={u.role}
                          onChange={e => handleRoleChange(u._id, e.target.value)}
                          className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-1 font-semibold text-gray-700"
                        >
                          <option value="Founder">Founder</option>
                          <option value="CA">CA</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-3 px-3 text-gray-400">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. ONBOARDING LEADS TAB */}
      {activeSubTab === 'onboarding' && (
        <div className="glass rounded-3xl p-6 border border-white/80 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Onboarding Submissions</h3>
              <p className="text-xs text-gray-500">Every prospect who submitted cross-border tax onboarding setup.</p>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-field pl-9 py-2 text-xs w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200/80 text-gray-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Lead / Company</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3">OTP Status</th>
                  <th className="py-3 px-3">Business Type</th>
                  <th className="py-3 px-3">Base Country</th>
                  <th className="py-3 px-3">Monthly Volume</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {onboardingList
                  .filter(item =>
                    !searchQuery ||
                    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.country?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(item => (
                    <tr key={item._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-3 font-bold text-gray-900">{item.name}</td>
                      <td className="py-3 px-3">
                        <div className="space-y-0.5">
                          {item.email && (
                            <div className="flex items-center gap-1 text-gray-600 font-mono text-[11px]">
                              <Mail className="w-3 h-3 text-gray-400" /> {item.email}
                            </div>
                          )}
                          {item.phone && (
                            <div className="flex items-center gap-1 text-gray-500 text-[11px]">
                              <Phone className="w-3 h-3 text-gray-400" /> {item.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {item.emailVerified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="w-3 h-3 text-amber-600" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md">
                          {item.businessType}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-700">{item.country}</td>
                      <td className="py-3 px-3 font-semibold text-emerald-700">{item.monthlyBilling}</td>
                      <td className="py-3 px-3 text-gray-400">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDeleteOnboarding(item._id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. OTP AUDIT TAB */}
      {activeSubTab === 'otps' && (
        <div className="glass rounded-3xl p-6 border border-white/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">OTP Security Audit Logs</h3>
              <p className="text-xs text-gray-500">
                Generated verification OTPs (auto-expire after 5 minutes in MongoDB TTL).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200/80 text-gray-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Email Address</th>
                  <th className="py-3 px-3">Active OTP Code</th>
                  <th className="py-3 px-3">Generated At</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {otpList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-400">
                      No active OTP requests right now (OTPs expire in 5 minutes).
                    </td>
                  </tr>
                ) : (
                  otpList.map(item => (
                    <tr key={item._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-3 font-mono font-medium text-gray-900">{item.email}</td>
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {item.otp}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-400">
                        {item.createdAt ? new Date(item.createdAt).toLocaleTimeString() : '—'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDeleteOtp(item._id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Revoke / Delete OTP"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TREATIES TAB */}
      {activeSubTab === 'treaties' && (
        <div className="glass rounded-3xl p-6 border border-white/80 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Configured DTAA Treaties</h3>
          <p className="text-xs text-gray-500">Treaty rules stored in MongoDB for withholding tax exemptions.</p>

          <div className="grid md:grid-cols-2 gap-4">
            {treatyList.map(t => (
              <div key={t._id} className="p-4 rounded-2xl bg-white/70 border border-gray-200/80 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-gray-900">
                    {t.countryA} ↔ {t.countryB}
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                    Active
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-gray-100">
                  <div>
                    <span className="text-gray-400 text-[10px] block">Royalty</span>
                    <span className="font-bold text-gray-800">{t.royaltyRate}%</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">FTS</span>
                    <span className="font-bold text-gray-800">{t.ftsRate}%</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">Dividends</span>
                    <span className="font-bold text-gray-800">{t.dividendRate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. SIMULATIONS TAB */}
      {activeSubTab === 'simulations' && (
        <div className="glass rounded-3xl p-6 border border-white/80 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-gray-900">User Structure Simulations</h3>
          <p className="text-xs text-gray-500">HoldCo & cross-border structure calculations executed by users.</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200/80 text-gray-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Structure / Corridor</th>
                  <th className="py-3 px-3">Entity Type</th>
                  <th className="py-3 px-3">Estimated Savings</th>
                  <th className="py-3 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {simulationList.map(s => (
                  <tr key={s._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-3 font-bold text-gray-900">{s.corridor || 'Global'}</td>
                    <td className="py-3 px-3 text-gray-700">{s.structureType || 'HoldCo'}</td>
                    <td className="py-3 px-3 font-semibold text-emerald-700">
                      {s.totalSavings ? formatCurrency(s.totalSavings) : 'Calculated'}
                    </td>
                    <td className="py-3 px-3 text-gray-400">
                      {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      <AnimatePresence>
        {showAddUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-gray-100 relative"
            >
              <button
                onClick={() => setShowAddUserModal(false)}
                className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Add New User</h3>
                  <p className="text-xs text-gray-500">Create an account with assigned privileges.</p>
                </div>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="label-sm">Full Name / Entity Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Kumar or Acme Tech"
                    value={newUserForm.name}
                    onChange={e => setNewUserForm(f => ({ ...f, name: e.target.value }))}
                    className="input-field py-2.5 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="label-sm">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={newUserForm.email}
                    onChange={e => setNewUserForm(f => ({ ...f, email: e.target.value }))}
                    className="input-field py-2.5 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="label-sm">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={newUserForm.password}
                    onChange={e => setNewUserForm(f => ({ ...f, password: e.target.value }))}
                    className="input-field py-2.5 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="label-sm">Role & Privileges *</label>
                  <select
                    value={newUserForm.role}
                    onChange={e => setNewUserForm(f => ({ ...f, role: e.target.value }))}
                    className="input-field py-2.5 text-xs sm:text-sm font-semibold"
                  >
                    <option value="Founder">Founder (Standard - DTAA & HoldCo Tools)</option>
                    <option value="CA">CA (Chartered Accountant - Advisory Access)</option>
                    <option value="Admin">Admin (Full Access - Central Dashboard & Leads)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingUser}
                    className="btn-primary py-2 px-5 text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    {creatingUser ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Create User</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
