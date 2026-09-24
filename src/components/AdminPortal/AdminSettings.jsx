import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

export default function AdminSettings() {
  const { governanceSettings, updateGovernanceSettings, setActiveTab: setActiveTabGlobal } = useApp();
  const [activeTab, setActiveTab] = useState('governance');
  const [saved, setSaved] = useState(false);
  const [maintenance, setMaintenance] = useState(false);

  const [settings, setSettings] = useState(() => governanceSettings || {
    enforceAlmm: true,
    pmSuryaGharActive: true,
    maxDealerMarginPerKW: 8000,
    minDealerMarginPerKW: 0,
    quoteExpiryDays: 15,
    autoGedaSync: true,
    requireAdminApprovalAboveKW: 100,
    retentionMonths: 36,
    discomApiStatus: 'Online - 12ms ping',
    gedaSyncStatus: 'Connected (Hourly)',
    lastBackupTimestamp: 'Today, 01:15 AM'
  });

  useEffect(() => {
    if (governanceSettings) {
      setSettings(governanceSettings);
    }
  }, [governanceSettings]);

  const handleSave = (e) => {
    e.preventDefault();
    if (updateGovernanceSettings) {
      updateGovernanceSettings(settings);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex flex-col w-full gap-6">
      {/* 1. BREADCRUMBS, HEADER & SYSTEM INTEGRITY BAR */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-surface-container-lowest p-6 rounded-xl shadow-sm">
        <div className="flex flex-col gap-2 max-w-4xl">
          <div className="flex items-center gap-2 text-secondary font-label-xs text-label-xs uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setActiveTabGlobal && setActiveTabGlobal('admin_dashboard')}
              className="hover:text-primary transition-colors cursor-pointer text-left"
              title="Navigate to Executive Overview"
            >
              Admin Operations
            </button>
            <span className="text-secondary/40 font-bold">/</span>
            <button
              type="button"
              onClick={() => setActiveTab('governance')}
              className="hover:text-primary transition-colors cursor-pointer text-left"
              title="Reset to Governance view"
            >
              Global System Architecture
            </button>
            <span className="text-secondary/40 font-bold">/</span>
            <span className="text-on-surface font-semibold">Master Settings</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">System Master Settings &amp; Enterprise Governance</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-container/15 text-primary font-label-xs text-label-xs font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
              Cluster 01-PROD
            </span>
          </div>
          <p className="font-body-md text-body-md text-secondary leading-relaxed">
            Centralized administration for national multi-tier dealer quotas, real-time pricing engines, RBAC permission matrix, state DISCOM protocol maps, and regulatory audit compliance logs.
          </p>
        </div>

        {/* Top Action Controls & Maintenance Switch */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Maintenance Mode Toggle */}
          <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-low rounded-lg shadow-sm">
            <span className="material-symbols-outlined text-[18px] text-secondary">tune</span>
            <span className="font-label-xs text-label-xs text-secondary uppercase font-semibold">Maintenance</span>
            <button
              type="button"
              onClick={() => setMaintenance(!maintenance)}
              className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${maintenance ? 'bg-error' : 'bg-surface-container-highest'
                }`}
            >
              <span
                className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${maintenance ? 'translate-x-4' : 'translate-x-0'
                  }`}
              />
            </button>
            <span className="font-label-xs text-label-xs font-bold text-secondary">
              {maintenance ? 'ACTIVE' : 'OFF'}
            </span>
          </div>

          {/* Deploy CTA */}
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-container text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-container/30 active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">
              {saved ? 'verified' : 'lock_reset'}
            </span>
            <span>{saved ? 'Enforced Globally' : 'Save changes'}</span>
          </button>
        </div>
      </div>

      {/* 2. ADMIN HORIZONTAL TABBED WORKSPACE */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-1 px-4 overflow-x-auto bg-surface-container-low/40">
          <button
            onClick={() => setActiveTab('governance')}
            className={`flex items-center gap-2 py-3 px-3.5 font-label-sm text-label-sm whitespace-nowrap transition-colors ${activeTab === 'governance'
                ? 'font-bold text-on-surface bg-surface-container-lowest rounded-t-lg shadow-sm'
                : 'text-secondary hover:text-on-surface'
              }`}
          >
            <span className="material-symbols-outlined text-[17px] text-primary-container">shield_person</span>
            <span>1. Enterprise Governance &amp; ALMM</span>
            {activeTab === 'governance' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-container"></span>}
          </button>

          <button
            onClick={() => setActiveTab('margins')}
            className={`flex items-center gap-2 py-3 px-3.5 font-label-sm text-label-sm whitespace-nowrap transition-colors ${activeTab === 'margins'
                ? 'font-bold text-on-surface bg-surface-container-lowest rounded-t-lg shadow-sm'
                : 'text-secondary hover:text-on-surface'
              }`}
          >
            <span className="material-symbols-outlined text-[17px]">pie_chart</span>
            <span>2. Dealer Quota &amp; Margin Caps</span>
            {activeTab === 'margins' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-container"></span>}
          </button>

          <button
            onClick={() => setActiveTab('infrastructure')}
            className={`flex items-center gap-2 py-3 px-3.5 font-label-sm text-label-sm whitespace-nowrap transition-colors ${activeTab === 'infrastructure'
                ? 'font-bold text-on-surface bg-surface-container-lowest rounded-t-lg shadow-sm'
                : 'text-secondary hover:text-on-surface'
              }`}
          >
            <span className="material-symbols-outlined text-[17px]">hub</span>
            <span>3. DISCOM Grid Node Bridge</span>
            {activeTab === 'infrastructure' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-container"></span>}
          </button>
        </div>

        {/* Tab Content 1: Governance & Compliance */}
        {activeTab === 'governance' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary text-[22px]">policy</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">MNRE Regulatory Governance &amp; Central DBT</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-primary-container/20 text-primary font-label-xs text-label-xs font-bold">
                COMPLIANCE ENFORCED
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-start justify-between p-4 rounded-xl bg-surface-container-low border border-surface-container-high">
                <div>
                  <span className="font-label-md text-label-md text-on-surface font-bold block">
                    Mandatory ALMM Compliant Module Enforcement
                  </span>
                  <span className="font-body-sm text-body-sm text-secondary block mt-1">
                    Strictly prohibit non-ALMM (Approved List of Models and Manufacturers) listed solar photovoltaic modules from inclusion in grid-interactive customer proposals.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enforceAlmm}
                  onChange={(e) => setSettings({ ...settings, enforceAlmm: e.target.checked })}
                  className="rounded text-primary-container focus:ring-primary-container w-5 h-5 mt-1"
                />
              </div>

              <div className="flex items-start justify-between p-4 rounded-xl bg-surface-container-low border border-surface-container-high">
                <div>
                  <span className="font-label-md text-label-md text-on-surface font-bold block">
                    PM Surya Ghar: Muft Bijli Yojana Central DBT Auto-Calculation
                  </span>
                  <span className="font-body-sm text-body-sm text-secondary block mt-1">
                    Automatically inject central residential subsidy slabs (₹30,000 for 1kW, ₹60,000 for 2kW, ₹78,000 for 3kW+) into residential proposals nationwide.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.pmSuryaGharActive}
                  onChange={(e) => setSettings({ ...settings, pmSuryaGharActive: e.target.checked })}
                  className="rounded text-primary-container focus:ring-primary-container w-5 h-5 mt-1"
                />
              </div>

              <div className="flex items-start justify-between p-4 rounded-xl bg-surface-container-low border border-surface-container-high">
                <div>
                  <span className="font-label-md text-label-md text-on-surface font-bold block">
                    Automated GEDA State Registration Queue Sync
                  </span>
                  <span className="font-body-sm text-body-sm text-secondary block mt-1">
                    Dispatch approved dealer proposals to GEDA (Gujarat Energy Development Agency) API endpoint for net-metering synchronization.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoGedaSync}
                  onChange={(e) => setSettings({ ...settings, autoGedaSync: e.target.checked })}
                  className="rounded text-primary-container focus:ring-primary-container w-5 h-5 mt-1"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: Dealer Margin & Pricing */}
        {activeTab === 'margins' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary text-[22px]">price_change</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">National Margin Ceilings &amp; Quotas</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-xs text-label-xs font-bold">
                COMMERCIAL CAPS
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-surface-container-low">
                <label className="font-label-sm text-label-sm text-on-surface font-semibold">Maximum Dealer Margin (₹ / kW)</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2.5 text-secondary font-bold">₹</span>
                  <input
                    type="number"
                    value={settings.maxDealerMarginPerKW}
                    onChange={(e) => setSettings({ ...settings, maxDealerMarginPerKW: Number(e.target.value) })}
                    className="w-full pl-8 pr-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-lg font-headline-sm text-on-surface font-bold"
                  />
                </div>
                <span className="text-[11px] font-body-sm text-secondary">Authorized channel partners cannot exceed this margin per kW.</span>
              </div>

              <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-surface-container-low">
                <label className="font-label-sm text-label-sm text-on-surface font-semibold">High-Capacity Executive Approval Trigger</label>
                <div className="relative mt-1">
                  <input
                    type="number"
                    value={settings.requireAdminApprovalAboveKW}
                    onChange={(e) => setSettings({ ...settings, requireAdminApprovalAboveKW: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-lg font-headline-sm text-on-surface font-bold"
                  />
                  <span className="absolute right-3 top-2.5 text-secondary font-bold">kW</span>
                </div>
                <span className="text-[11px] font-body-sm text-secondary">Quotations exceeding this capacity require Headquarters review.</span>
              </div>

              <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-surface-container-low">
                <label className="font-label-sm text-label-sm text-on-surface font-semibold">Quotation Expiry Validity (Days)</label>
                <input
                  type="number"
                  value={settings.quoteExpiryDays}
                  onChange={(e) => setSettings({ ...settings, quoteExpiryDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-lg font-headline-sm text-on-surface font-bold mt-1"
                />
                <span className="text-[11px] font-body-sm text-secondary">Hardware pricing locks dynamically after validity expires.</span>
              </div>

              <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-surface-container-low">
                <label className="font-label-sm text-label-sm text-on-surface font-semibold">Audit Ledger Retention Window (Months)</label>
                <input
                  type="number"
                  value={settings.retentionMonths}
                  onChange={(e) => setSettings({ ...settings, retentionMonths: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-lg font-headline-sm text-on-surface font-bold mt-1"
                />
                <span className="text-[11px] font-body-sm text-secondary">Statutory compliance for EPC audits and GST ledgers.</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 3: Infrastructure */}
        {activeTab === 'infrastructure' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary text-[22px]">dns</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">DISCOM Grid Node Status</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary font-label-xs text-label-xs font-bold">
                ALL SYSTEMS OPERATIONAL
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-secondary">PGVCL Bridge</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse"></span>
                </div>
                <span className="font-headline-sm text-headline-sm text-on-surface">Live (12ms)</span>
                <span className="text-[11px] text-secondary">Metoda Sub-division link active</span>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-secondary">GEDA State Portal</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
                </div>
                <span className="font-headline-sm text-headline-sm text-on-surface">Connected</span>
                <span className="text-[11px] text-secondary">Hourly batch sync enabled</span>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-secondary">Encrypted DB Snapshot</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
                </div>
                <span className="font-headline-sm text-headline-sm text-on-surface">Today, 01:15 AM</span>
                <span className="text-[11px] text-secondary">AES-256 backup verified</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
