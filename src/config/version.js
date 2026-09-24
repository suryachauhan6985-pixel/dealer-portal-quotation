// Authoritative Single Source of Truth for Sunvine EPC Portal Versioning
// Strictly semantic versioning (MAJOR.MINOR.PATCH)

export const APP_VERSION = '2.2.0';
export const RELEASE_DATE = '24 September 2026';
export const RELEASE_TYPE = 'MINOR'; // 'MAJOR' | 'MINOR' | 'PATCH'

// Verified changelog items derived from real repository Git history
export const CURRENT_RELEASE_CHANGELOG = {
  version: 'v2.2.0',
  title: 'Admin Master Ledger & Catalog Operations Suite',
  date: '24 September 2026',
  type: 'MINOR',
  highlights: [
    'Interactive Top Filters & Structured CSV Ledger Exports for Gujarat Quotations Master',
    'Dynamic Average Dealer Margin calculation with automated regulatory threshold warnings',
    'Hardware Catalog Suite: Excel specs import, catalog CSV export, and bulk price editor',
    'WhatsApp Price Broadcast Engine with pre-formatted rate sheets and direct-to-dealer wa.me links',
    'Audit Trail & Timeline modal with multi-tab storage synchronization and responsive tablet layouts'
  ],
  categories: {
    features: [
      'Quotation Master Top Filters: Real-time date presets, dealer partner search, and DISCOM circle filters with one-click reset',
      'Structured CSV Proposals Ledger: Clean CSV export of Gujarat quotation audit trails and margin records',
      'Catalog Operations Suite: Excel specs import with custom template, bulk price update (% & flat ₹/Wp), and full catalog CSV download',
      'WhatsApp Price Broadcast: Official broadcast modal with rate cards, WhatsApp Web integration, and partner direct messaging',
      'Quotation Audit Trail Modal: Detailed event timeline from quotation creation and specs configuration to pricing lock and approval',
      'Dynamic Partner Profile Editing: Full dealer onboarding and profile editing with real-time state synchronization'
    ],
    improvements: [
      'Dynamic Average Dealer Margin: Weighted average margin calculation across filtered quotations with compliance status indicators',
      'Dynamic Pagination Windowing: Seamless navigation across intermediate pages with dynamic ellipsis windowing',
      'Multi-Tab Storage Synchronization: Instant cross-tab sync via window storage listeners for hardware, dealers, pricing, and notifications',
      'Full Admin Bottom Navigation: All 6 admin tabs accessible in mobile bottom navigation bar with horizontal scrolling'
    ],
    fixes: [
      'Tablet Responsive Grid: Resolved 157px horizontal overflow on tablet viewports (768px-1024px) in New Quotation builder',
      'Dealer Dashboard SVG Overflow: Clipped background geometric pattern to prevent horizontal scrolling on mobile/tablet',
      'Catalog Item Archival Filtering: Archived modules and inverters safely hidden from dealer quotation selection dropdowns'
    ]
  }
};

// Complete historical release register verified from Git log
export const VERSION_HISTORY = [
  {
    version: 'v2.2.0',
    date: '2026-09-24',
    type: 'MINOR',
    summary: 'Interactive top filters, CSV ledger exports, dynamic average dealer margin, Excel specs import, catalog CSV export, bulk price updates, WhatsApp price broadcast, and audit trail timeline.',
    highlights: [
      'Interactive Top Filters & CSV Ledger Exports',
      'Dynamic Average Dealer Margin calculation',
      'Hardware Specs Import & Bulk Price Editor',
      'WhatsApp Price Broadcast Engine',
      'Audit Trail modal & tablet responsive layouts'
    ]
  },
  {
    version: 'v2.1.1',
    date: '2026-09-24',
    type: 'PATCH',
    summary: 'Notification panel integration, interactive changelog modal, global KPI card hover animations, and admin credential control.',
    highlights: [
      'View Update directly opens Notification Panel',
      'Interactive Release Logs & Changelog Modal',
      'Global KPI card grow effect & green border',
      'Seamless CSV export directory downloads'
    ]
  },
  {
    version: 'v2.1.0',
    date: '2026-09-24',
    type: 'MINOR',
    summary: 'BOM Preset Engine, comparative multi-panel quotes, and partner directory CSV ledger.',
    highlights: [
      'BOM & BoS 3.3kW preset specifications matrix',
      'Multi-panel comparative quotes toggle',
      'Zero-subsidy commercial project mode',
      'Persistent multi-step quote draft & CSV export'
    ]
  },
  {
    version: 'v2.0.0',
    date: '2026-09-22',
    type: 'MAJOR',
    summary: 'Super Admin National Operations Overview, calibrated Gujarat ledger, CSV export, and presets sync.',
    highlights: [
      'Super Admin National Operations Overview',
      '1,480 calibrated Gujarat quotations & 550 dealers',
      'Real CSV financial ledger export',
      'Cross-portal pricing & margin presets sync'
    ]
  },
  {
    version: 'v2.0.0',
    date: '2026-09-22',
    type: 'MAJOR',
    summary: 'Super Admin National Operations Overview, calibrated Gujarat ledger, CSV export, and presets sync.',
    highlights: [
      'Super Admin National Operations Overview',
      '1,480 calibrated Gujarat quotations & 550 dealers',
      'Real CSV financial ledger export',
      'Cross-portal pricing & margin presets sync'
    ]
  },
  {
    version: 'v1.4.0',
    date: '2026-09-21',
    type: 'MINOR',
    summary: 'Gujarat 550 dealers database integration and PDF BOS price matrix.',
    highlights: [
      '100% Gujarat solar dealer directory across 30 cities',
      'Official BOS pricing matrix and technical BOM specifications from PDF',
      'Initial responsive layout hardening'
    ]
  },
  {
    version: 'v1.3.0',
    date: '2026-09-20',
    type: 'MINOR',
    summary: 'PWA native auto-update, Navigation bar with role-based menus, and notification panel.',
    highlights: [
      'Native in-app PWA update modal',
      'Unified desktop and mobile navigation header',
      'Initial notification drawer'
    ]
  },
  {
    version: 'v1.2.0',
    date: '2026-09-18',
    type: 'PATCH',
    summary: 'Dealer Dashboard telemetry metrics and official Sunvine support helpline.',
    highlights: [
      'Dealer Dashboard KPI cards and pipeline tracking',
      'Official support helpline (+91 80000 50580) integration',
      'Customer WhatsApp proposal sharing'
    ]
  },
  {
    version: 'v1.1.0',
    date: '2026-09-16',
    type: 'MINOR',
    summary: '4-Page Customer Proposal PDF engine and quotation editing.',
    highlights: [
      '4-Page client proposal PDF generation',
      'DISCOM grid-tie documentation and statutory compliance',
      'Direct quote edit and recalculation pipeline'
    ]
  },
  {
    version: 'v1.0.0',
    date: '2026-09-10',
    type: 'MAJOR',
    summary: 'Initial release of Sunvine Solar EPC Dealer Portal.',
    highlights: [
      'Dealer authentication and dashboard',
      'Basic quotation calculator',
      'PM Surya Ghar DBT subsidy estimator'
    ]
  }
];
