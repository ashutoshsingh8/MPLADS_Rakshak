// Mock Data for Contractor (Implementing Agency) Portal — M/s ABC Constructions

export const contractorProfile = {
  companyName: 'M/s ABC Constructions Pvt. Ltd.',
  licenseNo: 'PWD-CL1-MH-2018-842',
  directorName: 'Mr. Ramesh Shinde',
  directorRole: 'Managing Director & Lead Engineer',
  empanelledDivision: 'Pune PWD & Zilla Parishad Engineering Division',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  activeContractsCount: 4,
  totalAwardedValue: '₹1.97 Crore',
};

// Row 1: Active Works (2x2 Grid matching reference image media_1788986294232.png)
export const mockActiveWorks = [
  {
    id: 'work-01',
    projectUid: 'MPLAD-2026-PN-022',
    projectName: 'Construction of New Link Road',
    status: 'In Progress',
    phase: 'Earthwork',
    location: 'NH-48 to Velhe Village, Pune',
    sanctionedAmount: '₹49.20 Lakh',
    progressPercent: 35,
    centroidCoords: [18.4385, 73.6521],
    contractRef: 'PWD/PN/2026/W-104',
    deadline: '15-Dec-2026',
  },
  {
    id: 'work-02',
    projectUid: 'MPLAD-2026-PN-018',
    projectName: 'Construction of New Road',
    status: 'In Progress',
    phase: 'Earthwork',
    location: 'Shirur Taluka rural approach road',
    sanctionedAmount: '₹48.50 Lakh',
    progressPercent: 42,
    centroidCoords: [18.8265, 74.3789],
    contractRef: 'PWD/PN/2026/W-108',
    deadline: '28-Jan-2027',
  },
  {
    id: 'work-03',
    projectUid: 'MPLAD-2026-PN-014',
    projectName: 'Construction of Project Road',
    status: 'In Progress',
    phase: 'Earthwork',
    location: 'Khed Taluka connectivity sector',
    sanctionedAmount: '₹49.80 Lakh',
    progressPercent: 28,
    centroidCoords: [18.8521, 73.9102],
    contractRef: 'PWD/PN/2026/W-112',
    deadline: '10-Feb-2027',
  },
  {
    id: 'work-04',
    projectUid: 'MPLAD-2026-PN-031',
    projectName: 'Construction of New Link Road',
    status: 'N/A',
    phase: 'Earthwork',
    location: 'Baramati Taluka rural connector',
    sanctionedAmount: '₹49.10 Lakh',
    progressPercent: 5,
    centroidCoords: [18.1517, 74.5772],
    contractRef: 'PWD/PN/2026/W-119',
    deadline: 'Pending Formal TS',
  },
];

// Row 2: Payment Statuses Data for Recharts ComposedChart (matching Jan '24 to Oct '24)
export const mockPaymentStatusesTimeline = [
  { month: "Jan '24", inProgress: 0, phase: 0, projectedCost: 0, actualCost: 0 },
  { month: "Feb '24", inProgress: 3500, phase: 2800, projectedCost: 11000, actualCost: 2800 },
  { month: "Mar '24", inProgress: 4200, phase: 3800, projectedCost: 9500, actualCost: 3800 },
  { month: "Apr '24", inProgress: 8800, phase: 7200, projectedCost: 14200, actualCost: 7200 },
  { month: "May '24", inProgress: 13800, phase: 10400, projectedCost: 11500, actualCost: 10400 },
  { month: "Jun '24", inProgress: 17200, phase: 12800, projectedCost: 15800, actualCost: 12800 },
  { month: "Jul '24", inProgress: 12000, phase: 7400, projectedCost: 13200, actualCost: 7400 },
  { month: "Aug '24", inProgress: 15400, phase: 9100, projectedCost: 16800, actualCost: 9100 },
  { month: "Sep '24", inProgress: 13200, phase: 9400, projectedCost: 15000, actualCost: 9400 },
  { month: "Oct '24", inProgress: 13800, phase: 6800, projectedCost: 18000, actualCost: 6800 },
];

// Invoices & Billing Ledger (for Payments Tab)
export const mockContractorInvoices = [
  {
    invoiceNo: 'INV-2026-041',
    projectUid: 'MPLAD-2026-PN-022',
    projectName: 'Construction of New Link Road',
    milestone: 'Milestone 1: Ground Clearing & Subgrade Preparation',
    claimedAmount: '₹12.50 Lakh',
    submittedDate: '2026-08-14',
    status: 'PAID',
    disbursedDate: '2026-08-28',
    daApprovalRef: 'DA/PN/APPR-924',
  },
  {
    invoiceNo: 'INV-2026-058',
    projectUid: 'MPLAD-2026-PN-018',
    projectName: 'Construction of New Road',
    milestone: 'Milestone 2: Plinth & Superstructure Reinforcement',
    claimedAmount: '₹15.00 Lakh',
    submittedDate: '2026-09-08',
    status: 'UNDER_SCRUTINY',
    disbursedDate: null,
    daApprovalRef: 'FLAGGED_EXIF_REVIEW',
  },
  {
    invoiceNo: 'INV-2026-062',
    projectUid: 'MPLAD-2026-PN-014',
    projectName: 'Construction of Project Road',
    milestone: 'Milestone 1: Preliminary Earthwork & Excavation',
    claimedAmount: '₹11.20 Lakh',
    submittedDate: '2026-09-02',
    status: 'APPROVED',
    disbursedDate: 'Awaiting Escrow Release',
    daApprovalRef: 'DA/PN/APPR-988',
  },
];
