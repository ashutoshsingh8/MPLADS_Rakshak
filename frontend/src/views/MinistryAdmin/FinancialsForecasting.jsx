import React from 'react';
import {
  TrendingUp,
  IndianRupee,
  AlertTriangle,
  PieChart as PieIcon,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingDown,
  Building,
  Target
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { mockFinancials } from './mockMinistryData';

export default function FinancialsForecasting() {
  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-teal-700" />
            <h2 className="text-xl font-black text-slate-900 uppercase">
              Financials & Outlay Forecasting
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            National ₹5 Crore per MP entitlement outlays, ML-driven delay predictions, and CPWD cost benchmarking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
            Total National Outlay: ₹1,200.00 Cr
          </span>
        </div>
      </div>

      {/* ── Top Section: Expenditure Tracker (Donut) & Highlights ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart: Outlay Status */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase">
              Expenditure Outlay Distribution
            </h3>
            <span className="text-xs text-slate-400 font-mono">FY 2026-27</span>
          </div>

          <div className="h-48 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockFinancials.outlays}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {mockFinancials.outlays.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => `₹${val} Crore`}
                  contentStyle={{ backgroundColor: '#0f2e52', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            {mockFinancials.outlays.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 font-medium">{item.name}</span>
                </div>
                <div className="font-mono font-bold text-slate-900">
                  ₹{item.value} Cr <span className="text-slate-400 font-normal">({item.percent})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Predictive Delay Radar (ML Forecast) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase">
                Predictive Delay & Fund Lapsing Radar
              </h3>
              <p className="text-xs text-slate-500">
                Machine learning forecast identifying districts with high probability of missing project completion deadlines
              </p>
            </div>
            <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold">
              5 High Risk Identified
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-2.5 rounded-l-lg">District / State</th>
                  <th className="p-2.5">Delay Risk Score</th>
                  <th className="p-2.5">Unspent Funds</th>
                  <th className="p-2.5 rounded-r-lg">Identified Bottleneck</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockFinancials.delayRadarDistricts.map((d) => (
                  <tr key={d.district} className="hover:bg-slate-50/70 transition">
                    <td className="p-2.5 font-bold text-slate-900">
                      {d.district}, <span className="text-slate-500 font-normal">{d.state}</span>
                    </td>
                    <td className="p-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-600 rounded-full"
                            style={{ width: `${d.riskPercent}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-red-600">{d.riskPercent}%</span>
                      </div>
                    </td>
                    <td className="p-2.5 font-mono font-bold text-slate-800">
                      ₹{d.unspentCr} Cr
                    </td>
                    <td className="p-2.5 text-slate-600 text-[11px]">
                      {d.bottleneck}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Cost Benchmarking Dashboard Table ────────────────── */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase">
              CPWD Schedule of Rates (SoR) Cost Benchmarking Engine
            </h3>
            <p className="text-xs text-slate-500">
              Cross-referencing itemized project estimates against state and national benchmarks to detect inflated estimates
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3 rounded-l-lg">Infrastructure Work Spec</th>
                <th className="p-3">National Benchmark Avg</th>
                <th className="p-3">State Quoted Avg</th>
                <th className="p-3">Benchmark Variance</th>
                <th className="p-3 rounded-r-lg">Audit Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockFinancials.costBenchmarkItems.map((b, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition">
                  <td className="p-3 font-bold text-slate-900">{b.item}</td>
                  <td className="p-3 font-mono text-slate-600">{b.nationalAvg}</td>
                  <td className="p-3 font-mono font-bold text-slate-800">{b.stateAvg}</td>
                  <td className="p-3 font-mono font-bold">
                    <span className={b.variance.startsWith('+2') || b.variance.startsWith('+4') ? 'text-red-600' : 'text-emerald-600'}>
                      {b.variance}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      b.status === 'Inflated'
                        ? 'bg-red-100 text-red-700'
                        : b.status === 'Optimal'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
