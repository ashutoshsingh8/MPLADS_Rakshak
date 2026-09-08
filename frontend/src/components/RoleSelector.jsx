import { Building2, Landmark, Users, HardHat } from 'lucide-react';

const ROLES = [
  { key: 'MINISTRY_ADMIN', label: 'Ministry Admin', icon: Landmark, color: 'purple', desc: 'National oversight' },
  { key: 'DISTRICT_AUTHORITY', label: 'District Authority', icon: Building2, color: 'blue', desc: 'DA workbench' },
  { key: 'MP', label: 'MP View', icon: Users, color: 'saffron', desc: 'Constituency tracker' },
  { key: 'CONTRACTOR', label: 'Contractor', icon: HardHat, color: 'emerald', desc: 'Project portal' },
];

const colorMap = {
  purple: { active: 'bg-purple-500/20 border-purple-500/50 text-purple-300', hover: 'hover:bg-purple-500/10 hover:border-purple-500/30', dot: 'bg-purple-400' },
  blue: { active: 'bg-blue-500/20 border-blue-500/50 text-blue-300', hover: 'hover:bg-blue-500/10 hover:border-blue-500/30', dot: 'bg-blue-400' },
  saffron: { active: 'bg-saffron-500/20 border-saffron-500/50 text-saffron-300', hover: 'hover:bg-saffron-500/10 hover:border-saffron-500/30', dot: 'bg-saffron-400' },
  emerald: { active: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300', hover: 'hover:bg-emerald-500/10 hover:border-emerald-500/30', dot: 'bg-emerald-400' },
};

export default function RoleSelector({ activeRole, onRoleChange }) {
  return (
    <div className="flex flex-wrap gap-2 p-1">
      {ROLES.map((role) => {
        const isActive = activeRole === role.key;
        const colors = colorMap[role.color];
        const Icon = role.icon;

        return (
          <button
            key={role.key}
            onClick={() => onRoleChange(role.key)}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-300 ${
              isActive
                ? `${colors.active} shadow-lg scale-[1.02]`
                : `border-white/10 text-gray-400 ${colors.hover}`
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-white/10' : 'bg-white/5'}`}>
              <Icon size={16} className={isActive ? 'text-current' : 'text-gray-500'} />
            </div>
            <div className="text-left">
              <div className="font-semibold text-sm">{role.label}</div>
              <div className={`text-[10px] ${isActive ? 'text-current opacity-70' : 'text-gray-500'}`}>{role.desc}</div>
            </div>
            {isActive && (
              <div className={`w-2 h-2 rounded-full ${colors.dot} animate-pulse ml-1`} />
            )}
          </button>
        );
      })}
    </div>
  );
}
