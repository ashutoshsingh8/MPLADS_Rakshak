import { useState } from 'react';
import { Menu, X, LogIn, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react';

export default function PublicNavbar({
  activeTab = 'home',
  onTabChange,
  onOpenLogin,
  authenticatedUser,
  onLogout,
  onOpenDashboard,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { key: 'home', label: 'Home' },
    { key: 'projects', label: 'Projects (search)' },
    { key: 'map', label: 'Analytics Map' },
    { key: 'guidelines', label: 'Guidelines' },
    { key: 'about', label: 'About' },
    { key: 'contact', label: 'Contact' },
  ];

  return (
    <header className="gov-navy-header text-white sticky top-0 z-50 shadow-md">
      {/* Top Tricolor Strip */}
      <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-white to-green-600 opacity-90" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Emblem & Portal Title */}
          <div
            onClick={() => onTabChange && onTabChange('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            {/* Ashoka Emblem SVG */}
            <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg p-1.5 border border-white/20 group-hover:bg-white/15 transition">
              <svg viewBox="0 0 100 100" className="w-full h-full fill-amber-300">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" />
                <circle cx="50" cy="50" r="12" fill="currentColor" />
                <path d="M50 15 L50 38 M50 62 L50 85 M15 50 L38 50 M62 50 L85 50" stroke="currentColor" strokeWidth="4" />
                <path d="M25 25 L40 40 M60 60 L75 75 M25 75 L40 60 M60 40 L75 25" stroke="currentColor" strokeWidth="3" />
                <text x="50" y="93" textAnchor="middle" fontSize="10" fontWeight="bold" fill="currentColor">सत्यमेव जयते</text>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5">
                  MPLAD Rakshak
                  <span className="text-[10px] font-semibold bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 px-1.5 py-0.5 rounded">
                    AI Portal
                  </span>
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-300 tracking-wider">
                Government of India • MoSPI Decision Support
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-3">
            {navItems.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onTabChange && onTabChange(item.key)}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors hover:text-white ${
                    isActive ? 'text-white' : 'text-slate-200 hover:text-white'
                  }`}
                >
                  {item.label}
                  {/* Underline bar matching image */}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-1 bg-white rounded-full transition-all" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action: Login / Authenticated State */}
          <div className="hidden md:flex items-center gap-3">
            {authenticatedUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenDashboard}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-emerald-600/80 hover:bg-emerald-600 text-white border border-emerald-400/50 shadow transition cursor-pointer"
                  title="Open Role Dashboard"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>{authenticatedUser.role.replace('_', ' ')}</span>
                </button>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/10 rounded-md border border-white/20 transition cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="navbar-login-button"
                onClick={onOpenLogin}
                className={`flex items-center gap-2 px-5 py-1.5 text-sm font-medium rounded-md transition duration-200 shadow-sm cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-white text-[#0f2e52] border-2 border-white font-semibold'
                    : 'text-white border-2 border-white/90 hover:bg-white hover:text-[#0f2e52]'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {!authenticatedUser && (
              <button
                id="mobile-login-button"
                onClick={onOpenLogin}
                className={`px-3 py-1 text-xs font-medium rounded transition cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-white text-[#0f2e52] font-semibold'
                    : 'text-white border border-white/80 hover:bg-white hover:text-[#0f2e52]'
                }`}
              >
                Login
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md text-slate-200 hover:text-white hover:bg-white/10"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a2340] border-t border-white/10 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                onTabChange && onTabChange(item.key);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === item.key
                  ? 'bg-white/15 text-white font-semibold'
                  : 'text-slate-300 hover:bg-white/10 text-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
          {authenticatedUser && (
            <div className="pt-2 border-t border-white/10 flex items-center justify-between px-3">
              <span className="text-xs text-emerald-300 font-medium">
                {authenticatedUser.full_name} ({authenticatedUser.role})
              </span>
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-red-300 hover:underline flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
