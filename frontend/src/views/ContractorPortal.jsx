import { useState, useRef } from 'react';
import { Upload, Camera, FileText, MapPin, CheckCircle2, AlertTriangle, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadPhoto, getProjects } from '../services/api';
import { useEffect } from 'react';

export default function ContractorPortal() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [activeTab, setActiveTab] = useState('upload');
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await getProjects({ page_size: 50 });
      setProjects(res.projects || []);
      if (res.projects?.length > 0) setSelectedProjectId(res.projects[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProjectId) return;

    setUploading(true);
    setUploadResult(null);
    try {
      const result = await uploadPhoto(selectedProjectId, file);
      setUploadResult(result);
    } catch (err) {
      setUploadResult({ verdict: 'ERROR', error: err?.response?.data?.detail || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ─────────────────────────────────────── */}
      <div>
        <h2 className="text-xl font-bold text-white">Contractor Portal</h2>
        <p className="text-sm text-gray-400">Submit milestones, upload geo-tagged photos, and manage BOQ</p>
      </div>

      {/* ── Tabs ───────────────────────────────────────── */}
      <div className="flex gap-1 bg-surface-800/50 rounded-lg p-1 w-fit">
        {['upload', 'milestones', 'boq'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab === 'upload' ? 'Photo Upload' : tab === 'milestones' ? 'Milestones' : 'BOQ Submission'}
          </button>
        ))}
      </div>

      {/* ── Photo Upload Tab ───────────────────────────── */}
      {activeTab === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <Camera size={16} /> Upload Site Inspection Photo
            </h3>

            {/* Project Selector */}
            <div className="mb-4">
              <label className="block text-xs text-gray-400 mb-1.5">Select Project</label>
              <select
                value={selectedProjectId || ''}
                onChange={(e) => setSelectedProjectId(parseInt(e.target.value))}
                className="input-dark"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.project_uid} — {p.title?.substring(0, 50)}
                  </option>
                ))}
              </select>
            </div>

            {selectedProject && (
              <div className="p-3 rounded-lg bg-white/5 mb-4 text-xs text-gray-400">
                <div className="flex items-center gap-1 mb-1">
                  <MapPin size={12} />
                  <span>{selectedProject.district}, {selectedProject.state}</span>
                </div>
                <div>
                  GPS: {selectedProject.latitude?.toFixed(4)}, {selectedProject.longitude?.toFixed(4)}
                </div>
              </div>
            )}

            {/* Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center cursor-pointer hover:border-primary-400/50 hover:bg-primary-400/5 transition-all duration-300"
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 size={32} className="text-primary-400 animate-spin" />
                  <span className="text-sm text-gray-400">Analyzing image EXIF data...</span>
                </div>
              ) : (
                <>
                  <Upload size={32} className="mx-auto text-gray-500 mb-3" />
                  <p className="text-sm text-gray-300 font-medium">Click to upload site photo</p>
                  <p className="text-xs text-gray-500 mt-1">JPEG or PNG with GPS metadata • Max 10MB</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Verification Result */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <FileText size={16} /> Verification Result
            </h3>

            {uploadResult ? (
              <div className="space-y-4 animate-fade-in">
                {/* Verdict */}
                <div className={`p-4 rounded-lg border ${
                  uploadResult.verdict === 'PASS'
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : uploadResult.verdict === 'ERROR'
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                }`}>
                  <div className="flex items-center gap-2">
                    {uploadResult.verdict === 'PASS' ? (
                      <CheckCircle2 size={20} className="text-emerald-400" />
                    ) : (
                      <AlertTriangle size={20} className="text-red-400" />
                    )}
                    <span className={`text-lg font-bold ${
                      uploadResult.verdict === 'PASS' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {uploadResult.verdict === 'ERROR' ? 'Upload Error' : uploadResult.verdict}
                    </span>
                  </div>
                </div>

                {uploadResult.verdict !== 'ERROR' && (
                  <>
                    {/* EXIF Data */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase">EXIF Metadata</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: 'GPS Lat', value: uploadResult.exif_latitude?.toFixed(6) || 'Not found' },
                          { label: 'GPS Lon', value: uploadResult.exif_longitude?.toFixed(6) || 'Not found' },
                          { label: 'Timestamp', value: uploadResult.exif_timestamp || 'Not found' },
                          { label: 'Camera', value: uploadResult.exif_camera || 'Unknown' },
                          { label: 'Software', value: uploadResult.exif_software || 'None' },
                          { label: 'Distance', value: uploadResult.geo_distance_meters ? `${uploadResult.geo_distance_meters.toFixed(1)}m` : 'N/A' },
                        ].map((item) => (
                          <div key={item.label} className="p-2 rounded bg-white/5">
                            <div className="text-[10px] text-gray-500 uppercase">{item.label}</div>
                            <div className="text-xs text-gray-300 font-medium truncate">{item.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tampering */}
                    {uploadResult.is_metadata_tampered && (
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <div className="flex items-center gap-2 text-red-400 text-xs font-semibold mb-1">
                          <AlertTriangle size={12} />
                          Tampering Detected
                        </div>
                        <p className="text-xs text-red-300">{uploadResult.tampering_reason}</p>
                      </div>
                    )}
                  </>
                )}

                {uploadResult.error && (
                  <p className="text-xs text-red-300">{uploadResult.error}</p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                <ImageIcon size={32} className="mb-3 opacity-30" />
                <p className="text-sm">Upload a photo to see verification results</p>
                <p className="text-xs text-gray-600 mt-1">GPS, timestamp, and tampering analysis</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Milestones Tab ─────────────────────────────── */}
      {activeTab === 'milestones' && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Project Milestones</h3>
          <div className="space-y-3">
            {projects.filter(p => p.status === 'IN_PROGRESS').slice(0, 5).map(p => (
              <div key={p.id} className="p-4 rounded-lg bg-white/5 hover:bg-white/8 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div className="text-sm font-medium text-white">{p.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{p.project_uid}</div>
                  </div>
                  <span className="text-sm font-bold text-saffron-400">{p.physical_progress_percent}%</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-saffron-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${p.physical_progress_percent || 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── BOQ Tab ────────────────────────────────────── */}
      {activeTab === 'boq' && (
        <div className="glass-card p-6 text-center text-gray-400">
          <FileText size={32} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">BOQ Submission Form</p>
          <p className="text-xs text-gray-500 mt-1">Coming soon — will include CPWD SoR rate comparison</p>
        </div>
      )}
    </div>
  );
}
