/**
 * Mock data structures for Ministry Admin Command Center
 * Ensures rich, instant visualization even without active backend responses.
 */

export const mockKpiData = {
  totalProjects: 1234,
  budgetAllocatedCr: 1200,
  efficiencyRating: 92,
  date: '21 OCT 2026',
  userName: 'Dr. Rajesh Kumar',
  userRole: 'Admin User',

  // 7 Dual-Bar comparisons from the reference design
  barMetrics: [
    { label: 'Projects', val1: 400, val2: 600 },
    { label: 'Budget', val1: 350, val2: 680 },
    { label: 'Plans', val1: 520, val2: 580 },
    { label: 'Efficiency', val1: 720, val2: 480 },
    { label: 'Execs', val1: 750, val2: 610 },
    { label: 'MFR', val1: 420, val2: 880 },
    { label: 'CFB', val1: 740, val2: 500 },
  ],

  // Donut chart distribution
  schemesDistribution: [
    { name: 'Scheme A (Drinking Water)', value: 40, color: '#2a7b88' },
    { name: 'Scheme B (Roads & Transit)', value: 30, color: '#38a169' },
    { name: 'Scheme C (Sanitation & Waste)', value: 30, color: '#3182ce' },
    { name: 'Scheme D (Education & Health)', value: 10, color: '#dd6b20' },
    { name: 'Scheme E (Community Infra)', value: 20, color: '#e53e3e' },
  ],

  // Spline wave data for Jan - May (inside Overall KPIs)
  miniWaveTrend: [
    { month: 'Jan', val1: 200, val2: 350 },
    { month: 'Feb', val1: 420, val2: 580 },
    { month: 'Mar', val1: 380, val2: 890 },
    { month: 'Apr', val1: 650, val2: 420 },
    { month: 'May', val1: 780, val2: 920 },
  ],

  // Recent Activity Spline Wave (Jan - Jul)
  recentActivityData: [
    { month: 'Jan', val1: 20, val2: 35 },
    { month: 'Feb', val1: 42, val2: 58 },
    { month: 'Mar', val1: 35, val2: 48 },
    { month: 'Apr', val1: 72, val2: 54 },
    { month: 'May', val1: 38, val2: 32 },
    { month: 'Jun', val1: 68, val2: 52 },
    { month: 'Jul', val1: 62, val2: 48 },
  ],

  // Recent Reviews Metric Blocks
  recentReviews: {
    contractorRatings: '4.8 / 5',
    contractorCount: '1,348 Rated',
    schemeEfficiency: '92%',
    onTimeDeliveries: '88.4%',
  },

  // Recent Data Feeds with sparkline coordinate points
  recentDataFeeds: [
    { title: 'Scheme A Oct 20 Data', trend: [10, 25, 18, 30, 45, 38, 55], color: '#2a7b88', change: '+12.4%' },
    { title: 'Budget Allocation Report', trend: [20, 15, 35, 28, 42, 50, 48], color: '#3182ce', change: '+8.1%' },
    { title: 'District Expenditure Audit', trend: [15, 22, 20, 38, 32, 44, 60], color: '#38a169', change: '+15.2%' },
    { title: 'National Compliance Data', trend: [30, 28, 35, 42, 40, 52, 58], color: '#805ad5', change: '+6.8%' },
  ],
};

