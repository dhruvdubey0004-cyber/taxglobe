import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, LogIn, UserPlus, KeyRound, CheckCircle2, Loader2, Send } from 'lucide-react';
import { apiFetch } from '../utils';

export default function AuthModal({ onClose, onLogin, showToast }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  // OTP states (register only)
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [verifiedOtpCode, setVerifiedOtpCode] = useState('');

  // Cooldown timer for resend
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = setTimeout(() => setOtpCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [otpCooldown]);

  const handle = (k) => (e) => {
    const val = e.target.value;
    setForm(f => ({ ...f, [k]: val }));
    // Reset OTP if email changes
    if (k === 'email' && otpSent) {
      setOtpSent(false);
      setOtpVerified(false);
      setOtpValue('');
      setOtpError('');
      setVerifiedOtpCode('');
    }
  };

  function switchMode(m) {
    setMode(m);
    setForm({ name: '', email: '', password: '' });
    setOtpSent(false);
    setOtpVerified(false);
    setOtpValue('');
    setOtpError('');
    setOtpCooldown(0);
    setVerifiedOtpCode('');
  }

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
        showToast('OTP sent to your email! Check inbox & spam.', 'success');
        // Dev mode: auto-fill OTP
        if (res.devOtp) {
          setOtpValue(res.devOtp);
        }
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
        setVerifiedOtpCode(otpValue);
        setOtpError('');
        showToast('Email verified successfully! ✅', 'success');
      }
    } catch (err) {
      setOtpError(err.message || 'Invalid or expired OTP');
    } finally {
      setOtpLoading(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'register') {
        if (!otpVerified) {
          showToast('Please verify your email with OTP first', 'error');
          setLoading(false);
          return;
        }
        await apiFetch('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            role: 'User',
            otpCode: verifiedOtpCode,
          }),
        });
        showToast('Account created & email verified! Please log in.', 'success');
        switchMode('login');
        setForm(f => ({ ...f, email: form.email }));
      } else {
        const data = await apiFetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        localStorage.setItem('taxglobe_token', data.token);
        localStorage.setItem('taxglobe_user', JSON.stringify(data.user));
        onLogin(data.user);
        showToast(`Welcome back, ${data.user.name}!`, 'success');
        onClose();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
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
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="glass rounded-3xl p-6 sm:p-8 w-full max-w-md"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {mode === 'login' ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">TaxGlobe DTAA Platform</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="flex glass-sm rounded-xl p-1 mb-6">
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  mode === m ? 'bg-white shadow text-emerald-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {m === 'login' ? 'Log In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {/* Name (register only) */}
            {mode === 'register' && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input className="input-field pl-10" placeholder="Full name" value={form.name} onChange={handle('name')} autoComplete="off" required />
              </div>
            )}

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className={`input-field pl-10 ${mode === 'register' && otpVerified ? 'pr-10 border-emerald-400 bg-emerald-50/50' : ''}`}
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={handle('email')}
                autoComplete="off"
                required
                disabled={mode === 'register' && otpVerified}
              />
              {mode === 'register' && otpVerified && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
              )}
            </div>

            {/* OTP Section (register only) */}
            {mode === 'register' && !otpVerified && (
              <div className="space-y-3">
                {/* Send OTP Button */}
                {!otpSent ? (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={otpLoading || !form.email.trim()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium text-sm hover:bg-emerald-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {otpLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Send OTP to Email
                  </button>
                ) : (
                  <>
                    {/* OTP Input + Verify */}
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <KeyRound className="w-4 h-4 text-emerald-600" />
                        Enter 6-Digit OTP sent to email
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="● ● ● ● ● ●"
                          value={otpValue}
                          onChange={(e) => { setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6)); setOtpError(''); }}
                          className="input-field flex-1 text-center text-lg tracking-[0.5em] font-mono font-bold"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOTP}
                          disabled={otpLoading || otpValue.length !== 6}
                          className="btn-primary px-5 py-2.5 text-sm flex items-center gap-1.5 whitespace-nowrap"
                        >
                          {otpLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                          Verify
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">OTP valid for 5 minutes. Check inbox & spam folder.</span>
                        <button
                          type="button"
                          onClick={handleSendOTP}
                          disabled={otpCooldown > 0 || otpLoading}
                          className="text-emerald-600 hover:text-emerald-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {otpCooldown > 0 ? `Resend (${otpCooldown}s)` : 'Resend'}
                        </button>
                      </div>
                    </div>
                  </>
                )}
                {otpError && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <X className="w-3 h-3" /> {otpError}
                  </p>
                )}
              </div>
            )}

            {/* Verified badge (register mode) */}
            {mode === 'register' && otpVerified && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-sm text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Email verified successfully!
              </div>
            )}

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input className="input-field pl-10" type="password" placeholder="Password" value={form.password} onChange={handle('password')} autoComplete="new-password" required />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (mode === 'register' && !otpVerified)}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                mode === 'register' && !otpVerified
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'btn-primary'
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : mode === 'login' ? (
                <><LogIn className="w-4 h-4" /> Log In</>
              ) : (
                <><UserPlus className="w-4 h-4" /> Create Account</>
              )}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
