/**
 * MP Dashboard Mock Data (Pune Lok Sabha Constituency)
 * Modeled for Hon'ble Member of Parliament Shri Vijay Patil
 */

export const mockMpProfile = {
  name: 'Shri Vijay Patil',
  role: 'Member of Parliament (Lok Sabha)',
  constituency: 'Pune Constituency',
  state: 'Maharashtra',
  term: '18th Lok Sabha (2024 - 2029)',
  entitlementCr: 5.0,
  allocatedCr: 3.85,
  unspentCr: 1.15,
  utilizationPercent: 77.0,
};

// Row 1: Three Visual Verification Cards matching screenshot
export const mockVerificationCards = {
  myNominations: {
    title: 'MY NOMINATIONS',
    subtitle: 'Single-lane road in Shirur Taluka connecting Village to NH',
    progressPercent: 65,
    status: 'In Progress',
    sanctionedAmount: '₹48.50 Lakh',
    agency: 'State Public Works Dept (PWD)',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
    letterRef: 'MP-PUNE/2026/REC-084',
    dateRecommended: '14 Jan 2026',
  },
  approvedWorks: {
    title: 'APPROVED WORKS',
    subtitle: 'Construction site — Panchayat Community Hall Foundation',
    progressPercent: 40,
    status: 'Foundation Stage',
    sanctionedAmount: '₹35.00 Lakh',
    agency: 'Zilla Parishad Pune Rural Works',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80',
    asOrderRef: 'DA/PUNE/AS-2026-112',
    dateSanctioned: '22 Feb 2026',
  },
  siteUpdates: {
    title: 'SITE UPDATES (PHOTOS)',
    subtitle: 'Construction works — High-Capacity Solar Water Purification',
    progressPercent: 95,
    status: 'Work Completed',
    sanctionedAmount: '₹22.00 Lakh',
    agency: 'M/s ABC Constructions',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80',
        caption: 'Rebar slab reinforcement',
      },
      {
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
        caption: 'Earthmoving & grading work',
      },
      {
        url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&auto=format&fit=crop&q=80',
        caption: 'Engineers on track inspection',
      },
      {
        url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80',
        caption: 'Structural column erection',
      },
    ],
    exifVerified: true,
    coordinates: '18.5204° N, 73.8567° E',
    timestamp: '19-Oct-2026 14:22 IST',
  },
};

// Row 2: Recharts Trend Area Chart (Nominated Works) — Jan to Jul
export const mockNominatedWorksTrend = [
  { month: 'Jan', nominatedWorks: 0, dataCharts: 0 },
  { month: 'Feb', nominatedWorks: 4200, dataCharts: 1400 },
  { month: 'Mar', nominatedWorks: 3800, dataCharts: 2600 },
  { month: 'Apr', nominatedWorks: 7200, dataCharts: 4100 },
  { month: 'May', nominatedWorks: 3100, dataCharts: 2100 },
  { month: 'Jun', nominatedWorks: 6200, dataCharts: 4200 },
  { month: 'Jul', nominatedWorks: 7400, dataCharts: 3800 },
];

// Row 2: Recharts Grouped Bar Chart (Nominated Works Monthly) — Jan to Dec
export const mockNominatedWorksMonthly = [
  { month: 'Jan', nominatedWorks: 590, dataChart: 440 },
  { month: 'Feb', nominatedWorks: 800, dataChart: 590 },
  { month: 'Mar', nominatedWorks: 1000, dataChart: 740 },
  { month: 'Jul', nominatedWorks: 1300, dataChart: 940 },
  { month: 'Sep', nominatedWorks: 880, dataChart: 520 },
  { month: 'Nov', nominatedWorks: 1140, dataChart: 650 },
  { month: 'Dec', nominatedWorks: 980, dataChart: 470 },
];

// 45-Day SLA Status & Pending Proposals
export const mockPendingProposals = [
  {
    id: 'MP-2026-PROP-01',
    title: 'Primary Health Sub-Center Upgradation at Khed Taluka',
    category: 'HEALTH',
    estimatedCost: '₹42.00 Lakh',
    submittedDate: '18-Aug-2026',
    daysPending: 52, // Breached 45-Day SLA!
    status: 'PENDING_DA_SANCTION',
    slaBreached: true,
    daRemark: 'Forest Department environmental clearance in progress',
  },
  {
    id: 'MP-2026-PROP-02',
    title: 'Installation of High-Mast Solar LED Lighting across 12 Gram Panchayats',
    category: 'LIGHTING',
    estimatedCost: '₹28.50 Lakh',
    submittedDate: '12-Sep-2026',
    daysPending: 28, // Within 45 days
    status: 'TECHNICAL_SCRUTINY',
    slaBreached: false,
    daRemark: 'Detailed project estimate under review with District Executive Engineer',
  },
  {
    id: 'MP-2026-PROP-03',
    title: 'Construction of Multipurpose Gymnasium & Sports Complex at Baramati',
    category: 'SPORTS',
    estimatedCost: '₹50.00 Lakh',
    submittedDate: '29-Sep-2026',
    daysPending: 11, // Within 45 days
    status: 'SITE_INSPECTION',
    slaBreached: false,
    daRemark: 'Joint site measurement conducted with Sub-Divisional Officer',
  },
];

// Approved Works Directory with AS/TS references
export const mockApprovedWorks = [
  {
    uid: 'MPLAD-2024-MH-001',
    title: 'Construction of Community Hall at Gram Panchayat Haveli',
    category: 'COMMUNITY_CENTER',
    sanctionedAmount: '₹48.50 Lakh',
    agency: 'M/s ABC Constructions',
    asOrder: 'DA/PUNE/AS-2024-88',
    tsOrder: 'EE/PWD/TS-2024-142',
    completionPercent: 65,
    status: 'IN_PROGRESS',
    scBeneficiary: true,
  },
  {
    uid: 'MPLAD-2024-MH-002',
    title: 'Solar Street Lighting for Village Shivare (50 poles)',
    category: 'LIGHTING',
    sanctionedAmount: '₹14.80 Lakh',
    agency: 'Surya Green Tech Infra',
    asOrder: 'DA/PUNE/AS-2024-94',
    tsOrder: 'EE/MSEDC/TS-2024-033',
    completionPercent: 100,
    status: 'COMPLETED',
    scBeneficiary: false,
  },
  {
    uid: 'MPLAD-2024-MH-003',
    title: 'Repair of Primary School Building Khed with Smart Classes',
    category: 'EDUCATION',
    sanctionedAmount: '₹24.00 Lakh',
    agency: 'Zilla Parishad Works Dept',
    asOrder: 'DA/PUNE/AS-2024-106',
    tsOrder: 'EE/ZP/TS-2024-211',
    completionPercent: 80,
    status: 'IN_PROGRESS',
    stBeneficiary: true,
  },
];

// Pre-Requisites & Quota Monitoring Metrics
export const mockPreRequisites = {
  scTarget: 15.0,
  scAllocated: 16.2,
  stTarget: 7.5,
  stAllocated: 8.1,
  slaComplianceRate: 91.4,
  averageSanctionDays: 29.2,
  mandatoryItemsSatisfied: 6,
  mandatoryItemsTotal: 6,
};