// Heatmap data by state
export const mockStateUtilization = [
  { state: 'Maharashtra', allocated: 520, spent: 485, percent: 93.2, risk: 'Low', lat: 19.7515, lng: 75.7139 },
  { state: 'Uttar Pradesh', allocated: 780, spent: 690, percent: 88.5, risk: 'Low', lat: 26.8467, lng: 80.9462 },
  { state: 'Gujarat', allocated: 380, spent: 345, percent: 90.8, risk: 'Low', lat: 22.2587, lng: 71.1924 },
  { state: 'Karnataka', allocated: 410, spent: 350, percent: 85.4, risk: 'Medium', lat: 15.3173, lng: 75.7139 },
  { state: 'Tamil Nadu', allocated: 460, spent: 415, percent: 90.2, risk: 'Low', lat: 11.1271, lng: 78.6569 },
  { state: 'Bihar', allocated: 490, spent: 330, percent: 67.3, risk: 'High', lat: 25.0961, lng: 85.3131 },
  { state: 'West Bengal', allocated: 450, spent: 360, percent: 80.0, risk: 'Medium', lat: 22.9868, lng: 87.8550 },
  { state: 'Madhya Pradesh', allocated: 430, spent: 380, percent: 88.4, risk: 'Low', lat: 22.9734, lng: 78.6569 },
  { state: 'Rajasthan', allocated: 390, spent: 290, percent: 74.3, risk: 'High', lat: 27.0238, lng: 74.2179 },
  { state: 'Punjab', allocated: 220, spent: 195, percent: 88.6, risk: 'Low', lat: 31.1471, lng: 75.3412 },
];

// Agency Performance Matrix
export const mockAgencyPerformance = [
  { agency: 'Public Works Dept (PWD)', totalWorks: 420, completed: 375, delayed: 32, rate: 89.3 },
  { agency: 'Zilla Parishad Rural Works', totalWorks: 310, completed: 282, delayed: 18, rate: 91.0 },
  { agency: 'Central PWD (CPWD)', totalWorks: 190, completed: 172, delayed: 12, rate: 90.5 },
  { agency: 'Rural Water Supply & Sanitation', totalWorks: 240, completed: 198, delayed: 35, rate: 82.5 },
  { agency: 'State Road Development Corp', totalWorks: 150, completed: 138, delayed: 8, rate: 92.0 },
];

