import { useState } from 'react';
import Navbar from './components/Navbar';
import RoleSelector from './components/RoleSelector';
import MinistryDashboard from './views/MinistryDashboard';
import DistrictAuthorityDashboard from './views/DistrictAuthorityDashboard';
import MPDashboard from './views/MPDashboard';
import ContractorPortal from './views/ContractorPortal';

const ROLE_VIEWS = {
  MINISTRY_ADMIN: MinistryDashboard,
  DISTRICT_AUTHORITY: DistrictAuthorityDashboard,
  MP: MPDashboard,
  CONTRACTOR: ContractorPortal,
};

export default function App() {
  const [activeRole, setActiveRole] = useState('MINISTRY_ADMIN');
  const [activeView, setActiveView] = useState('dashboard');

  const DashboardView = ROLE_VIEWS[activeRole] || MinistryDashboard;

  return (
    <div className="min-h-screen bg-surface-900 gradient-mesh">
      {/* ── Navigation ─────────────────────────────────── */}
      <Navbar
        currentRole={activeRole}
        onNavigate={setActiveView}
        activeView={activeView}
      />

      {/* ── Main Content ──────────────────────────────── */}
      <main className="max-w-[1440px] mx-auto px-4 lg:px-6 py-6">
        {/* Role Selector Banner */}
        <div className="mb-6">
          <div className="glass-card p-3">
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Role</h2>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400 font-medium">LIVE</span>
              </div>
            </div>
            <RoleSelector activeRole={activeRole} onRoleChange={setActiveRole} />
          </div>
        </div>

        {/* Dashboard Content */}
        <DashboardView />
      </main>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="mt-12 border-t border-white/5 py-6 px-6">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">MPLAD Rakshak</span>
            <span>•</span>
            <span>Smart India Hackathon 2024</span>
            <span>•</span>
            <span>PS 26102</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Powered by AI + LangChain + Gemini</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              System Operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
