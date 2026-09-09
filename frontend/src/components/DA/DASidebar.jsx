import {
  LayoutGrid,
  Folder,
  ClipboardCheck,
  FileText,
  FileCheck,
  MapPin,
  Settings,
  ShieldCheck,
  AlertTriangle,
  Flame,
} from 'lucide-react';

export default function DASidebar({ activeTab, setActiveTab }) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutGrid,
      desc: 'District Management Overview',
    },
    {
      id: 'pipeline',
      label: 'Project Portfolio',
      secondaryLabel: 'Proposal Pipeline',
      icon: Folder,
      desc: '45-Day SLA Clearance Inbox',
      badge: '3 Critical',
      badgeColor: 'bg-red-500 text-white',
    },
    {
      id: 'inspections',
      label: 'Site Inspections',
      secondaryLabel: 'Site Verifications',
      icon: ClipboardCheck,
      desc: 'Anti-Morphing EXIF Checks',
      badge: '5 Flagged',
      badgeColor: 'bg-amber-400 text-slate-900',
    },
    {
      id: 'work-orders',
      label: 'Work Order Status',
      secondaryLabel: 'AI Scrutiny & BOQ',
      icon: FileText,
      desc: 'Technical Sanctions (TS)',
    },
    {
      id: 'utilization',
      label: 'Utilization Certificate',
      secondaryLabel: 'Fund Releases',
      icon: FileCheck,
      desc: 'Milestone Authorization',
    },
    {
      id: 'maps',
      label: 'Local Maps',
      icon: MapPin,
      desc: 'GIS Duplicate Asset Radar',
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: Settings,
      desc: 'District Config & Quotas',
    },
  ];

  return (
    <aside className="w-64 bg-[#0f4a40] text-white flex flex-col justify-between border-r border-[#0b3830] flex-shrink-0 min-h-[calc(100vh-53px)] select-none">
      {/* Navigation Links */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-teal-200/60">
          OPERATIONAL WORKFLOW
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[#175b4e] text-white shadow-xs font-bold'
                  : 'text-teal-100/75 hover:bg-[#134e43] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    isActive ? 'text-[#34d399]' : 'text-teal-300/80'
                  }`}
                />
                <div className="text-left">
                  <div className="leading-tight">{item.label}</div>
                  {item.secondaryLabel && (
                    <div className="text-[10px] text-teal-200/50 font-normal leading-none mt-0.5">
                      {item.secondaryLabel}
                    </div>
                  )}
                </div>
              </div>

              {item.badge && (
                <span
                  className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${item.badgeColor} shadow-xs`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Collectorate Statutory Badge & SLA Enforcement Box */}
      <div className="p-3 m-3 rounded-xl bg-[#0b3830] border border-teal-900/50 text-[11px] text-teal-100/80 space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-white">
          <ShieldCheck className="w-3.5 h-3.5 text-[#34d399]" />
          <span>Statutory Authority</span>
        </div>
        <p className="text-[10px] text-teal-200/70 leading-relaxed">
          Under MPLADS 2023 Guidelines Clause 4.2, the District Authority is mandated to sanction eligible works within 45 days.
        </p>
        <div className="pt-1 flex items-center justify-between text-[10px] text-teal-300 font-mono">
          <span>Active Quota:</span>
          <span className="font-bold text-emerald-400">16.2% SC / 8.1% ST</span>
        </div>
      </div>
    </aside>
  );
}
