import { useState, useRef } from 'react';
import { Upload, X, FileText, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ProposalUploadModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'ROADS',
    district: '',
    state: '',
    sanctioned_amount: '',
    latitude: '',
    longitude: '',
    is_sc_st_area: false,
    sc_st_category: 'GENERAL',
    implementing_agency: '',
  });
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const categories = [
    'DRINKING_WATER', 'ROADS', 'SANITATION', 'EDUCATION', 'HEALTH',
    'ELECTRICITY', 'COMMUNITY_CENTER', 'SPORTS', 'IRRIGATION', 'OTHER',
  ];

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const payload = {
        ...formData,
        sanctioned_amount: formData.sanctioned_amount ? parseFloat(formData.sanctioned_amount) : null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };
      const res = await onSubmit?.(payload);
      setResult({ type: 'success', data: res });
    } catch (err) {
      setResult({ type: 'error', message: err?.response?.data?.detail || 'Submission failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card p-6 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Submit New Project Proposal</h2>
            <p className="text-sm text-gray-400 mt-0.5">Fill in the details for MPLADS project recommendation</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Project Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Construction of Community Hall at Village XYZ"
              className="input-dark"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Detailed description of the proposed work..."
              rows={3}
              className="input-dark resize-none"
            />
          </div>

          {/* Category + Amount Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="input-dark"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Sanctioned Amount (₹)</label>
              <input
                type="number"
                value={formData.sanctioned_amount}
                onChange={(e) => handleChange('sanctioned_amount', e.target.value)}
                placeholder="e.g., 500000"
                className="input-dark"
              />
            </div>
          </div>

          {/* Location Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">District *</label>
              <input
                type="text"
                required
                value={formData.district}
                onChange={(e) => handleChange('district', e.target.value)}
                placeholder="e.g., Pune"
                className="input-dark"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">State *</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                placeholder="e.g., Maharashtra"
                className="input-dark"
              />
            </div>
          </div>

          {/* GPS Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Latitude</label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => handleChange('latitude', e.target.value)}
                placeholder="e.g., 18.5204"
                className="input-dark"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Longitude</label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => handleChange('longitude', e.target.value)}
                placeholder="e.g., 73.8567"
                className="input-dark"
              />
            </div>
          </div>

          {/* SC/ST Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_sc_st_area}
                  onChange={(e) => handleChange('is_sc_st_area', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-white/10 peer-focus:ring-2 peer-focus:ring-primary-400/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500 peer-checked:after:bg-white" />
              </label>
              <span className="text-sm text-gray-300">SC/ST Area</span>
            </div>
            <div>
              <select
                value={formData.sc_st_category}
                onChange={(e) => handleChange('sc_st_category', e.target.value)}
                className="input-dark"
                disabled={!formData.is_sc_st_area}
              >
                <option value="GENERAL">General</option>
                <option value="SC">Scheduled Caste</option>
                <option value="ST">Scheduled Tribe</option>
              </select>
            </div>
          </div>

          {/* Implementing Agency */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Implementing Agency</label>
            <input
              type="text"
              value={formData.implementing_agency}
              onChange={(e) => handleChange('implementing_agency', e.target.value)}
              placeholder="e.g., Zilla Parishad / PWD / Municipal Corporation"
              className="input-dark"
            />
          </div>

          {/* Result Display */}
          {result && (
            <div className={`p-4 rounded-lg border animate-fade-in ${
              result.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                {result.type === 'success' ? (
                  <CheckCircle2 size={16} className="text-emerald-400" />
                ) : (
                  <AlertTriangle size={16} className="text-red-400" />
                )}
                <span className={`text-sm font-semibold ${result.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {result.type === 'success' ? 'Project Submitted Successfully!' : 'Submission Failed'}
                </span>
              </div>
              {result.type === 'success' && result.data && (
                <p className="text-xs text-gray-400 mt-1">
                  UID: <span className="text-white font-mono">{result.data.project_uid}</span>
                  {result.data.status === 'FLAGGED_REVIEW' && (
                    <span className="ml-2 text-red-400">⚠️ Flagged for compliance review</span>
                  )}
                </p>
              )}
              {result.type === 'error' && (
                <p className="text-xs text-red-300 mt-1">{result.message}</p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FileText size={16} />
                  Submit Proposal
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
