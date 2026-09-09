import { useState } from 'react';
import { X, ShieldAlert, Upload, CheckCircle2 } from 'lucide-react';

export default function ReportFraudModal({ isOpen, onClose }) {
  const [projectTitle, setProjectTitle] = useState('');
  const [district, setDistrict] = useState('Pune');
  const [state, setState] = useState('Maharashtra');
  const [category, setCategory] = useState('WORK_NOT_FOUND');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [photoName, setPhotoName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      // Auto close after showing success
    }, 2000);
  };

  const handleReset = () => {
    setSubmitted(false);
    setProjectTitle('');
    setDescription('');
    setPhotoName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-scale-up">
        {/* Header */}
        <div className="bg-red-700 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-300" />
            <span className="text-sm font-bold tracking-wide uppercase">
              Citizen Fraud & Anomaly Reporting
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">
                Grievance Registered Successfully
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Your report has been securely lodged with District Authorities and MoSPI Audit Wing. Reference Ticket: <span className="font-mono font-bold text-teal-700">GRV-2026-{Math.floor(100000 + Math.random() * 900000)}</span>.
              </p>
              <button
                onClick={handleReset}
                className="mt-4 px-6 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold uppercase transition"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-slate-500">
                Direct citizen channel to report ghost works, private property misuse, substandard materials, or inflated project costs under MPLADS.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Title or Landmark Location *
                </label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g. Culvert at Link Road or School boundary wall"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    State / UT
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Issue Type
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="WORK_NOT_FOUND">No Work on Ground (Ghost Project)</option>
                  <option value="PRIVATE_ASSET">Work on Private Property (Inadmissible)</option>
                  <option value="SUBSTANDARD">Substandard Construction Quality</option>
                  <option value="TAMPERED_BOARD">Missing / Misleading MPLADS Plaque</option>
                  <option value="DELAY_ABANDONED">Project Abandoned by Contractor</option>
                  <option value="OTHER">Other Misappropriation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Grievance / Specific Concerns
                </label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide exact details, date noticed, and why you believe guidelines were violated..."
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Upload Site Photograph / Evidence
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-lg p-4 text-center cursor-pointer transition bg-slate-50">
                  <input
                    type="file"
                    id="fraudPhoto"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setPhotoName(e.target.files[0].name);
                    }}
                  />
                  <label htmlFor="fraudPhoto" className="cursor-pointer flex flex-col items-center justify-center gap-1.5">
                    <Upload className="w-5 h-5 text-slate-400" />
                    <span className="text-xs text-slate-600 font-medium">
                      {photoName ? photoName : 'Upload geo-tagged site photo (optional)'}
                    </span>
                    <span className="text-[10px] text-slate-400">JPG, PNG up to 10MB</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-red-700 hover:bg-red-800 text-white rounded-lg transition shadow-md"
                >
                  Submit Report
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
