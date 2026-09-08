import { AlertTriangle, AlertCircle, Info, ShieldAlert } from 'lucide-react';

const SEVERITY_CONFIG = {
  CRITICAL: { icon: ShieldAlert, className: 'badge-critical', pulse: true },
  HIGH: { icon: AlertTriangle, className: 'badge-high', pulse: false },
  MEDIUM: { icon: AlertCircle, className: 'badge-medium', pulse: false },
  LOW: { icon: Info, className: 'badge-low', pulse: false },
};

export default function AnomalyAlertBadge({ severity, count, label, onClick }) {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.LOW;
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={`${config.className} ${config.pulse ? 'animate-pulse-slow' : ''} cursor-pointer transition-all hover:scale-105`}
    >
      <Icon size={12} />
      {label || severity}
      {count !== undefined && (
        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/10 text-[10px] font-bold">
          {count}
        </span>
      )}
    </button>
  );
}

export function AlertTypeTag({ type }) {
  const typeLabels = {
    RULE_VIOLATION: '📋 Rule Violation',
    BUDGET_INFLATION: '💰 Budget Inflation',
    DELAY_RISK: '⏰ Delay Risk',
    CARTELIZATION: '🤝 Cartelization',
    DUPLICATE_ASSET: '📍 Duplicate',
    GEO_MISMATCH: '🗺️ Geo Mismatch',
    PHOTO_TAMPERED: '📷 Photo Tampered',
    QUOTA_FAILURE: '⚖️ Quota Failure',
  };

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-xs text-gray-300">
      {typeLabels[type] || type}
    </span>
  );
}
