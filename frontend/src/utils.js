// Shared API helper — used across all components
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('taxglobe_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    if (res.status === 401) {
      // Clear expired / invalid token
      localStorage.removeItem('taxglobe_token');
      localStorage.removeItem('taxglobe_user');
    }
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export const COUNTRIES = [
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'UAE', name: 'UAE', flag: '🇦🇪' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
];

export const INCOME_TYPES = [
  { id: 'Royalty', label: 'Royalty (SaaS / IP)' },
  { id: 'FTS', label: 'Fees for Technical Services' },
  { id: 'Dividends', label: 'Dividends' },
  { id: 'Interest', label: 'Interest' },
  { id: 'CapitalGains', label: 'Capital Gains' },
];

export function formatCurrency(n) {
  if (!n && n !== 0) return '—';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${Number(n).toLocaleString('en-IN')}`;
}
