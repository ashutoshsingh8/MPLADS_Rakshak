import { useState } from 'react';
import { ChevronDown, MapPin, Calendar, Clock, ArrowRight } from 'lucide-react';
import { mockActiveWorks } from '../../mock/contractorDashboardData';

export default function ActiveWorksGrid({ onOpenEvidenceModal }) {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filteredWorks = mockActiveWorks.filter((w) => {
    if (statusFilter === 'IN_PROGRESS') return w.status === 'In Progress';
    if (statusFilter === 'NA') return w.status === 'N/A';
    return true;
  });

  return (
    <div className="space-y-3">
      {/* Subheader with Status Filter matching reference image */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-black uppercase text-slate-800 tracking-wide">
          ACTIVE WORKS
        </h3>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <span>Status</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20 text-xs font-medium">
              <button
                onClick={() => {
                  setStatusFilter('ALL');
                  setDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700"
              >
                All Works
              </button>
              <button
                onClick={() => {
                  setStatusFilter('IN_PROGRESS');
                  setDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700"
              >
                In Progress
              </button>
              <button
                onClick={() => {
                  setStatusFilter('NA');
                  setDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700"
              >
                Pending TS (N/A)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2x2 Grid of Rounded White Cards matching reference image layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredWorks.map((work) => (
          <div
            key={work.id}
            className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition relative group"
          >
            {/* Left border accent on Card 1 & 2 matching image */}
            <div className="space-y-1 text-xs text-slate-700 font-sans">
              <div className="font-bold text-slate-900 text-sm">
                Project Name: <span className="font-semibold text-slate-800">{work.projectName}</span>
              </div>

              <div>
                <span className="font-bold text-slate-900">Status: </span>
                <span
                  className={
                    work.status === 'In Progress'
                      ? 'text-slate-800 font-medium'
                      : 'text-slate-400 font-medium'
                  }
                >
                  {work.status}
                </span>
              </div>

              {work.phase && (
                <div>
                  <span className="font-bold text-slate-900">Phase: </span>
                  <span className="text-slate-800 font-medium">{work.phase}</span>
                </div>
              )}
            </div>

            {/* Bottom Right VIEW button matching reference screenshot */}
            <div className="pt-4 flex justify-end">
              <button
                onClick={() => onOpenEvidenceModal && onOpenEvidenceModal(work)}
                className="px-6 py-1.5 bg-[#a85016] hover:bg-[#8c3b0d] text-white rounded-md text-xs font-bold uppercase tracking-wider transition shadow-xs cursor-pointer active:scale-95"
              >
                VIEW
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
