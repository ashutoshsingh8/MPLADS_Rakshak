import React from 'react';
import {
  Activity,
  Database,
  Cpu,
  Server,
  CheckCircle2,
  AlertCircle,
  Users,
  Shield,
  RefreshCw
} from 'lucide-react';
import { mockSystemHealth } from './mockMinistryData';

export default function SystemHealth() {
  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-black text-slate-900 uppercase">
              System Health & Infrastructure Diagnostics
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status of MySQL relational cluster, Qdrant vector database, and Google Gemini 3.6 Flash engine
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            All Subsystems Nominal
          </span>
        </div>
      </div>

      {/* ── Diagnostics Cards ──────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MySQL */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              {mockSystemHealth.mysql.status}
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">MySQL 8.0 Relational DB</h4>
            <p className="text-xs text-slate-500">Project, Contractor & Audit Schemas</p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 flex justify-between">
            <span>Uptime: {mockSystemHealth.mysql.uptime}</span>
            <span className="font-mono font-bold text-slate-800">{mockSystemHealth.mysql.latencyMs}ms</span>
          </div>
        </div>

        {/* Qdrant */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              {mockSystemHealth.qdrant.status}
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Qdrant Vector Store</h4>
            <p className="text-xs text-slate-500">MPLADS 2023 Guidelines Index</p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 flex justify-between">
            <span>Collection: {mockSystemHealth.qdrant.collection}</span>
            <span className="font-mono font-bold text-purple-700">{mockSystemHealth.qdrant.pointsCount} Vectors</span>
          </div>
        </div>

        {/* Gemini */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              {mockSystemHealth.gemini.status}
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Google Gemini 3.6 Flash</h4>
            <p className="text-xs text-slate-500">RAG Compliance Reasoning</p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 flex justify-between">
            <span>Avg Response</span>
            <span className="font-mono font-bold text-teal-700">{mockSystemHealth.gemini.avgResponseSec}s</span>
          </div>
        </div>

        {/* API Throughput */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Normal
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">API Gateway Throughput</h4>
            <p className="text-xs text-slate-500">FastAPI Uvicorn Production Worker</p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 flex justify-between">
            <span>{mockSystemHealth.apiThroughput.requestsPerMin} req/min</span>
            <span className="font-mono font-bold text-emerald-600">Err: {mockSystemHealth.apiThroughput.errorRate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
