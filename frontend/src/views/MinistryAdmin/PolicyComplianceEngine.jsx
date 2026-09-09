import React, { useState } from 'react';
import {
  Scale,
  FileCheck,
  Download,
  AlertTriangle,
  CheckCircle,
  FileText,
  Printer,
  Calendar,
  Layers,
  Sparkles,
  Check
} from 'lucide-react';
import { mockPolicyCompliance } from './mockMinistryData';

export default function PolicyComplianceEngine() {
  const [downloadSuccess, setDownloadSuccess] = useState('');

  const triggerExport = (format) => {
    setDownloadSuccess(`Generated official Parliamentary Review Audit Report (${format.toUpperCase()}) successfully.`);
    setTimeout(() => setDownloadSuccess(''), 4000);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-6 h-6 text-teal-800" />
            <h2 className="text-xl font-black text-slate-900 uppercase">
              Policy Compliance & Statutory Mandates
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict automated tracking of the 45-Day Sanction SLA and Statutory SC (15%) & ST (7.5%) Quota Allocations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-teal-700" />
            <span>MPLADS 2023 Guidelines Enforced</span>
          </span>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* ── Top Grid: 45-Day SLA Tracker & SC/ST Quotas ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. 45-Day Sanction Limit Compliance Gauge */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase">
                45-Day Mandatory Sanction Limit SLA
              </h3>
              <p className="text-xs text-slate-500">
                Statutory requirement for District Authorities to sanction or reject MP proposals
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-teal-800">
              Clause 4.2
            </span>
          </div>

          <div className="flex items-center gap-6 pt-2">
            {/* Circular Gauge Representation */}
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#e2e8f0"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#247b93"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 * (1 - mockPolicyCompliance.overall45DayCompliance / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-black text-slate-900">
                  {mockPolicyCompliance.overall45DayCompliance}%
                </span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">Compliant</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 flex-1">
              <p className="leading-relaxed">
                Nationwide, <strong>{mockPolicyCompliance.overall45DayCompliance}%</strong> of district administrations dispose of recommendations within the mandatory 45-day window.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-slate-400">Average Turnaround</div>
                  <div className="font-bold text-slate-900 mt-0.5">31.4 Days</div>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-slate-400">Escalated Breaches</div>
                  <div className="font-bold text-amber-600 mt-0.5">48 Proposals</div>
                </div>
              </div>
            </div>
          </div>

          {/* State SLA Rankings */}
          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase mb-2">State SLA Performance</h4>
            <div className="space-y-1.5">
              {mockPolicyCompliance.stateSlaRankings.map((st) => (
                <div key={st.state} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                  <span className="font-semibold text-slate-800">{st.state}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">{st.avgDays} days avg</span>
                    <span className={`font-mono font-bold ${
                      st.compliance >= 90 ? 'text-emerald-600' : st.compliance >= 80 ? 'text-teal-600' : 'text-red-600'
                    }`}>
                      {st.compliance}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. SC / ST Statutory Quota Monitor */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase">
                Statutory Social Justice Quotas
              </h3>
              <p className="text-xs text-slate-500">
                Enforcing mandatory 15% (Scheduled Caste) and 7.5% (Scheduled Tribe) expenditure
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-teal-800">
              Clause 2.3
            </span>
          </div>

          {/* SC Quota Progress Bar */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">Scheduled Caste (SC) Quota</span>
              <span className="font-mono font-bold text-emerald-700">
                {mockPolicyCompliance.scQuotaAchieved}% <span className="text-slate-400 font-normal">/ Target: {mockPolicyCompliance.scQuotaTarget}%</span>
              </span>
            </div>
            <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${(mockPolicyCompliance.scQuotaAchieved / 20) * 100}%` }}
              />
              {/* Target Marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-black"
                style={{ left: `${(mockPolicyCompliance.scQuotaTarget / 20) * 100}%` }}
                title="Mandatory 15% Target"
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0%</span>
              <span className="font-bold text-slate-700">Target: 15%</span>
              <span>20%</span>
            </div>
          </div>

          {/* ST Quota Progress Bar */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">Scheduled Tribe (ST) Quota</span>
              <span className="font-mono font-bold text-emerald-700">
                {mockPolicyCompliance.stQuotaAchieved}% <span className="text-slate-400 font-normal">/ Target: {mockPolicyCompliance.stQuotaTarget}%</span>
              </span>
            </div>
            <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-teal-600 rounded-full transition-all duration-500"
                style={{ width: `${(mockPolicyCompliance.stQuotaAchieved / 12) * 100}%` }}
              />
              {/* Target Marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-black"
                style={{ left: `${(mockPolicyCompliance.stQuotaTarget / 12) * 100}%` }}
                title="Mandatory 7.5% Target"
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0%</span>
              <span className="font-bold text-slate-700">Target: 7.5%</span>
              <span>12%</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Both statutory allocations satisfy mandatory parliamentary thresholds at national aggregate.</span>
          </div>
        </div>
      </div>

      {/* ── Automated Audit Exporter for Parliament Review ──── */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase">
              Automated Audit Exporter for Parliamentary Review
            </h3>
            <p className="text-xs text-slate-500">
              Generate standardized MoSPI compliance dossiers, SoR discrepancy logs, and expenditure reconciliation reports
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerExport('csv')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer border border-slate-300 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export CSV Data</span>
            </button>

            <button
              onClick={() => triggerExport('pdf')}
              className="px-4 py-2 bg-[#1b5c74] hover:bg-[#154b5f] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-amber-300" />
              <span>Download PDF Dossier</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-bold text-xs text-slate-900">Parliamentary Standing Committee</div>
            <p className="text-[11px] text-slate-500">Full annual entitlement utilization dossiers per state.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-bold text-xs text-slate-900">Comptroller & Auditor General (CAG)</div>
            <p className="text-[11px] text-slate-500">High-risk anomalies, cartel bidding, and duplicate work flags.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-bold text-xs text-slate-900">Citizen Transparency RTI Pack</div>
            <p className="text-[11px] text-slate-500">Public work logs, sanctioned costs, and ground photographic proof.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
