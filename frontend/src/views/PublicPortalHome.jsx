import { useState, useEffect } from 'react';
import {
  Search, MapPin, IndianRupee, Filter, CheckCircle2, Clock, AlertTriangle,
  FileText, Landmark, Info, MoreHorizontal, BarChart3, BookOpen, HelpCircle,
  ShieldAlert, ChevronRight, X, Eye, ArrowUpRight, Check
} from 'lucide-react';
import { getProjects } from '../services/api';

export default function PublicPortalHome({ onNavigateToMap, onNavigateToProjects, onOpenFraudReport }) {
  const [keyword, setKeyword] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [allProjects, setAllProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('QUICK SEARCH');
  const [selectedProjectModal, setSelectedProjectModal] = useState(null);

  // States & Districts list from seeded data
  const stateDistricts = {
    Maharashtra: ['Pune', 'Mumbai', 'Nagpur', 'Nashik'],
    Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
    'Uttar Pradesh': ['Lucknow', 'Varanasi', 'Kanpur', 'Prayagraj'],
    Delhi: ['New Delhi', 'North Delhi', 'South Delhi'],
  };

  const categories = [
    { value: 'ALL', label: 'All Sectors' },
    { value: 'COMMUNITY_CENTER', label: 'Community Centers' },
    { value: 'ROADS', label: 'Roads & Bridges' },
    { value: 'DRINKING_WATER', label: 'Drinking Water' },
    { value: 'SANITATION', label: 'Sanitation' },
    { value: 'EDUCATION', label: 'Education & Schools' },
    { value: 'HEALTH', label: 'Public Health' },
    { value: 'SPORTS', label: 'Sports & Parks' },
  ];

  const statuses = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'SANCTIONED', label: 'Sanctioned' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'FLAGGED_REVIEW', label: 'Flagged for Review' },
    { value: 'RECOMMENDED', label: 'Recommended' },
  ];

  // Fetch projects on load
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await getProjects({ page_size: 100 });
      if (data && data.projects) {
        setAllProjects(data.projects);
        setFilteredProjects(data.projects);
      }
    } catch (err) {
      console.error('Failed to load public projects:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter projects whenever search criteria change
  useEffect(() => {
    let result = [...allProjects];

    if (keyword.trim()) {
      const q = keyword.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.project_uid?.toLowerCase().includes(q) ||
          p.district?.toLowerCase().includes(q) ||
          p.state?.toLowerCase().includes(q)
      );
    }

    if (selectedState !== 'ALL') {
      result = result.filter((p) => p.state === selectedState);
    }

    if (selectedDistrict !== 'ALL') {
      result = result.filter((p) => p.district === selectedDistrict);
    }

    if (selectedCategory !== 'ALL') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (selectedStatus !== 'ALL') {
      result = result.filter((p) => p.status === selectedStatus);
    }

    setFilteredProjects(result);
  }, [keyword, selectedState, selectedDistrict, selectedCategory, selectedStatus, allProjects]);

  const handleStateChange = (state) => {
    setSelectedState(state);
    setSelectedDistrict('ALL');
  };

  const formatRupees = (amt) => {
    if (!amt) return '₹0';
    if (amt >= 1_00_00_000) return `₹${(amt / 1_00_00_000).toFixed(2)} Cr`;
    if (amt >= 1_00_000) return `₹${(amt / 1_00_000).toFixed(2)} Lakh`;
    return `₹${Number(amt).toLocaleString('en-IN')}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3" /> In Progress
          </span>
        );
      case 'FLAGGED_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-800 border border-red-200">
            <AlertTriangle className="w-3 h-3" /> Under Audit
          </span>
        );
      case 'SANCTIONED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Check className="w-3 h-3" /> Sanctioned
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen gov-portal-bg text-slate-800 pb-16">
      {/* ── Main Container ─────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Main Headline from Screenshot */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight text-center uppercase py-2">
          PUBLIC PORTAL HOME
        </h1>

        {/* ── Main Featured Card (PUBLIC SEARCH) ─────────────── */}
        <div className="portal-card overflow-hidden shadow-xl">
          {/* Teal Gradient Header matching image */}
          <div className="portal-hero-gradient p-6 sm:p-8 text-white relative">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-center tracking-wide uppercase mb-6 drop-shadow-sm">
              PUBLIC SEARCH
            </h2>

            {/* Keyword Search Bar */}
            <div className="max-w-xl mx-auto mb-4">
              <div className="relative flex items-center shadow-lg rounded-xl overflow-hidden bg-white">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="search project keyword..."
                  className="w-full px-5 py-3.5 text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  className="bg-[#1c6877] hover:bg-[#15505c] text-white px-5 py-3.5 transition flex items-center justify-center cursor-pointer"
                  title="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sub Tabs: ANALYSIS MAP | QUICK SEARCH | CUSTOM VIEW */}
            <div className="flex items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm font-semibold tracking-wider text-teal-100 pt-1 pb-4">
              <button
                onClick={() => {
                  setActiveSubTab('ANALYSIS MAP');
                  onNavigateToMap && onNavigateToMap();
                }}
                className="hover:text-white uppercase transition pb-1 border-b-2 border-transparent hover:border-white"
              >
                ANALYSIS MAP
              </button>
              <button
                onClick={() => setActiveSubTab('QUICK SEARCH')}
                className={`uppercase transition pb-1 border-b-2 ${
                  activeSubTab === 'QUICK SEARCH' ? 'border-white text-white' : 'border-transparent hover:border-white'
                }`}
              >
                QUICK SEARCH
              </button>
              <button
                onClick={() => {
                  setActiveSubTab('CUSTOM VIEW');
                  setSelectedState('ALL');
                  setSelectedDistrict('ALL');
                  setSelectedCategory('ALL');
                }}
                className="hover:text-white uppercase transition pb-1 border-b-2 border-transparent hover:border-white"
              >
                CUSTOM VIEW
              </button>
            </div>

            {/* Graphic Illustration Section matching image */}
            <div className="mt-2 max-w-2xl mx-auto bg-white/10 rounded-2xl p-4 sm:p-6 backdrop-blur-xs border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-6">
              {/* Illustrated SVG Figures & Dashboards */}
              <div className="flex-1 flex items-center justify-center gap-4 w-full">
                {/* Visual Cards Mockup */}
                <div className="bg-white rounded-lg shadow-md p-2.5 w-44 text-slate-800 transform -rotate-1 hidden sm:block">
                  <div className="h-2 w-16 bg-teal-600 rounded mb-2" />
                  <div className="space-y-1">
                    <div className="h-1.5 w-full bg-slate-200 rounded" />
                    <div className="h-1.5 w-4/5 bg-slate-200 rounded" />
                    <div className="h-1.5 w-3/5 bg-slate-200 rounded" />
                  </div>
                  <div className="mt-2 flex gap-1">
                    <div className="h-6 w-1/3 bg-teal-100 rounded" />
                    <div className="h-6 w-1/3 bg-amber-100 rounded" />
                    <div className="h-6 w-1/3 bg-emerald-100 rounded" />
                  </div>
                </div>

                {/* Map Mockup */}
                <div className="bg-white rounded-lg shadow-md p-2.5 w-44 text-slate-800 transform rotate-1 hidden sm:block">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-slate-600">GIS MAP</span>
                    <MapPin className="w-3 h-3 text-teal-600" />
                  </div>
                  <div className="h-16 bg-slate-100 rounded flex items-center justify-center relative overflow-hidden border border-slate-200">
                    <div className="absolute inset-0 bg-blue-50/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <div className="w-2 h-2 rounded-full bg-teal-600 z-10" />
                  </div>
                </div>
              </div>

              <div className="text-center sm:text-right shrink-0">
                <span className="inline-block px-3 py-1 bg-white/20 text-white rounded-full text-xs font-semibold uppercase tracking-wider mb-1">
                  Citizen Transparency
                </span>
                <p className="text-xs text-teal-100 max-w-xs">
                  Search ₹5 Crore annual MP funds, geo-tagged civic infrastructure, and ground completion audits across India.
                </p>
              </div>
            </div>
          </div>

          {/* ── Area Filter Section for Public Usage ─────────── */}
          <div className="p-6 sm:p-8 bg-white border-b border-slate-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-wide uppercase">
                  FILTER PROJECTS BY YOUR AREA
                </h3>
                <p className="text-xs text-slate-500">
                  Select your State / UT and District to inspect local community works in your neighborhood
                </p>
              </div>
              <div className="text-xs font-bold text-[#1c6877] bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                {filteredProjects.length} Works Found
              </div>
            </div>

            {/* Filter Dropdowns Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* State / UT */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  State / UT
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 transition"
                >
                  <option value="ALL">All States / UTs</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Delhi">Delhi</option>
                </select>
              </div>

              {/* District */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  District
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 transition"
                >
                  <option value="ALL">All Districts</option>
                  {selectedState !== 'ALL' && stateDistricts[selectedState]
                    ? stateDistricts[selectedState].map((dist) => (
                        <option key={dist} value={dist}>
                          {dist}
                        </option>
                      ))
                    : Object.values(stateDistricts)
                        .flat()
                        .map((dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        ))}
                </select>
              </div>

              {/* Sector / Category */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Sector / Work Type
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 transition"
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Project Status */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Execution Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 transition"
                >
                  {statuses.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── Filtered Project Results List ────────────────── */}
          <div className="p-6 sm:p-8 bg-slate-50/50">
            {loading ? (
              <div className="text-center py-10 text-slate-500 text-sm">
                Loading community works...
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-6">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <Search className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-800">No Projects Found</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  No community works matched your selected filters. Try choosing "All Districts" or clearing the keyword.
                </p>
                <button
                  onClick={() => {
                    setKeyword('');
                    setSelectedState('ALL');
                    setSelectedDistrict('ALL');
                    setSelectedCategory('ALL');
                    setSelectedStatus('ALL');
                  }}
                  className="mt-3 px-4 py-1.5 text-xs font-bold text-teal-700 hover:underline"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProjects.slice(0, 6).map((project) => (
                    <div
                      key={project.id}
                      className="bg-white rounded-xl p-4 border border-slate-200 hover:border-teal-400 hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        {/* Top UID + Status */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            {project.project_uid}
                          </span>
                          {getStatusBadge(project.status)}
                        </div>

                        {/* Title */}
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 mb-2 hover:text-teal-700 transition">
                          {project.title}
                        </h4>

                        {/* Location */}
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-2">
                          <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>
                            {project.district}, {project.state}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 space-y-2">
                        {/* Financials & Progress */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Sanctioned Cost:</span>
                          <span className="font-bold text-slate-900">
                            {formatRupees(project.sanctioned_amount)}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                            <span>Physical Progress</span>
                            <span className="font-semibold text-slate-700">
                              {project.physical_progress_percent || 0}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-teal-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${project.physical_progress_percent || 0}%` }}
                            />
                          </div>
                        </div>

                        {/* View Details Button */}
                        <button
                          onClick={() => setSelectedProjectModal(project)}
                          className="w-full mt-1 py-1 text-center text-xs font-semibold text-teal-700 hover:bg-teal-50 rounded transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" /> View Public Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredProjects.length > 6 && (
                  <div className="text-center pt-3">
                    <button
                      onClick={onNavigateToProjects}
                      className="inline-flex items-center gap-1.5 px-6 py-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition border border-teal-200 shadow-xs cursor-pointer"
                    >
                      <span>View All {filteredProjects.length} Projects in Directory</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Quick Links & About Section (Matching Screenshot) ─ */}
          <div className="p-6 sm:p-8 bg-white border-t border-slate-200">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Links (2 Columns in Grid) */}
              <div className="lg:col-span-2">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">
                  QUICK LINKS
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-2 gap-x-4 text-xs">
                  {/* Column 1 */}
                  <ul className="space-y-2 text-slate-600">
                    <li className="flex items-center gap-1.5 hover:text-teal-700 cursor-pointer">
                      <span className="w-1 h-1 rounded-full bg-slate-400" />
                      <span>Public Search</span>
                    </li>
                    <li
                      onClick={onNavigateToMap}
                      className="flex items-center gap-1.5 hover:text-teal-700 cursor-pointer font-medium"
                    >
                      <span className="w-1 h-1 rounded-full bg-teal-600" />
                      <span>Constituency Map</span>
                    </li>
                    <li
                      onClick={onNavigateToMap}
                      className="flex items-center gap-1.5 hover:text-teal-700 cursor-pointer font-medium"
                    >
                      <span className="w-1 h-1 rounded-full bg-teal-600" />
                      <span>Analytics Map</span>
                    </li>
                    <li className="flex items-center gap-1.5 hover:text-teal-700 cursor-pointer">
                      <span className="w-1 h-1 rounded-full bg-slate-400" />
                      <span>Constituent Map</span>
                    </li>
                    <li className="flex items-center gap-1.5 hover:text-teal-700 cursor-pointer">
                      <span className="w-1 h-1 rounded-full bg-slate-400" />
                      <span>Guideline Smart Search</span>
                    </li>
                  </ul>

                  {/* Column 2 */}
                  <ul className="space-y-2 text-slate-600">
                    <li className="flex items-center gap-1.5 hover:text-teal-700 cursor-pointer">
                      <span className="w-1 h-1 rounded-full bg-slate-400" />
                      <span>Government Search</span>
                    </li>
                    <li className="flex items-center gap-1.5 hover:text-teal-700 cursor-pointer">
                      <span className="w-1 h-1 rounded-full bg-slate-400" />
                      <span>Scheme Map</span>
                    </li>
                    <li className="flex items-center gap-1.5 hover:text-teal-700 cursor-pointer">
                      <span className="w-1 h-1 rounded-full bg-slate-400" />
                      <span>Constituency Map</span>
                    </li>
                    <li className="flex items-center gap-1.5 hover:text-teal-700 cursor-pointer">
                      <span className="w-1 h-1 rounded-full bg-slate-400" />
                      <span>Audit Reports</span>
                    </li>
                  </ul>

                  {/* Column 3 */}
                  <ul className="space-y-2 text-slate-600">
                    <li className="flex items-center gap-1.5 hover:text-teal-700 cursor-pointer">
                      <span className="w-1 h-1 rounded-full bg-slate-400" />
                      <span>Constituents</span>
                    </li>
                    <li className="flex items-center gap-1.5 hover:text-teal-700 cursor-pointer">
                      <span className="w-1 h-1 rounded-full bg-slate-400" />
                      <span>Guideline Map</span>
                    </li>
                    <li className="flex items-center gap-1.5 hover:text-teal-700 cursor-pointer">
                      <span className="w-1 h-1 rounded-full bg-slate-400" />
                      <span>Constraint Map</span>
                    </li>
                    <li className="flex items-center gap-1.5 hover:text-teal-700 cursor-pointer">
                      <span className="w-1 h-1 rounded-full bg-slate-400" />
                      <span>Additional Map</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* About Box matching screenshot */}
              <div className="portal-mint-box p-5 rounded-xl flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                    ABOUT
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Home • Projects • Scheme • Contact • Constraint • Constraint Map • Analysis • Login
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-between text-slate-700">
                  <Landmark className="w-8 h-8 text-teal-800" />
                  <span className="text-xs font-bold text-teal-800 hover:underline cursor-pointer">
                    See more
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Bottom Icon Toolbar (Matching Screenshot) ────── */}
          <div className="bg-white border-t border-slate-200 px-4 py-3 sm:px-8">
            <div className="flex flex-wrap items-center justify-around sm:justify-between gap-3 text-slate-600 text-xs">
              {/* See details */}
              <button
                onClick={() => alert('MPLADS provides ₹5 Crore annually to MPs for durable community infrastructure.')}
                className="flex items-center gap-1.5 hover:text-teal-800 transition font-medium cursor-pointer"
              >
                <Info className="w-4 h-4 text-teal-700" />
                <span>See details</span>
              </button>

              {/* See more */}
              <button
                onClick={() => onNavigateToProjects && onNavigateToProjects()}
                className="flex items-center gap-1.5 hover:text-teal-800 transition font-medium cursor-pointer"
              >
                <MoreHorizontal className="w-4 h-4 text-teal-700" />
                <span>See more</span>
              </button>

              {/* PUBLIC SEARCH */}
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center gap-1.5 text-teal-900 font-bold uppercase transition bg-teal-50 px-3 py-1 rounded border border-teal-200 cursor-pointer"
              >
                <Search className="w-4 h-4 text-teal-700" />
                <span>PUBLIC SEARCH</span>
              </button>

              {/* ANALYSIS MAP */}
              <button
                onClick={onNavigateToMap}
                className="flex items-center gap-1.5 hover:text-teal-800 transition font-medium uppercase cursor-pointer"
              >
                <BarChart3 className="w-4 h-4 text-teal-700" />
                <span>ANALYSIS MAP</span>
              </button>

              {/* USER GUIDE */}
              <button
                onClick={() => alert('Download official citizen portal guide for tracking MPLADS local development.')}
                className="flex items-center gap-1.5 hover:text-teal-800 transition font-medium uppercase cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-teal-700" />
                <span>USER GUIDE</span>
              </button>

              {/* FAQ */}
              <button
                onClick={() => alert('FAQ: District Authorities sanction works within 45 days. Works are completed in 1 year.')}
                className="flex items-center gap-1.5 hover:text-teal-800 transition font-medium uppercase cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-teal-700" />
                <span>FAQ</span>
              </button>

              {/* REPORT FRAUD */}
              <button
                onClick={onOpenFraudReport}
                className="flex items-center gap-1.5 text-red-700 hover:text-red-800 transition font-bold uppercase cursor-pointer bg-red-50 hover:bg-red-100 px-3 py-1 rounded border border-red-200"
              >
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>REPORT FRAUD</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Public Project Details Modal ────────────────────── */}
      {selectedProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10">
            <div className="bg-[#0f2e52] px-6 py-4 flex items-center justify-between text-white">
              <span className="font-mono text-xs font-bold text-amber-300">
                {selectedProjectModal.project_uid}
              </span>
              <button
                onClick={() => setSelectedProjectModal(null)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-800">
                {selectedProjectModal.title}
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">Location:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedProjectModal.district}, {selectedProjectModal.state}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">Sanctioned Amount:</span>
                  <span className="font-semibold text-slate-900">
                    {formatRupees(selectedProjectModal.sanctioned_amount)}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">Implementing Agency:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedProjectModal.implementing_agency || 'District PWD'}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">Status:</span>
                  <div className="mt-0.5">{getStatusBadge(selectedProjectModal.status)}</div>
                </div>
              </div>

              {selectedProjectModal.is_sc_st_area && (
                <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-900">
                  <strong>Special Focus Quota:</strong> Designated for{' '}
                  {selectedProjectModal.sc_st_category || 'SC/ST'} population welfare (Mandatory 15% SC / 7.5% ST guideline clause).
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedProjectModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold uppercase transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