// Critical Fraud & Risk Intelligence Alerts with XAI Details
export const mockFraudAlerts = [
  {
    id: 'ALT-2026-901',
    projectUid: 'MPLAD-2024-MH-001',
    title: 'Suspected Duplicate Asset Detection across Adjacent Talukas',
    type: 'DUPLICATE_ASSET',
    severity: 'CRITICAL',
    confidenceScore: 96,
    district: 'Pune / Nashik Border',
    state: 'Maharashtra',
    estimatedLoss: '₹48.50 Lakh',
    flagDate: '19 Oct 2026',
    status: 'INVESTIGATING',
    xai: {
      ruleViolated: 'MPLADS Guidelines 2023 Clause 3.4 — Asset Non-Duplication Principle',
      anomalySummary: 'Image perceptual hashing (pHash) detected 98.4% visual similarity with sanctioned community center in Haveli (MPLAD-2023-MH-882).',
      evidenceItems: [
        { label: 'Image Hash Similarity', value: '98.4% Match (Near Duplicate)' },
        { label: 'GPS Radius Distance', value: '14.2 km (Borderline geo-fence)' },
        { label: 'Same Executing Agency', value: 'M/s ABC Constructions' },
        { label: 'Bill of Quantities Overlap', value: '92% identical cement/steel ratios' },
      ],
      recommendation: 'Freeze second milestone disbursal immediately. Order physical joint inspection by Sub-Divisional Officer (SDO).',
    },
  },
  {
    id: 'ALT-2026-902',
    projectUid: 'MPLAD-2024-UP-042',
    title: 'Severe Cost Inflation above CPWD Schedule of Rates (SoR)',
    type: 'BUDGET_INFLATION',
    severity: 'HIGH',
    confidenceScore: 92,
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    estimatedLoss: '₹28.10 Lakh',
    flagDate: '18 Oct 2026',
    status: 'OPEN',
    xai: {
      ruleViolated: 'MoSPI Financial Code — CPWD Schedule of Rates (SoR 2023) Cost Ceilings',
      anomalySummary: 'Excavation and reinforced cement concrete (RCC) rates quoted at ₹14,200/cu.m vs district benchmark of ₹8,400/cu.m (+69% variance).',
      evidenceItems: [
        { label: 'SoR Benchmark Rate', value: '₹8,400 / cu.m (CPWD Lucknow)' },
        { label: 'Contractor Tendered Rate', value: '₹14,200 / cu.m (+69.0%)' },
        { label: 'Unjustified Excess Budget', value: '₹28,10,000' },
        { label: 'Estimated Market Cost', value: '₹41,20,000 vs Quoted ₹69,30,000' },
      ],
      recommendation: 'Issue show-cause notice to District Planning Officer. Demand revised estimate aligned with state PWD SoR.',
    },
  },
  {
    id: 'ALT-2026-903',
    projectUid: 'MPLAD-2024-GJ-109',
    title: 'Contractor Cartelization in Multi-Ward Solar Streetlighting',
    type: 'CARTELIZATION',
    severity: 'HIGH',
    confidenceScore: 89,
    district: 'Ahmedabad',
    state: 'Gujarat',
    estimatedLoss: '₹34.00 Lakh',
    flagDate: '17 Oct 2026',
    status: 'OPEN',
    xai: {
      ruleViolated: 'Central Vigilance Commission (CVC) Tender Guidelines & Competition Act 2002',
      anomalySummary: 'Bidding timestamps and IP addresses for 3 supposedly rival bidding agencies were identical within 4 minutes.',
      evidenceItems: [
        { label: 'Common Submission IP', value: '103.24.12.88 (Ahmedabad Cyber Hub)' },
        { label: 'Common Authorized Signatory', value: 'Same PAN verification link' },
        { label: 'Bid Spread Margin', value: '0.4% artificial margin rotation' },
        { label: 'Total Value at Risk', value: '₹64,00,000 across 3 wards' },
      ],
      recommendation: 'Scrap technical bids and refer empanelled firms to State Anti-Corruption Bureau (ACB).',
    },
  },
  {
    id: 'ALT-2026-904',
    projectUid: 'MPLAD-2024-DL-018',
    title: 'Exceeded Statutory 45-Day Sanction SLA Limit',
    type: 'DELAY_RISK',
    severity: 'MEDIUM',
    confidenceScore: 100,
    district: 'New Delhi',
    state: 'Delhi',
    estimatedLoss: '₹50.00 Lakh Fund Idle',
    flagDate: '15 Oct 2026',
    status: 'INVESTIGATING',
    xai: {
      ruleViolated: 'MPLADS Guidelines 2023 Clause 4.2 — Mandatory 45-Day Sanction Ceiling',
      anomalySummary: 'Proposal recommended on 12-Jul-2026 has been pending in District Authority queue for 99 days without administrative sanction.',
      evidenceItems: [
        { label: 'Recommendation Date', value: '12 July 2026' },
        { label: 'Current Pending Duration', value: '99 Days (SLA: 45 Days)' },
        { label: 'MP Escalation Notice', value: 'Formally recorded in Lok Sabha Portal' },
        { label: 'Reason Logged by DA', value: 'Site clearance pending from Forest Dept' },
      ],
      recommendation: 'Issue auto-escalation alert to Chief Secretary of State for immediate expedited resolution.',
    },
  },
];

// Scheme-Level Risk Trends Data for Recharts
export const mockRiskTrends = [
  { month: 'Apr', duplicateAssets: 4, costInflation: 12, cartelBids: 2, slaBreaches: 8 },
  { month: 'May', duplicateAssets: 3, costInflation: 14, cartelBids: 3, slaBreaches: 11 },
  { month: 'Jun', duplicateAssets: 6, costInflation: 19, cartelBids: 5, slaBreaches: 15 },
  { month: 'Jul', duplicateAssets: 5, costInflation: 16, cartelBids: 4, slaBreaches: 13 },
  { month: 'Aug', duplicateAssets: 8, costInflation: 22, cartelBids: 6, slaBreaches: 18 },
  { month: 'Sep', duplicateAssets: 7, costInflation: 18, cartelBids: 5, slaBreaches: 14 },
  { month: 'Oct', duplicateAssets: 4, costInflation: 15, cartelBids: 3, slaBreaches: 9 },
];

