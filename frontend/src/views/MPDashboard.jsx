import { useState, useEffect } from 'react';
import { IndianRupee, MapPin, TrendingUp, PieChart, Plus, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import GISMapViewer from '../components/GISMapViewer';
import ProposalUploadModal from '../components/ProposalUploadModal';
import { getProjects, getDashboardSummary, submitProject } from '../services/api';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function MPDashboard() {
  const [projects, setProjects] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [projRes, summRes] = await Promise.allSettled([
        getProjects({ page_size: 50 }),
        getDashboardSummary(),
      ]);
      if (projRes.status === 'fulfilled') setProjects(projRes.value.projects || []);
      if (summRes.status === 'fulfilled') setSummary(summRes.value);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    const result = await submitProject(data);
    await loadData();
    return result;
  };

  const formatCurrency = (val) => {
    if (!val) return '₹0';
    if (val >= 1_00_00_000) return `₹${(val / 1_00_00_000).toFixed(2)} Cr`;
    if (val >= 1_00_000) return `₹${(val / 1_00_000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const recommended = projects.filter(p => p.status === 'RECOMMENDED').length;
  const sanctioned = projects.filter(p => p.status === 'SANCTIONED' || p.status === 'IN_PROGRESS').length;
  const completed = projects.filter(p => p.status === 'COMPLETED').length;
  const flagged = projects.filter(p => p.status === 'FLAGGED_REVIEW').length;

  const categoryData = {
    labels: Object.keys(summary?.projects_by_category || {}),
    datasets: [{
      data: Object.values(summary?.projects_by_category || {}),
      backgroundColor: ['#60A5FA', '#34D399', '#FBBF24', '#A78BFA', '#F87171', '#818CF8', '#FB923C', '#2DD4BF', '#E879F9', '#FCA5A5'],
      borderWidth: 0,
    }],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-3 border-saffron-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Constituency Tracker</h2>
          <p className="text-sm text-gray-400">Track recommended works and public impact</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-saffron flex items-center gap-2">
          <Plus size={16} />
          Recommend New Work
        </button>
      </div>

      {/* ── Impact Cards ───────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="stat-card border-l-4 border-purple-500">
          <div className="stat-value text-purple-400">{recommended}</div>
          <div className="stat-label">Recommended</div>
        </div>
        <div className="stat-card border-l-4 border-blue-500">
          <div className="stat-value text-blue-400">{sanctioned}</div>
          <div className="stat-label">In Pipeline</div>
        </div>
        <div className="stat-card border-l-4 border-emerald-500">
          <div className="stat-value text-emerald-400">{completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card border-l-4 border-red-500">
          <div className="stat-value text-red-400">{flagged}</div>
          <div className="stat-label">Flagged</div>
        </div>
        <div className="stat-card border-l-4 border-saffron-500">
          <div className="stat-value text-saffron-400">{formatCurrency(summary?.total_expenditure)}</div>
          <div className="stat-label">Total Expenditure</div>
        </div>
      </div>

      {/* ── Map + Categories ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <GISMapViewer projects={projects} height="350px" />
        </div>
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <PieChart size={14} /> By Category
          </h3>
          <div style={{ height: '260px' }} className="flex items-center justify-center">
            <Doughnut
              data={categoryData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: '#94A3B8', font: { size: 10 }, padding: 8, usePointStyle: true },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Recent Projects List ───────────────────────── */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">My Recommended Works</h3>
        <div className="overflow-x-auto">
          <table className="table-dark">
            <thead>
              <tr>
                <th>Project</th>
                <th>Category</th>
                <th>District</th>
                <th>Amount</th>
                <th>Progress</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {projects.slice(0, 10).map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="text-white font-medium text-sm">{p.title}</div>
                    <div className="text-[10px] text-gray-500 font-mono mt-0.5">{p.project_uid}</div>
                  </td>
                  <td className="text-xs">{p.category?.replace(/_/g, ' ')}</td>
                  <td className="text-xs">{p.district}</td>
                  <td className="text-xs font-medium text-saffron-400">
                    {formatCurrency(p.sanctioned_amount)}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
                          style={{ width: `${p.physical_progress_percent || 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{p.physical_progress_percent || 0}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-${p.status?.toLowerCase().replace('_', '-')}`}>
                      {p.status?.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Proposal Modal ─────────────────────────────── */}
      <ProposalUploadModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
