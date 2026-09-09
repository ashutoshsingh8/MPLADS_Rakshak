import React, { useState } from 'react';
import { Search, User, ChevronDown, ArrowLeft, LogOut, Bell, Shield, CheckCircle } from 'lucide-react';
import { mockMpProfile } from '../../mock/mpDashboardData';

export default function MPHeader({ onExitToPublic, onLogout, onSearch }) {
  const [searchValue, setSearchValue] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchValue);
  };

  return (
    <header className="bg-[#5b21b6] text-white px-4 sm:px-6 py-3 shadow-md flex items-center justify-between sticky top-0 z-40 border-b border-purple-700/40 select-none">
      {/* ── Left: Parliament / Sansad Emblem & Title ───────── */}
      <div className="flex items-center gap-3">
        {/* Sansad circular emblem SVG */}
        <div className="w-10 h-10 flex items-center justify-center bg-purple-900/60 rounded-full p-1 border border-purple-400/40 shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-amber-300">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" />
            <circle cx="50" cy="50" r="14" fill="currentColor" />
            {/* Parliament colonnade pillars motif */}
            <path d="M25 65 L25 45 M35 65 L35 45 M45 65 L45 45 M55 65 L55 45 M65 65 L65 45 M75 65 L75 45" stroke="currentColor" strokeWidth="3" />
            <path d="M20 45 L80 45 L50 22 Z" fill="currentColor" />
            <text x="50" y="85" textAnchor="middle" fontSize="9" fontWeight="bold" fill="currentColor">लोक सभा</text>
          </svg>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
              MEMBER OF PARLIAMENT PORTAL
            </h1>
            <span className="hidden lg:inline-flex items-center text-[10px] font-bold bg-purple-900/80 text-purple-200 border border-purple-400/30 px-2 py-0.5 rounded-full">
              {mockMpProfile.constituency}
            </span>
          </div>
          <p className="text-[10px] text-purple-200 tracking-wider">
            MPLAD Rakshak • Constitutional Decision & Recommendation Support System
          </p>
        </div>
      </div>

      {/* ── Center-Right: Purple-Tinted Search Bar ─────────── */}
      <div className="flex items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
          <Search className="w-4 h-4 text-purple-200 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search projects, sanctions, works..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="bg-purple-700/50 hover:bg-purple-700/65 focus:bg-purple-700/80 text-white placeholder-purple-200 text-xs rounded-xl pl-9 pr-4 py-2 w-64 lg:w-80 outline-none border border-purple-500/30 focus:border-purple-300 transition shadow-inner"
          />
        </form>

        {/* Exit to Public Portal Action */}
        {onExitToPublic && (
          <button
            onClick={onExitToPublic}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-900/60 hover:bg-purple-900 text-white text-xs font-semibold rounded-lg transition border border-purple-400/30 cursor-pointer shadow-xs"
            title="Return to public portal"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit to Public Portal</span>
          </button>
        )}

        {/* MP Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 bg-purple-900/60 hover:bg-purple-900 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-purple-400/30 transition cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-amber-400 text-purple-950 font-black text-xs flex items-center justify-center border border-white/40">
              VP
            </div>
            <div className="text-left hidden lg:block">
              <div className="text-xs font-bold text-white leading-none">{mockMpProfile.name}</div>
              <div className="text-[10px] text-purple-200 leading-none mt-0.5">Hon'ble MP (Pune)</div>
            </div>
            <ChevronDown className="w-4 h-4 text-purple-200" />
          </button>

          {/* Profile Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 text-slate-800 z-50 text-xs space-y-2 animate-fade-in">
              <div className="p-2 bg-purple-50 rounded-lg border border-purple-100">
                <div className="font-bold text-purple-900">{mockMpProfile.name}</div>
                <div className="text-[10px] text-purple-700">{mockMpProfile.role}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-1">
                  Annual Entitlement: ₹{mockMpProfile.entitlementCr} Cr
                </div>
              </div>

              <div className="pt-1 space-y-1">
                <button
                  onClick={() => { setDropdownOpen(false); onExitToPublic && onExitToPublic(); }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center gap-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Public Transparency Portal</span>
                </button>

                {onLogout && (
                  <button
                    onClick={() => { setDropdownOpen(false); onLogout(); }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-red-50 text-red-600 font-semibold flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
