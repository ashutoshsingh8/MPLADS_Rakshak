import { useState, useEffect } from 'react';
import {
  TrendingUp, AlertTriangle, IndianRupee, MapPin, BarChart3, Activity,
  ArrowUpRight, ArrowDownRight, Users, Building2, CheckCircle2, Clock
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import GISMapViewer from '../components/GISMapViewer';
import AnomalyAlertBadge, { AlertTypeTag } from '../components/AnomalyAlertBadge';
import { getDashboardSummary, getProjects, getAnomalies, getUtilizationByState } from '../services/api';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function MinistryDashboard() {
  const [summary, setSummary] = useState(null);
  const [projects, setProjects] = useState([]);
  const [anomalies, setAnomalies] = useState({ alerts: [], total: 0, open_count: 0, critical_count: 0 });
  const [stateData, setStateData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaryRes, projectsRes, anomalyRes, stateRes] = await Promise.allSettled([
        getDashboardSummary(),
        getProjects({ page_size: 100 }),
        getAnomalies({ page_size: 10 }),
        getUtilizationByState(),
      ]);
      if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value);
      if (projectsRes.status === 'fulfilled') setProjects(projectsRes.value.projects || []);
      if (anomalyRes.status === 'fulfilled') setAnomalies(anomalyRes.value);
      if (stateRes.status === 'fulfilled') setStateData(stateRes.value || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    if (!val) return '₹0';
    if (val >= 1_00_00_000) return `₹${(val / 1_00_00_000).toFixed(2)} Cr`;
    if (val >= 1_00_000) return `₹${(val / 1_00_000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  // Chart Data
  const statusData = {
    labels: Object.keys(summary?.projects_by_status || {}),
    datasets: [{
      data: Object.values(summary?.projects_by_status || {}),
      backgroundColor: ['#A78BFA', '#60A5FA', '#FBBF24', '#34D399', '#F87171'],
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  const stateBarData = {
    labels: stateData.slice(0, 8).map(s => s.state?.substring(0, 15)),
    datasets: [{
      label: 'Utilization %',
      data: stateData.slice(0, 8).map(s => s.utilization_percent),
      backgroundColor: stateData.slice(0, 8).map(s =>
        s.utilization_percent > 75 ? '#34D399' : s.utilization_percent > 50 ? '#FBBF24' : '#F87171'
      ),
      borderRadius: 6,
      barThickness: 28,
    }],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400 text-sm">Loading national overview...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── KPI Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <Building2 size={18} className="text-white" />
            </div>
            <ArrowUpRight size={16} className="text-emerald-400" />
          </div>
          <div className="stat-value text-white">{summary?.total_projects || 0}</div>
          <div className="stat-label">Total Projects</div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg gradient-saffron flex items-center justify-center">
              <IndianRupee size={18} className="text-white" />
            </div>
            <span className="text-xs text-emerald-400 font-semibold">{summary?.utilization_percent?.toFixed(1)}%</span>
          </div>
          <div className="stat-value text-saffron-400">{formatCurrency(summary?.total_sanctioned_amount)}</div>
          <div className="stat-label">Total Sanctioned</div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg gradient-danger flex items-center justify-center">
              <AlertTriangle size={18} className="text-white" />
            </div>
            <AnomalyAlertBadge severity="CRITICAL" count={anomalies.critical_count} />
          </div>
          <div className="stat-value text-red-400">{anomalies.open_count}</div>
          <div className="stat-label">Open Alerts</div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg gradient-success flex items-center justify-center">
              <Activity size={18} className="text-white" />
            </div>
            {summary?.sc_st_allocation_percent < 22.5 && (
              <span className="text-xs text-red-400 font-semibold">Below Target</span>
            )}
          </div>
          <div className="stat-value text-emerald-400">{summary?.sc_st_allocation_percent?.toFixed(1)}%</div>
          <div className="stat-label">SC/ST Allocation</div>
        </div>
      </div>

      {/* ── Map + Status Chart Row ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <GISMapViewer projects={projects} height="380px" />
        </div>
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Projects by Status</h3>
          <div className="flex items-center justify-center" style={{ height: '280px' }}>
            <Doughnut
              data={statusData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: '#94A3B8', font: { size: 11 }, padding: 12, usePointStyle: true },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* ── State Utilization + Recent Alerts Row ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* State-wise Utilization */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Fund Utilization by State</h3>
          <div style={{ height: '300px' }}>
            <Bar
              data={stateBarData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                scales: {
                  x: {
                    max: 100,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#64748B', callback: (v) => `${v}%` },
                  },
                  y: {
                    grid: { display: false },
                    ticks: { color: '#94A3B8', font: { size: 11 } },
                  },
                },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: { label: (ctx) => `${ctx.parsed.x}% utilization` },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Recent Anomaly Alerts */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-300">Recent Alerts</h3>
            <span className="text-xs text-gray-500">{anomalies.total} total</span>
          </div>
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
            {anomalies.alerts.slice(0, 6).map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/8 transition-colors cursor-pointer"
              >
                <AnomalyAlertBadge severity={alert.severity} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{alert.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <AlertTypeTag type={alert.alert_type} />
                    {alert.district && (
                      <span className="text-[10px] text-gray-500">📍 {alert.district}</span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-gray-500 whitespace-nowrap">
                  {alert.created_at ? new Date(alert.created_at).toLocaleDateString() : ''}
                </span>
              </div>
            ))}
            {anomalies.alerts.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-8">
                <CheckCircle2 size={24} className="mx-auto mb-2 text-emerald-500" />
                No open alerts — system healthy
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
