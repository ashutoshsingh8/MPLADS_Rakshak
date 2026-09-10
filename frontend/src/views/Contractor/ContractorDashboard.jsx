import { useState, useEffect } from 'react';
import {
  FileText,
  CreditCard,
  Bell,
  User,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Building,
  ShieldCheck,
  HardHat,
  Sparkles,
  Search,
} from 'lucide-react';
import ContractorHeader from '../../components/Contractor/ContractorHeader';
import ContractorSidebar from '../../components/Contractor/ContractorSidebar';
import ActiveWorksGrid from '../../components/Contractor/ActiveWorksGrid';
import PaymentStatusChart from '../../components/Contractor/PaymentStatusChart';
import LiveEvidenceModal from '../../components/Contractor/LiveEvidenceModal';
import BOQSubmissionModal from '../../components/Contractor/BOQSubmissionModal';
import {
  contractorProfile,
  mockActiveWorks,
  mockContractorInvoices,
} from '../../mock/contractorDashboardData';

export default function ContractorDashboard({ onExitToPublic, onLogout, currentUser }) {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (['payments', 'billing'].includes(hash)) return 'payments';
      if (['active-works', 'tenders', 'projects', 'active-projects'].includes(hash)) return 'active-projects';
      if (['my-dashboard', 'dashboard'].includes(hash)) return 'dashboard';
      if (['notifications'].includes(hash)) return 'notifications';
      if (['profile', 'contractor', 'contractor-dashboard', 'contractor-portal'].includes(hash)) return 'profile';
    }
    return 'profile';
  });

  const [selectedWorkForEvidence, setSelectedWorkForEvidence] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#evidence') {
      return mockActiveWorks[0];
    }
    return null;
  });

  const [isBOQModalOpen, setIsBOQModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [invoices, setInvoices] = useState(mockContractorInvoices);
  const [toastMessage, setToastMessage] = useState(null);

  // Sync with window hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'evidence') {
        setSelectedWorkForEvidence(mockActiveWorks[0]);
      } else if (['payments', 'billing'].includes(hash)) {
        setActiveTab('payments');
      } else if (['active-works', 'tenders', 'projects', 'active-projects'].includes(hash)) {
        setActiveTab('active-projects');
      } else if (hash === 'dashboard' || hash === 'my-dashboard') {
        setActiveTab('dashboard');
      } else if (['profile', 'contractor', 'contractor-dashboard', 'contractor-portal'].includes(hash)) {
        setActiveTab('profile');
      } else if (hash === 'notifications') {
        setActiveTab('notifications');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Synced with District Authority PFMS Gateway & Geofence Logs');
    }, 600);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleEvidenceSubmitted = (submissionData) => {
    showToast(`Geo-verified milestone evidence submitted for ${submissionData.projectUid}`);
    setSelectedWorkForEvidence(null);
  };

  const handleInvoiceSubmitted = (newInvoice) => {
    const fullInvoice = {
      ...newInvoice,
      projectName: 'Construction of New Link Road',
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'APPROVED',
      disbursedDate: 'Awaiting Escrow Release',
      daApprovalRef: 'DA/PN/APPR-NEW',
    };
    setInvoices([fullInvoice, ...invoices]);
    showToast(`Form-IV Invoice ${newInvoice.invoiceNo} registered with District Authority`);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-slate-800 flex flex-col font-sans">
      {/* Top Header matching reference Amber-Orange #d96b1b */}
      <ContractorHeader
        onExitToPublic={onExitToPublic}
        onLogout={onLogout}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Main Workspace: Left Sidebar + Main Canvas */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Warm Rust/Terracotta Sidebar */}
        <ContractorSidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            if (typeof window !== 'undefined') {
              window.location.hash = tab === 'active-projects' ? 'contractor' : tab;
            }
          }}
          onLogout={onLogout}
        />

        {/* Canvas Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Global Toast Notification */}
          {toastMessage && (
            <div className="bg-emerald-700 text-white px-4 py-2.5 rounded-lg shadow-md flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>{toastMessage}</span>
              </div>
              <button
                onClick={() => setToastMessage(null)}
                className="text-white/80 hover:text-white ml-3 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* TAB 1: ACTIVE PROJECTS & TENDERS (Matches exact reference design media_1788986294232.png) */}
          {activeTab === 'active-projects' && (
            <div className="space-y-6">
              {/* Main Title matching reference image */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-base sm:text-lg font-black uppercase text-slate-800 tracking-wider">
                    ACTIVE PROJECTS & TENDERS
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    District Authority Sanctioned MPLADS Works • Real-Time Geo-Verification & Escrow Billing
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsBOQModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#a85016] hover:bg-[#8c3b0d] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-xs cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Submit Form-IV Bill</span>
                  </button>
                </div>
              </div>

              {/* Row 1: Active Works 2x2 Grid */}
              <ActiveWorksGrid
                onOpenEvidenceModal={(work) => setSelectedWorkForEvidence(work)}
              />

              {/* Row 2: Payment Statuses Chart */}
              <PaymentStatusChart />
            </div>
          )}

          {/* TAB 2: MY DASHBOARD (Executive summary & compliance scorecard) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-base sm:text-lg font-black uppercase text-slate-800 tracking-wider">
                  AGENCY COMPLIANCE & PERFORMANCE SCORECARD
                </h2>
                <p className="text-xs text-slate-500">
                  {contractorProfile.companyName} • Empanelled Class-1 Contractor Rating
                </p>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-500 uppercase">Active Contracts</span>
                  <div className="text-2xl font-black text-slate-800 mt-1">
                    {contractorProfile.activeContractsCount} Works
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
                    100% on-track schedule
                  </span>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-500 uppercase">Awarded Sanctions</span>
                  <div className="text-2xl font-black text-slate-800 mt-1">
                    {contractorProfile.totalAwardedValue}
                  </div>
                  <span className="text-[11px] text-slate-500 font-semibold mt-1 inline-block">
                    Under PWD Pune Division
                  </span>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-500 uppercase">Geofence Compliance</span>
                  <div className="text-2xl font-black text-emerald-600 mt-1">98.4%</div>
                  <span className="text-[11px] text-emerald-700 font-semibold mt-1 inline-block">
                    Camera & GPS verified
                  </span>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-500 uppercase">Escrow Disbursal SLA</span>
                  <div className="text-2xl font-black text-[#a85016] mt-1">4.2 Days</div>
                  <span className="text-[11px] text-slate-500 font-semibold mt-1 inline-block">
                    Avg turnaround from DA approval
                  </span>
                </div>
              </div>

              {/* Upcoming Milestones */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-black uppercase text-slate-800 tracking-wide">
                  UPCOMING MANDATORY MILESTONES & PHYSICAL AUDITS
                </h3>
                <div className="space-y-3">
                  {mockActiveWorks.map((w) => (
                    <div
                      key={w.id}
                      className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-xs text-slate-900">
                          {w.projectName} <span className="font-mono text-slate-500">({w.projectUid})</span>
                        </div>
                        <div className="text-[11px] text-slate-600">
                          Current Phase: <strong className="text-slate-800">{w.phase}</strong> • Target Deadline: {w.deadline}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[11px] font-bold text-slate-700">{w.progressPercent}% Completed</span>
                          <div className="w-28 bg-slate-200 h-2 rounded-full overflow-hidden mt-0.5">
                            <div
                              className="bg-[#a85016] h-full rounded-full"
                              style={{ width: `${w.progressPercent}%` }}
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedWorkForEvidence(w)}
                          className="px-3 py-1.5 bg-[#a85016] hover:bg-[#8c3b0d] text-white rounded text-xs font-bold transition cursor-pointer"
                        >
                          Capture
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PAYMENTS & INVOICES (Billing ledger, Form-IV tracking) */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-base sm:text-lg font-black uppercase text-slate-800 tracking-wider">
                    PAYMENTS & BILLING LEDGER
                  </h2>
                  <p className="text-xs text-slate-500">
                    Form-IV Invoicing, Escrow Disbursements & District Authority Verifications
                  </p>
                </div>

                <button
                  onClick={() => setIsBOQModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#a85016] hover:bg-[#8c3b0d] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-xs cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Generate New Form-IV Bill</span>
                </button>
              </div>

              {/* Invoices Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-wide">
                    INVOICE CLAIMS & ESCROW STATUS
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    Showing {invoices.length} invoices
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
                      <tr>
                        <th className="py-3 px-4">Invoice #</th>
                        <th className="py-3 px-4">Project & Milestone</th>
                        <th className="py-3 px-4">Claimed Amount</th>
                        <th className="py-3 px-4">Submission Date</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Escrow Release Ref</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invoices.map((inv) => (
                        <tr key={inv.invoiceNo} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                            {inv.invoiceNo}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800">{inv.projectName}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{inv.milestone}</div>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {inv.claimedAmount}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                            {inv.submittedDate}
                          </td>
                          <td className="py-3.5 px-4">
                            {inv.status === 'PAID' && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                                Disbursed
                              </span>
                            )}
                            {inv.status === 'APPROVED' && (
                              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold border border-blue-300">
                                DA Approved
                              </span>
                            )}
                            {inv.status === 'UNDER_SCRUTINY' && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">
                                Scrutiny / Review
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                            {inv.daApprovalRef}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Timeline Visualizer */}
              <PaymentStatusChart />
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-base sm:text-lg font-black uppercase text-slate-800 tracking-wider">
                  DISTRICT AUTHORITY NOTIFICATIONS & DIRECTIVES
                </h2>
                <p className="text-xs text-slate-500">
                  Real-time alerts, site inspection schedules, and audit queries
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-white rounded-xl p-4 border-l-4 border-amber-500 shadow-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">
                      Flagged Physical Inspection — Shirur Link Road
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">Yesterday, 16:45</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    District Collector office requested high-resolution live camera re-capture for the embankment sub-base layer. Disbursal on hold until re-submitted.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 border-l-4 border-emerald-500 shadow-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">
                      Escrow Release Authorized — Velhe Link Road
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">08-Sep-2026</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    ₹12.50 Lakh released to bank escrow account under sanction MPLAD-2026-PN-022. Transaction ref: PFMS-MH-2026-883921.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 border-l-4 border-blue-500 shadow-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">
                      New MPLADS Guideline Circular: AI Geo-Fencing Mandatory
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">01-Sep-2026</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    All contractors must submit live photos captured via device camera within 50m displacement tolerance from sanctioned project centroids.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-base sm:text-lg font-black uppercase text-slate-800 tracking-wider">
                  CONTRACTOR AGENCY PROFILE & ACCREDITATION
                </h2>
                <p className="text-xs text-slate-500">
                  Empanelled Vendor Master Record under Maharashtra Public Works Department (PWD)
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-5">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
                  <div className="w-16 h-16 rounded-full border-2 border-[#a85016] p-0.5 overflow-hidden">
                    <img
                      src={contractorProfile.avatar}
                      alt={contractorProfile.directorName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 uppercase">
                      {contractorProfile.companyName}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium">
                      Managing Director: {contractorProfile.directorName}
                    </p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider border border-amber-300">
                      Class-1 Empanelled (Limit ₹10 Cr)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-500 block mb-0.5 uppercase text-[10px]">
                      License / Registration #
                    </span>
                    <span className="font-mono font-bold text-slate-900">{contractorProfile.licenseNo}</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-500 block mb-0.5 uppercase text-[10px]">
                      Empanelled Division
                    </span>
                    <span className="font-semibold text-slate-900">{contractorProfile.empanelledDivision}</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-500 block mb-0.5 uppercase text-[10px]">
                      Designated PFMS Escrow Bank
                    </span>
                    <span className="font-semibold text-slate-900">
                      State Bank of India • Shivaji Nagar Branch, Pune
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-500 block mb-0.5 uppercase text-[10px]">
                      GSTIN Identification
                    </span>
                    <span className="font-mono font-bold text-slate-900">27AABCA1234F1Z8</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal 1: Live Evidence Capture with Camera & Geofence Verification */}
      {selectedWorkForEvidence && (
        <LiveEvidenceModal
          work={selectedWorkForEvidence}
          onClose={() => setSelectedWorkForEvidence(null)}
          onSubmitEvidence={handleEvidenceSubmitted}
        />
      )}

      {/* Modal 2: Form-IV BOQ Invoicing Modal */}
      {isBOQModalOpen && (
        <BOQSubmissionModal
          onClose={() => setIsBOQModalOpen(false)}
          onSubmitInvoice={handleInvoiceSubmitted}
        />
      )}
    </div>
  );
}
