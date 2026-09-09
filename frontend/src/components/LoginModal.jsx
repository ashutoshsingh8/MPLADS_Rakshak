import { useState } from 'react';
import { X, Lock, User as UserIcon, AlertCircle, CheckCircle2, Shield } from 'lucide-react';
import { login } from '../services/api';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Preset demo accounts for evaluators & department users
  const demoAccounts = [
    { label: 'Ministry Admin', user: 'ministry_admin', pass: 'admin123', badge: 'National' },
    { label: 'District Authority', user: 'da_pune', pass: 'admin123', badge: 'District (Pune)' },
    { label: 'Member of Parliament', user: 'mp_pune', pass: 'admin123', badge: 'Constituency (Pune)' },
    { label: 'Contractor', user: 'contractor_abc', pass: 'admin123', badge: 'Executing Agency' },
  ];

  const handleSelectDemo = (acc) => {
    setUsername(acc.user);
    setPassword(acc.pass);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.');
      return;
    }

    setLoading(true);
    try {
      const data = await login(username.trim(), password.trim());
      if (data && data.access_token) {
        onLoginSuccess && onLoginSuccess(data);
        onClose();
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.detail || 'Invalid username or password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Login Card - Styled exactly like the provided design */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-scale-up">
        {/* Header Strip */}
        <div className="bg-[#0f2e52] px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <span className="text-xs tracking-wider text-slate-300 font-semibold uppercase">
              Department Access
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {/* Card Title matching screenshot */}
          <h2 className="text-xl sm:text-2xl font-black text-center text-slate-800 tracking-wide mb-6">
            LOGIN FORM
          </h2>

          {/* Quick Demo Selector */}
          <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
              Quick Role Login (Click to Auto-fill)
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.user}
                  type="button"
                  onClick={() => handleSelectDemo(acc)}
                  className={`text-left p-2 rounded-lg border text-xs transition cursor-pointer ${
                    username === acc.user
                      ? 'bg-teal-50 border-teal-500 text-teal-900 font-semibold shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-semibold">{acc.label}</div>
                  <div className="text-[10px] text-slate-500">{acc.badge}</div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                User
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username or email"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 border-slate-300 w-3.5 h-3.5 cursor-pointer"
                />
                <span>Keep me logged in</span>
              </label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Default demo accounts password is: admin123');
                }}
                className="text-teal-700 hover:text-teal-900 hover:underline"
              >
                Forgot password?
              </a>
            </div>

            {/* Buttons matching design: REGISTER (outline) & SUBMIT (solid teal) */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => {
                  alert('For SIH Evaluation: Use the 4 preset role accounts above (password: admin123).');
                }}
                className="flex-1 py-2.5 px-4 text-xs sm:text-sm font-bold tracking-wider rounded-lg border border-[#1c6877] text-[#1c6877] bg-[#f0f8f8] hover:bg-[#e2f2f2] transition text-center uppercase cursor-pointer"
              >
                REGISTER
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 px-4 text-xs sm:text-sm font-bold tracking-wider rounded-lg bg-[#1c6877] hover:bg-[#15505c] text-white shadow-md transition text-center uppercase cursor-pointer disabled:opacity-50"
              >
                {loading ? 'LOGGING IN...' : 'SUBMIT'}
              </button>
            </div>
          </form>
        </div>

        {/* Card Footer info */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 text-center text-[11px] text-slate-500">
          Protected by Government of India authentication security
        </div>
      </div>
    </div>
  );
}
