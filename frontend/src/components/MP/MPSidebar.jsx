import React from 'react';
import {
  Users,
  CheckSquare,
  Wallet,
  ShieldCheck,
  MapPin,
  Camera,
  HelpCircle,
  PlusCircle,
  Clock,
  ChevronRight,
  Landmark
} from 'lucide-react';

export default function MPSidebar({ activeTab, onTabChange, onOpenNewProposal, pendingBreachCount = 1 }) {
  const menuItems = [
    {
      id: 'nominations',
      label: 'MP NOMINATIONS',
      icon: Users,
      desc: 'Track recommended works & letters',
    },
    {
      id: 'approved',
      label: 'APPROVED WORKS',
      icon: CheckSquare,
      desc: 'AS & TS sanctioned infrastructure',
    },
    {
      id: 'funding',
      label: 'FUNDING SUMMARY',
      icon: Wallet,
      desc: '₹5 Crore allocation & disbursal',
    },
    {
      id: 'prerequisites',
      label: 'PRE-REQUISITES CHECKS',
      icon: ShieldCheck,
      badge: pendingBreachCount ? 'SLA Alert' : null,
      desc: '45-day countdown & SC/ST quota',
    },
    {
      id: 'map',
      label: 'CONSTITUENCY MAP',
      icon: MapPin,
      desc: 'GIS spatial asset tracking',
    },
    {
      id: 'photos',
      label: 'SITE UPDATES (PHOTOS)',
      icon: Camera,
      desc: 'EXIF verified contractor photos',
    },
    {
      id: 'help',
      label: 'HELP',
      icon: HelpCircle,
      desc: 'DM & MoSPI escalation desk',
    },
  ];

  return (
    <aside className="w-64 bg-[#4c1d95] text-white flex flex-col justify-between shrink-0 shadow-xl select-none min-h-[calc(100vh-64px)] border-r border-purple-800/60">
      <div className="p-3.5 space-y-3">
        {/* New Work Recommendation CTA Button */}
        <button
          onClick={onOpenNewProposal}
          className="w-full py-2.5 px-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-purple-950 font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Recommendation</span>
        </button>

        <div className="px-3 pt-1 text-[10px] font-bold uppercase tracking-wider text-purple-200">
          Constituency Oversight
        </div>

        {/* Navigation Items */}
        <div className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold tracking-wider transition-all duration-200 cursor-pointer text-left uppercase ${
                  isActive
                    ? 'bg-white/20 text-white shadow-inner border-l-4 border-amber-300 pl-3'
                    : 'text-purple-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-purple-200'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge ? (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-400 text-purple-950">
                    {item.badge}
                  </span>
                ) : (
                  isActive && <ChevronRight className="w-3.5 h-3.5 text-purple-200 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Institutional Footer */}
      <div className="p-4 m-3 rounded-xl bg-purple-950/50 border border-purple-800/60 text-[11px] text-purple-200 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-white">
          <Landmark className="w-4 h-4 text-amber-300" />
          <span>Lok Sabha Secretariat</span>
        </div>
        <p className="text-[10px] text-purple-300 leading-tight">
          MPLADS 2023 Guidelines • 45-Day Statutory Approval Enforced.
        </p>
      </div>
    </aside>
  );
}
