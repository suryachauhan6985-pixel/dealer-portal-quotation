// Authoritative Single Source of Truth for Sunvine EPC Portal Versioning
// Strictly semantic versioning (MAJOR.MINOR.PATCH)

export const APP_VERSION = '2.1.0';
export const RELEASE_DATE = 'September 2026';
export const RELEASE_TYPE = 'MINOR'; // 'MAJOR' | 'MINOR' | 'PATCH'

// Verified changelog items derived from real repository Git history
export const CURRENT_RELEASE_CHANGELOG = {
  version: 'v2.1.0',
  title: 'BOM Preset Engine & Comparative Multi-Panel Proposals',
  date: 'September 2026',
  type: 'MINOR',
  highlights: [
    'Standard 3.3 kW BOM & BoS hardware presets engine with real-time rate calculator',
    'Interactive side-by-side Multi-Panel comparative customer proposal generation',
    'Commercial zero-subsidy logic & balanced 2x2 system details alignment',
    'Structured CSV partner directory export & interactive breadcrumbs navigation'
  ],
  categories: {
    features: [
      'Standard 3.3 kW BOM & BoS hardware presets engine with real-time rate calculator',
      'Interactive side-by-side Multi-Panel comparative customer proposal generation',
      'Commercial zero-subsidy logic & balanced 2x2 system details alignment',
      'Structured CSV partner directory export & interactive breadcrumbs navigation'
    ],
    improvements: [
      'Full-width quotation feed ledger eliminating horizontal table scrollbars',
      'Subtle hover elevation and green border transition across all KPI summary cards',
      'Persistent multi-step quotation drafting preserving customer data across tabs'
    ],
    fixes: [
      'Interactive notification panel dismiss mechanism with persistent state storage',
      'Dynamic version and changelog synchronization for system release alerts'
    ]
  }
};

// Complete historical release register verified from Git log
export const VERSION_HISTORY = [
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
