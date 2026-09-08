import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, AlertTriangle, FileSearch, Timer, ArrowRight, Loader2, Eye } from 'lucide-react';
import AnomalyAlertBadge, { AlertTypeTag } from '../components/AnomalyAlertBadge';
import { getProjects, getAnomalies, runAnomalySweep } from '../services/api';

export default function DistrictAuthorityDashboard() {
  const [projects, setProjects] = useState([]);
  const [anomalies, setAnomalies] = useState({ alerts: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [sweeping, setSweeping] = useState(false);
  const [activeTab, setActiveTab] = useState('pipeline');
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [projRes, anomRes] = await Promise.allSettled([
        getProjects({ page_size: 50 }),
        getAnomalies({ page_size: 20 }),
      ]);
      if (projRes.status === 'fulfilled') setProjects(projRes.value.projects || []);
      if (anomRes.status === 'fulfilled') setAnomalies(anomRes.value);
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSweep = async () => {
    setSweeping(true);
    try {
      await runAnomalySweep();
      await loadData();
    } catch (err) {
      console.error('Sweep failed:', err);
    } finally {
      setSweeping(false);
    }
  };

  // Pipeline: group projects by status
  const pipeline = {
    RECOMMENDED: projects.filter(p => p.status === 'RECOMMENDED'),
    SANCTIONED: projects.filter(p => p.status === 'SANCTIONED'),
    IN_PROGRESS: projects.filter(p => p.status === 'IN_PROGRESS'),
    FLAGGED_REVIEW: projects.filter(p => p.status === 'FLAGGED_REVIEW'),
    COMPLETED: projects.filter(p => p.status === 'COMPLETED'),
  };

  const pipelineConfig = {
    RECOMMENDED: { label: 'Recommended', color: 'purple', icon: FileSearch },
    SANCTIONED: { label: 'Sanctioned', color: 'blue', icon: CheckCircle2 },
    IN_PROGRESS: { label: 'In Progress', color: 'amber', icon: Timer },
    FLAGGED_REVIEW: { label: 'Flagged', color: 'red', icon: AlertTriangle },
    COMPLETED: { label: 'Completed', color: 'emerald', icon: CheckCircle2 },
  };

  const getDaysRemaining = (project) => {
    if (!project.recommended_date || project.sanctioned_date) return null;
    const recDate = new Date(project.recommended_date);
    const today = new Date();
    const daysElapsed = Math.floor((today - recDate) / (1000 * 60 * 60 * 24));
    return Math.max(0, 45 - daysElapsed);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400 text-sm">Loading DA workbench...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header Bar ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">District Authority Workbench</h2>
          <p className="text-sm text-gray-400">Proposal clearance pipeline & inspection management</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSweep}
            disabled={sweeping}
            className="btn-primary flex items-center gap-2"
          >
            {sweeping ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
            {sweeping ? 'Running Sweep...' : 'Run Anomaly Sweep'}
          </button>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────── */}
      <div className="flex gap-1 bg-surface-800/50 rounded-lg p-1 w-fit">
        {['pipeline', 'inspections', 'alerts'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Pipeline View ──────────────────────────────── */}
      {activeTab === 'pipeline' && (
        <>
          {/* Status Flow Indicator */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {Object.entries(pipelineConfig).map(([status, config], idx) => {
              const Icon = config.icon;
              const count = pipeline[status]?.length || 0;
              return (
                <div key={status} className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                    count > 0 ? 'bg-white/5 border border-white/10' : 'opacity-40'
                  }`}>
                    <Icon size={14} className="text-gray-400" />
                    <span className="text-xs font-medium text-gray-300 whitespace-nowrap">{config.label}</span>
                    <span className="text-xs font-bold text-white bg-white/10 px-1.5 py-0.5 rounded">{count}</span>
                  </div>
                  {idx < Object.keys(pipelineConfig).length - 1 && (
                    <ArrowRight size={14} className="text-gray-600 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Project Cards */}
          <div className="grid gap-3">
            {projects.map((project) => {
              const daysRemaining = getDaysRemaining(project);
              const isOverdue = project.is_sanction_overdue;

              return (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="glass-card-hover p-4 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-500">{project.project_uid}</span>
                        <span className={`status-${project.status?.toLowerCase().replace('_', '-')}`}>
                          {project.status?.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-white truncate">{project.title}</h4>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                        <span>📍 {project.district}, {project.state}</span>
                        <span>💰 ₹{(project.sanctioned_amount || 0).toLocaleString('en-IN')}</span>
                        <span>📊 {project.physical_progress_percent || 0}% done</span>
                      </div>
                    </div>

                    {/* 45-day countdown */}
                    {daysRemaining !== null && (
                      <div className={`flex flex-col items-center px-3 py-2 rounded-lg ${
                        isOverdue ? 'bg-red-500/10 border border-red-500/30' :
                        daysRemaining <= 10 ? 'bg-orange-500/10 border border-orange-500/30' :
                        'bg-white/5 border border-white/10'
                      }`}>
                        <Clock size={14} className={isOverdue ? 'text-red-400' : daysRemaining <= 10 ? 'text-orange-400' : 'text-gray-400'} />
                        <span className={`text-lg font-bold ${
                          isOverdue ? 'text-red-400' : daysRemaining <= 10 ? 'text-orange-400' : 'text-white'
                        }`}>
                          {isOverdue ? 'OVERDUE' : daysRemaining}
                        </span>
                        <span className="text-[9px] text-gray-500 uppercase">
                          {isOverdue ? '' : 'days left'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${project.physical_progress_percent || 0}%`,
                          background: project.status === 'COMPLETED'
                            ? 'linear-gradient(90deg, #10B981, #34D399)'
                            : project.status === 'FLAGGED_REVIEW'
                            ? 'linear-gradient(90deg, #EF4444, #F87171)'
                            : 'linear-gradient(90deg, #3B82F6, #60A5FA)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── Alerts Tab ─────────────────────────────────── */}
      {activeTab === 'alerts' && (
        <div className="space-y-3">
          {anomalies.alerts.map((alert) => (
            <div key={alert.id} className="glass-card p-4">
              <div className="flex items-start gap-3">
                <AnomalyAlertBadge severity={alert.severity} />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white">{alert.title}</div>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{alert.explanation}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <AlertTypeTag type={alert.alert_type} />
                    <span className="text-[10px] text-gray-500">
                      {alert.created_at ? new Date(alert.created_at).toLocaleDateString() : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {anomalies.alerts.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              <CheckCircle2 size={32} className="mx-auto mb-3 text-emerald-500" />
              <p className="text-sm">No anomalies detected</p>
            </div>
          )}
        </div>
      )}

      {/* ── Inspections Tab ────────────────────────────── */}
      {activeTab === 'inspections' && (
        <div className="glass-card p-6 text-center text-gray-400">
          <FileSearch size={32} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">Site inspection log coming soon</p>
          <p className="text-xs text-gray-500 mt-1">Upload geo-tagged photos via the Contractor portal</p>
        </div>
      )}
    </div>
  );
}
