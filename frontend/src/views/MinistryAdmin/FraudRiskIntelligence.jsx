import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  FileSearch,
  Sparkles,
  ExternalLink,
  ChevronRight,
  X,
  CheckCircle,
  Copy,
  Info,
  MapPin,
  Building,
  Scale
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { mockFraudAlerts, mockRiskTrends } from './mockMinistryData';

export default function FraudRiskIntelligence() {
  const [selectedAlert, setSelectedAlert] = useState(mockFraudAlerts[0]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [alertFilter, setAlertFilter] = useState('ALL');
  const [actionSuccess, setActionSuccess] = useState('');

  const handleOpenDrawer = (alert) => {
    setSelectedAlert(alert);
    setIsDrawerOpen(true);
    setActionSuccess('');
  };

  const handleAction = (actionName) => {
    setActionSuccess(`Action initiated: ${actionName} for ${selectedAlert.projectUid}. District Authority notified.`);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const filteredAlerts = alertFilter === 'ALL'
    ? mockFraudAlerts
    : mockFraudAlerts.filter(a => a.severity === alertFilter || a.type === alertFilter);

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-black text-slate-900 uppercase">
              Fraud & Systemic Risk Intelligence
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated anomaly detection across CPWD Schedule of Rates, duplicate asset hashes, and contractor cartelization
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-red-100 text-red-800 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            4 Critical Anomalies Active
          </span>
        </div>
      </div>

      {/* ── Scheme-Level Risk Trends Line Chart (Recharts) ─── */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase">
              Scheme-Level Irregularity Trajectory (FY 2026-27)
            </h3>
            <p className="text-xs text-slate-500">
              Aggregated temporal trends in cost inflation, duplicate assets, cartel bidding, and 45-day SLA breaches
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockRiskTrends} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f2e52', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '11px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="costInflation" stroke="#e53e3e" strokeWidth={2.5} name="Cost Inflation (SoR)" activeDot={{ r: 6 }} isAnimationActive={false} />
              <Line type="monotone" dataKey="slaBreaches" stroke="#dd6b20" strokeWidth={2} name="45-Day SLA Delays" isAnimationActive={false} />
              <Line type="monotone" dataKey="duplicateAssets" stroke="#805ad5" strokeWidth={2} name="Duplicate Assets (pHash)" isAnimationActive={false} />
              <Line type="monotone" dataKey="cartelBids" stroke="#3182ce" strokeWidth={2} name="Cartel Bidding Rings" isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Critical Fraud Alerts Feed ───────────────────────── */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase">
              High-Priority Risk Alerts Feed
            </h3>
            <p className="text-xs text-slate-500">Click any alert to inspect Explainable AI (XAI) forensic reasoning</p>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            {['ALL', 'CRITICAL', 'HIGH', 'DUPLICATE_ASSET', 'BUDGET_INFLATION'].map((filter) => (
              <button
                key={filter}
                onClick={() => setAlertFilter(filter)}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer text-[11px] font-semibold ${
                  alertFilter === filter
                    ? 'bg-[#1b5c74] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => handleOpenDrawer(alert)}
              className={`p-4 rounded-xl border transition cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                selectedAlert?.id === alert.id && isDrawerOpen
                  ? 'bg-teal-50/70 border-teal-500 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    alert.severity === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                  }`}>
                    {alert.severity}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">{alert.projectUid}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-teal-600" />
                    {alert.district}, {alert.state}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900">{alert.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-1">{alert.xai.anomalySummary}</p>
              </div>

              <div className="flex items-center gap-4 shrink-0 self-end md:self-auto">
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-red-600">{alert.estimatedLoss}</div>
                  <div className="text-[10px] text-slate-400">Value at Risk</div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-teal-800 shadow-xs hover:border-teal-600">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>XAI Audit</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Slide-Out Explainable AI (XAI) Audit Drawer ─────────── */}
      {isDrawerOpen && selectedAlert && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto flex flex-col justify-between animate-slide-left p-6 space-y-6">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase">
                      Explainable AI (XAI) Audit Drawer
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Alert Ref: {selectedAlert.id} • {selectedAlert.projectUid}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Action Banner */}
              {actionSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              {/* AI Confidence Metric */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-teal-900 to-[#1b5c74] text-white flex items-center justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-teal-200 font-semibold">
                    Algorithm Decision Confidence
                  </div>
                  <div className="text-2xl font-black mt-0.5">{selectedAlert.confidenceScore}%</div>
                  <div className="text-[10px] text-teal-300">Deterministic RAG Guidelines & Forensic Check</div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded bg-white/20 text-white font-mono text-xs font-bold">
                    {selectedAlert.severity}
                  </span>
                </div>
              </div>

              {/* Rule Violated */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase">
                  <Scale className="w-3.5 h-3.5 text-teal-700" />
                  <span>Statutory Guideline Reference</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {selectedAlert.xai.ruleViolated}
                </p>
              </div>

              {/* Anomaly Description */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  AI Forensic Reasoning
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-amber-50/60 p-3.5 rounded-xl border border-amber-200">
                  {selectedAlert.xai.anomalySummary}
                </p>
              </div>

              {/* Itemized Evidence */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Audited Evidence Breakdown
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {selectedAlert.xai.evidenceItems.map((ev, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs border border-slate-200">
                      <span className="text-slate-500 font-medium">{ev.label}</span>
                      <span className="font-mono font-bold text-slate-900">{ev.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Action */}
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-1 text-xs text-red-900">
                <div className="font-bold uppercase text-[11px] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  <span>Recommended Administrative Action</span>
                </div>
                <p className="leading-relaxed text-slate-700">{selectedAlert.xai.recommendation}</p>
              </div>
            </div>

            {/* Bottom Escalation Action Buttons */}
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <button
                onClick={() => handleAction('Disbursal Freeze')}
                className="w-full py-2.5 px-4 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer"
              >
                Freeze Milestone Fund Disbursal
              </button>
              <button
                onClick={() => handleAction('Escalation to District Magistrate')}
                className="w-full py-2.5 px-4 bg-[#1b5c74] hover:bg-[#154b5f] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer"
              >
                Escalate Show-Cause to District Collector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
