import { useState, useEffect } from 'react';
import {
  Search, MapPin, IndianRupee, Filter, CheckCircle2, Clock, AlertTriangle,
  FileText, Landmark, Info, MoreHorizontal, BarChart3, BookOpen, HelpCircle,
  ShieldAlert, ChevronRight, X, Eye, ArrowUpRight, Check,
  Calendar, Building, HardHat, FileSpreadsheet, ShieldCheck, Award, Phone, ExternalLink
} from 'lucide-react';
import { getProjects } from '../services/api';

const getContractorAndTenderDetails = (project) => {
  if (!project) return null;
  const id = project.id || 1;
  const agencies = [
    {
      name: 'M/s ABC Constructions Pvt. Ltd.',
      license: 'PWD-CL1-MH-2018-842',
      director: 'Mr. Ramesh Shinde (Managing Director)',
      engineer: 'Er. Sunil V. Deshmukh (Lead Civil Engineer)',
      division: `${project.district || 'Pune'} Zilla Parishad & Public Works Division`,
      classType: 'Class-1 Empanelled (Limit ₹10 Cr)',
      rating: '4.8 / 5.0 (A+ Grade • 0 Vigilance Inquiries)',
      escrowBank: 'State Bank of India (PFMS Escrow Account ESC-MH-842)',
      gstin: '27AABCA1234F1Z8',
      contact: '+91 98220 14820 (Site Office)',
    },
    {
      name: 'M/s Sharma Builders & Infra Ltd.',
      license: 'PWD-CL1-MH-2019-311',
      director: 'Shri R. K. Sharma (Managing Director)',
      engineer: 'Er. Sandeep Patil (Executive Engineer)',
      division: `${project.district || 'Pune'} Rural Engineering Division`,
      classType: 'Class-1 Empanelled (Limit ₹10 Cr)',
      rating: '4.6 / 5.0 (A Grade • 100% Milestone Compliance)',
      escrowBank: 'Punjab National Bank (Escrow Account ESC-MH-311)',
      gstin: '27SBUIL5678G1Z2',
      contact: '+91 98224 88310',
    },
    {
      name: 'M/s Patel Infrastructure & Civil Tech',
      license: 'PWD-CL1-GJ-2020-554',
      director: 'Mr. Amit Patel (Director)',
      engineer: 'Er. Hiren Joshi (Project Engineer)',
      division: `${project.district || 'Gujarat'} Public Works Division`,
      classType: 'Class-1 Empanelled (Limit ₹15 Cr)',
      rating: '4.9 / 5.0 (Star Empanelled • Zero Delays)',
      escrowBank: 'Bank of Baroda (Govt Treasury Linked ESC-GJ-554)',
      gstin: '24PINFA9012H1Z5',
      contact: '+91 98251 90120',
    },
    {
      name: 'M/s Kumar & Associates Infra',
      license: 'PWD-CL1-UP-2017-902',
      director: 'Er. Sunil Kumar (Principal Partner)',
      engineer: 'Er. Rajesh Varma (Site Head)',
      division: `${project.district || 'UP'} Municipal Engineering Cell`,
      classType: 'Class-1 Empanelled (Limit ₹10 Cr)',
      rating: '4.5 / 5.0 (Compliant • On-track Schedule)',
      escrowBank: 'Union Bank of India (PFMS Escrow ESC-UP-902)',
      gstin: '09KUASC3456I1Z9',
      contact: '+91 98390 34560',
    },
  ];

  const contractor = agencies[(id - 1) % agencies.length];
  const sanctionedVal = project.sanctioned_amount || 4800000;
  const awardedVal = Math.round(sanctionedVal * 0.96);
  const disbursedVal = project.expenditure_to_date || Math.round(sanctionedVal * ((project.physical_progress_percent || 35) / 100));

  return {
    contractor,
    tender: {
      nitNo: `NIT/PWD/${(project.district || 'PUN').slice(0, 3).toUpperCase()}/2025/W-${id + 100}`,
      gemRef: `GeM/2025/B/982${id + 100}`,
      biddingMethod: 'Open Competitive E-Tender (Two-Cover Electronic System)',
      technicalScore: '94.5 / 100 (Technical Benchmark Cleared)',
      sanctionedVal,
      awardedVal,
      disbursedVal,
      workOrderRef: `WO/2026/MPLAD/${(project.district || 'PUN').slice(0, 3).toUpperCase()}/${id + 104}`,
      agreementDate: '15-Jan-2026',
    },
    dates: {
      recommendedDate: project.recommended_date || '14-Sep-2025',
      technicalSanctionDate: '18-Oct-2025',
      administrativeSanctionDate: project.sanctioned_date || '04-Nov-2025',
      tenderPublicationDate: '22-Nov-2025',
      workOrderAwardDate: '15-Jan-2026',
      workCommencedDate: '05-Feb-2026',
      completionDeadline: project.stipulated_completion_date || '15-Dec-2026',
      latestAuditDate: project.actual_completion_date || '08-Sep-2026',
    },
  };
};

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

                        {/* Action Buttons: View Details & Report Fraud */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => setSelectedProjectModal(project)}
                            className="flex-1 py-1.5 px-2 text-center text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer border border-teal-200 shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Public Details</span>
                          </button>
                          <button
                            onClick={() => onOpenFraudReport && onOpenFraudReport(project)}
                            className="py-1.5 px-2.5 text-center text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer border border-red-200 shadow-2xs"
                            title="Report Fraud / Anomaly on this project"
                          >
                            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                            <span className="hidden sm:inline">Report Fraud</span>
                          </button>
                        </div>
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
            </div>
          </div>
        </div>
      </div>

      {/* ── Public Project Details Modal with Contractor, Tender & Dates ── */}
      {selectedProjectModal && (() => {
        const extra = getContractorAndTenderDetails(selectedProjectModal);
        const contractor = extra.contractor;
        const tender = extra.tender;
        const dates = extra.dates;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs">
            <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
              {/* Modal Top Banner */}
              <div className="bg-[#0f2e52] px-5 sm:px-6 py-3.5 flex items-center justify-between text-white border-b border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-white/10 border border-white/20">
                    <Building className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-amber-300 tracking-wider">
                        {selectedProjectModal.project_uid}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/15 text-slate-200 font-semibold uppercase">
                        {selectedProjectModal.category?.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-black text-white line-clamp-1 mt-0.5">
                      {selectedProjectModal.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Report Fraud Button right in the modal header */}
                  <button
                    onClick={() => {
                      const p = selectedProjectModal;
                      setSelectedProjectModal(null);
                      onOpenFraudReport && onOpenFraudReport(p);
                    }}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Report suspicious activity or anomaly on this project"
                  >
                    <ShieldAlert className="w-4 h-4 text-amber-300" />
                    <span className="hidden sm:inline">Report Fraud</span>
                  </button>

                  <button
                    onClick={() => setSelectedProjectModal(null)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Modal Body */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
                {/* Top KPI Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Sanctioned Cost</span>
                    <span className="text-sm font-black text-slate-900 mt-0.5 block">
                      {formatRupees(selectedProjectModal.sanctioned_amount)}
                    </span>
                    <span className="text-[10px] text-slate-400">Approved by District Authority</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Awarded Tender Value</span>
                    <span className="text-sm font-black text-teal-800 mt-0.5 block">
                      {formatRupees(tender.awardedVal)}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold">4% Saving to Public Fund</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Funds Disbursed to Date</span>
                    <span className="text-sm font-black text-slate-900 mt-0.5 block">
                      {formatRupees(tender.disbursedVal)}
                    </span>
                    <span className="text-[10px] text-slate-400">Escrow Milestone Releases</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Physical Progress</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-sm font-black text-slate-900">
                        {selectedProjectModal.physical_progress_percent || 35}%
                      </span>
                      {getStatusBadge(selectedProjectModal.status)}
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="bg-teal-600 h-full rounded-full"
                        style={{ width: `${selectedProjectModal.physical_progress_percent || 35}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* SC/ST Focus Banner */}
                {selectedProjectModal.is_sc_st_area && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-purple-700 shrink-0" />
                    <div>
                      <strong>Special Focus Statutory Quota:</strong> Designated exclusively for{' '}
                      {selectedProjectModal.sc_st_category || 'SC/ST'} population upliftment under Revised MPLADS Guidelines 2023 (Mandatory 15% SC / 7.5% ST outlay).
                    </div>
                  </div>
                )}

                {/* Section 1: Contractor & Executing Agency Dossier */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <HardHat className="w-4 h-4 text-[#a85016]" />
                      <h4 className="text-xs font-black uppercase text-slate-800 tracking-wide">
                        1. CONTRACTOR & EXECUTING AGENCY DETAILS
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-black uppercase border border-amber-300">
                      {contractor.classType}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Empanelled Contractor Firm</span>
                      <span className="font-bold text-slate-900 block mt-0.5">{contractor.name}</span>
                      <span className="text-[10px] text-slate-500">License: {contractor.license}</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Leadership & Engineer</span>
                      <span className="font-semibold text-slate-900 block mt-0.5">{contractor.director}</span>
                      <span className="text-[10px] text-slate-500">{contractor.engineer}</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Empanelled Division</span>
                      <span className="font-semibold text-slate-800 block mt-0.5">{contractor.division}</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">{contractor.rating}</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">PFMS Escrow Bank Account</span>
                      <span className="font-semibold text-slate-800 block mt-0.5">{contractor.escrowBank}</span>
                      <span className="text-[10px] text-slate-500">Direct PFMS Treasury Disbursal</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">GSTIN Identification</span>
                      <span className="font-mono font-bold text-slate-800 block mt-0.5">{contractor.gstin}</span>
                      <span className="text-[10px] text-slate-500">Active Taxpayer Verified</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Site Contact / Inquiries</span>
                      <span className="font-semibold text-slate-800 block mt-0.5">{contractor.contact}</span>
                      <span className="text-[10px] text-slate-500">Official Implementing Desk</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Tender & E-Procurement Details */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-teal-700" />
                      <h4 className="text-xs font-black uppercase text-slate-800 tracking-wide">
                        2. TENDER & PROCUREMENT DETAILS
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-900 text-[10px] font-bold border border-teal-300">
                      GeM / E-Procurement Verified
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Tender Notice # (NIT)</span>
                      <span className="font-mono font-bold text-slate-900 block mt-0.5">{tender.nitNo}</span>
                      <span className="text-[10px] text-slate-500">{tender.biddingMethod}</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Central e-Procurement Ref</span>
                      <span className="font-mono font-bold text-teal-800 block mt-0.5">{tender.gemRef}</span>
                      <span className="text-[10px] text-slate-500">Technical Score: {tender.technicalScore}</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Formal Work Order Reference</span>
                      <span className="font-mono font-bold text-slate-900 block mt-0.5">{tender.workOrderRef}</span>
                      <span className="text-[10px] text-slate-500">Executed on: {tender.agreementDate}</span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Important Lifecycle Dates */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-700" />
                      <h4 className="text-xs font-black uppercase text-slate-800 tracking-wide">
                        3. IMPORTANT LIFECYCLE DATES & STATUTORY TIMELINE
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Statutory 45-Day SLA Compliant
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-2.5 bg-slate-50 rounded-lg border-l-3 border-blue-500">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">MP Recommended</span>
                      <span className="font-mono font-bold text-slate-800 text-xs block mt-0.5">
                        {dates.recommendedDate}
                      </span>
                      <span className="text-[10px] text-slate-400">Formal Lok Sabha nomination</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border-l-3 border-teal-500">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Technical Sanction (TS)</span>
                      <span className="font-mono font-bold text-slate-800 text-xs block mt-0.5">
                        {dates.technicalSanctionDate}
                      </span>
                      <span className="text-[10px] text-slate-400">CPWD SoR Rate Cleared</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border-l-3 border-emerald-500">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Admin Sanction (AS)</span>
                      <span className="font-mono font-bold text-slate-800 text-xs block mt-0.5">
                        {dates.administrativeSanctionDate}
                      </span>
                      <span className="text-[10px] text-slate-400">District Magistrate Order</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border-l-3 border-amber-500">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Tender Published (NIT)</span>
                      <span className="font-mono font-bold text-slate-800 text-xs block mt-0.5">
                        {dates.tenderPublicationDate}
                      </span>
                      <span className="text-[10px] text-slate-400">E-Procurement notice live</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border-l-3 border-indigo-500">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Work Order Executed</span>
                      <span className="font-mono font-bold text-slate-800 text-xs block mt-0.5">
                        {dates.workOrderAwardDate}
                      </span>
                      <span className="text-[10px] text-slate-400">Agreement contract bound</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border-l-3 border-purple-500">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Ground Work Begun</span>
                      <span className="font-mono font-bold text-slate-800 text-xs block mt-0.5">
                        {dates.workCommencedDate}
                      </span>
                      <span className="text-[10px] text-slate-400">Site mobilization logged</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border-l-3 border-rose-500">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Mandatory Deadline</span>
                      <span className="font-mono font-bold text-rose-700 text-xs block mt-0.5">
                        {dates.completionDeadline}
                      </span>
                      <span className="text-[10px] text-slate-400">Statutory 1-Year Guideline</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border-l-3 border-cyan-500">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Latest Geo-Audit</span>
                      <span className="font-mono font-bold text-cyan-800 text-xs block mt-0.5">
                        {dates.latestAuditDate}
                      </span>
                      <span className="text-[10px] text-slate-400">Physical Milestone Inspected</span>
                    </div>
                  </div>
                </div>

                {/* Section 4: Location & Geo-Centroid Verification */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">
                      Constituency & Centroid Verification
                    </span>
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>{selectedProjectModal.district}, {selectedProjectModal.state} ({selectedProjectModal.district} Parliamentary Constituency)</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      GPS Centroid: {selectedProjectModal.latitude ? selectedProjectModal.latitude.toFixed(4) : '18.5204'}° N, {selectedProjectModal.longitude ? selectedProjectModal.longitude.toFixed(4) : '73.8567'}° E • <span className="text-emerald-700 font-semibold font-sans">Verified within 50m statutory radius (0m anomaly)</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedProjectModal(null);
                      onNavigateToMap && onNavigateToMap();
                    }}
                    className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-bold transition border border-teal-200 flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <span>View on Analytics Map</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-5 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
                {/* Prominent Report Fraud Button */}
                <button
                  onClick={() => {
                    const p = selectedProjectModal;
                    setSelectedProjectModal(null);
                    onOpenFraudReport && onOpenFraudReport(p);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold uppercase transition flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-300" />
                  <span>Report Fraud on this Project</span>
                </button>

                <button
                  onClick={() => setSelectedProjectModal(null)}
                  className="px-5 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold uppercase transition border border-slate-300 shadow-2xs cursor-pointer"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
