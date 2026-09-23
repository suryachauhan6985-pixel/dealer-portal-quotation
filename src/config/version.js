// Authoritative Single Source of Truth for Sunvine EPC Portal Versioning
// Strictly semantic versioning (MAJOR.MINOR.PATCH)

export const APP_VERSION = '2.1.1';
export const RELEASE_DATE = '24 September 2026';
export const RELEASE_TYPE = 'PATCH'; // 'MAJOR' | 'MINOR' | 'PATCH'

// Verified changelog items derived from real repository Git history
export const CURRENT_RELEASE_CHANGELOG = {
  version: 'v2.1.1',
  title: 'Notification Panel Interactivity & UI Polish Release',
  date: '24 September 2026',
  type: 'PATCH',
  highlights: [
    'Direct Notification Panel opening from real-time update toast on "View Update"',
    'Interactive Release Logs & Changelog modal showing detailed patch notes',
    'Global KPI card hover animations with smooth grow effect and green border',
    'Clean CSV directory export without disruptive toaster popups',
    'Streamlined admin-controlled dealer credentials and settings hub'
  ],
  categories: {
    features: [
      'Interactive Notification Panel Integration: Clicking "View Update" on notification popups immediately opens the slide-in notification tray',
      'Detailed Release Notes & Logs Viewer: Direct access to version changelog, feature breakdowns, and patch histories',
      'Standardized Global KPI Hover Cards: Uniform cubic-bezier grow effect (translateY(-3px)), elevation shadow, and brand green border highlight'
    ],
    improvements: [
      'Export Directory Optimization: One-click direct CSV download in Dealer Management without intermediate toast alert cards',
      'Dealer Settings Cleanup: Streamlined settings hub with official Sunvine Partner Support priority helpline in sidebar',
      'Admin-Managed Credentials: Dealer passwords configured and managed centrally by Super Admin'
    ],
    fixes: [
      'Dynamic Version Detection: Automatic detection of newly deployed portal releases on reload / hard refresh',
      'Persistent Notification Dismissal: LocalStorage persistence preventing already-dismissed notifications from re-appearing',
      'Clockwise Login Spinner: Restored natural clockwise rotation on vertically mirrored solar portal loader'
    ]
  }
};

// Complete historical release register verified from Git log
export const VERSION_HISTORY = [
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