// Financials & Forecasting Data
export const mockFinancials = {
  outlays: [
    { name: 'Completed Works', value: 600, color: '#38a169', percent: '50%' },
    { name: 'Ongoing Works', value: 480, color: '#3182ce', percent: '40%' },
    { name: 'Unspent Entitlement', value: 120, color: '#e53e3e', percent: '10%' },
  ],
  delayRadarDistricts: [
    { district: 'Gaya', state: 'Bihar', riskPercent: 88, unspentCr: 18.4, bottleneck: 'Land acquisition & IA delays' },
    { district: 'Barmer', state: 'Rajasthan', riskPercent: 82, unspentCr: 14.2, bottleneck: 'Contractor insolvency' },
    { district: 'Koppal', state: 'Karnataka', riskPercent: 74, unspentCr: 11.5, bottleneck: 'Forest clearance hurdles' },
    { district: 'Murshidabad', state: 'West Bengal', riskPercent: 71, unspentCr: 12.8, bottleneck: 'Tendering re-invitations' },
    { district: 'Balrampur', state: 'Uttar Pradesh', riskPercent: 65, unspentCr: 9.6, bottleneck: 'Technical sanction delays' },
  ],
  costBenchmarkItems: [
    { item: 'Community Hall (2,500 sq.ft)', nationalAvg: '₹32.5 L', stateAvg: '₹34.0 L', variance: '+4.6%', status: 'Normal' },
    { item: 'Solar Street Lights (50 poles)', nationalAvg: '₹14.8 L', stateAvg: '₹19.2 L', variance: '+29.7%', status: 'Inflated' },
    { item: 'CC Pavement Road (1 km)', nationalAvg: '₹42.0 L', stateAvg: '₹44.5 L', variance: '+5.9%', status: 'Normal' },
    { item: 'Deep Borewell with Submersible', nationalAvg: '₹6.2 L', stateAvg: '₹8.9 L', variance: '+43.5%', status: 'Inflated' },
    { item: 'Public School Smart Classrooms', nationalAvg: '₹18.5 L', stateAvg: '₹17.9 L', variance: '-3.2%', status: 'Optimal' },
  ],
};

// Policy & Compliance Data
export const mockPolicyCompliance = {
  overall45DayCompliance: 84.6, // percentage of districts adhering
  scQuotaTarget: 15.0,
  scQuotaAchieved: 16.2,
  stQuotaTarget: 7.5,
  stQuotaAchieved: 8.1,
  stateSlaRankings: [
    { state: 'Gujarat', compliance: 96.4, avgDays: 24, status: 'Exemplary' },
    { state: 'Maharashtra', compliance: 92.1, avgDays: 28, status: 'Good' },
    { state: 'Tamil Nadu', compliance: 91.5, avgDays: 29, status: 'Good' },
    { state: 'Uttar Pradesh', compliance: 86.8, avgDays: 36, status: 'Compliant' },
    { state: 'Madhya Pradesh', compliance: 82.3, avgDays: 39, status: 'Compliant' },
    { state: 'Bihar', compliance: 61.2, avgDays: 58, status: 'Non-Compliant' },
  ],
};

// System Health Status
export const mockSystemHealth = {
  mysql: { status: 'Connected', uptime: '99.98%', latencyMs: 12, connections: 24 },
  qdrant: { status: 'Connected', collection: 'mplads_guidelines', pointsCount: 48, latencyMs: 28 },
  gemini: { status: 'Configured', model: 'gemini-3.6-flash', avgResponseSec: 1.4, quotaRemaining: 'Unlimited' },
  apiThroughput: { requestsPerMin: 342, errorRate: '0.02%', activeSessions: 18 },
};
