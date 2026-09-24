import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function DealerManagement() {
  const { dealers, addDealer, toggleDealerStatus, updateDealerPassword, tierMargins, updateTierMargins, addNotification, setActiveTab } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTabFilter, setActiveTabFilter] = useState('all');
  const [discomFilter, setDiscomFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);

  // Onboarding Form States
  const [newFirm, setNewFirm] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newZone, setNewZone] = useState('Rajkot & Saurashtra Zone (Western Gujarat)');
  const [newAddress, setNewAddress] = useState('');
  const [newGstin, setNewGstinState] = useState('');
  const [newPan, setNewPan] = useState('');
  const [newDiscomCode, setNewDiscomCode] = useState('PGVCL-VND-2025-0845');
  const [newTier, setNewTier] = useState('Gold EPC Partner (Quarterly Cap: 1.5 MW)');
  const [newCap, setNewCap] = useState('5,000');
  const [newPassword, setNewPassword] = useState('Sunvine@2026');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formError, setFormError] = useState('');

  // Password / Credentials Modal for Existing Dealers
  const [credModalDealer, setCredModalDealer] = useState(null);
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [copiedCreds, setCopiedCreds] = useState(false);
  const [credSavedNotice, setCredSavedNotice] = useState(false);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$';
    let pass = 'SV@';
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  // Tier Margins Quick Editor Form State
  const [tempTierMargins, setTempTierMargins] = useState(() => tierMargins || {});

  const setNewGstin = (val) => {
    const upper = val.toUpperCase();
    setNewGstinState(upper);
    if (upper.length >= 12) {
      setNewPan(upper.slice(2, 12));
    }
  };

  // Dynamic Metrics from real Gujarat dealers
  const totalDealersCount = (dealers || []).length;
  const activeDealersCount = (dealers || []).filter(d => d.status === 'Active').length;
  const pendingDealersCount = (dealers || []).filter(d => d.status === 'Pending').length;
  const suspendedDealersCount = (dealers || []).filter(d => d.status === 'Suspended').length;
  const totalCapacityMw = ((dealers || []).reduce((acc, d) => acc + (d.totalCapacityKw || 0), 0) / 1000).toFixed(1);

  // Filter dealers across Gujarat
  const filteredDealers = (dealers || []).filter((d) => {
    const term = searchTerm.toLowerCase().trim();
    const matchSearch =
      !term ||
      (d.firmName && d.firmName.toLowerCase().includes(term)) ||
      (d.contactPerson && d.contactPerson.toLowerCase().includes(term)) ||
      (d.city && d.city.toLowerCase().includes(term)) ||
      (d.id && d.id.toLowerCase().includes(term)) ||
      (d.gstin && d.gstin.toLowerCase().includes(term));

    if (!matchSearch) return false;
    if (activeTabFilter === 'active' && d.status !== 'Active') return false;
    if (activeTabFilter === 'pending' && d.status !== 'Pending') return false;
    if (activeTabFilter === 'suspended' && d.status !== 'Suspended') return false;

    if (discomFilter !== 'all' && !(d.discom || '').toLowerCase().includes(discomFilter.toLowerCase())) return false;
    if (tierFilter !== 'all' && d.tier !== tierFilter) return false;

    return true;
  });

  const totalPages = Math.ceil(filteredDealers.length / pageSize) || 1;
  const paginatedDealers = filteredDealers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Structured Tabular CSV Export of Dealer Directory (SR-44)
  const handleExportDirectory = () => {
    const dataToExport = filteredDealers;
    if (!dataToExport || dataToExport.length === 0) {
      alert('No dealer partner records found for the selected filters.');
      return;
    }

    const headers = [
      'Dealer ID',
      'Dealer / Firm Name',
      'Contact Person',
      'Mobile',
      'Email',
      'City',
      'State',
      'DISCOM Circle',
      'Pricing Tier',
      'Default Margin / kW (INR)',
      'Max Margin Cap / kW (INR)',
      'Total Quotes Issued',
      'Capacity Sold (kW)',
      'GSTIN',
      'PAN Number',
      'KYC Status',
      'Portal Status'
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvRows = [headers.join(',')];

    dataToExport.forEach(d => {
      const tierKey = (d.tier || '').toLowerCase().includes('diamond') ? 'diamond' :
                      (d.tier || '').toLowerCase().includes('platinum') ? 'platinum' :
                      (d.tier || '').toLowerCase().includes('silver') ? 'silver' : 'gold';
      const conf = tierMargins?.[tierKey] || { defaultMarginPerKw: 4500, maxMarginCapPerKw: 6000 };
      const defaultMargin = conf.defaultMarginPerKw || 4500;
      const marginCap = d.maxMarginCapPerKw || conf.maxMarginCapPerKw || 6000;

      const row = [
        escapeCsv(d.id),
        escapeCsv(d.firmName),
        escapeCsv(d.contactPerson),
        escapeCsv(d.mobile),
        escapeCsv(d.email),
        escapeCsv(d.city || 'Gujarat'),
        escapeCsv('Gujarat'),
        escapeCsv(`${d.discom || 'PGVCL'} Circle`),
        escapeCsv(d.tier || conf.tierName || 'Gold EPC Partner'),
        escapeCsv(defaultMargin),
        escapeCsv(marginCap),
        escapeCsv(d.totalQuotes || 0),
        escapeCsv(d.totalCapacityKw || 0),
        escapeCsv(d.gstin || '24AFPFS7402A1Z7'),
        escapeCsv(d.pan || (d.gstin ? d.gstin.slice(2, 12) : 'AFPFS7402A')),
        escapeCsv('Verified'),
        escapeCsv(d.status || 'Active')
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csvRows.join('\r\n'));
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', csvContent);
    const dateStamp = new Date().toISOString().split('T')[0];
    downloadLink.setAttribute('download', `sunvine_dealer_partners_${activeTabFilter}_${dateStamp}.csv`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleCreateDealer = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newFirm.trim() || !newContact.trim() || !newMobile.trim()) {
      setFormError('Please fill in required fields: Firm Name, Signatory, and Mobile Number.');
      return;
    }

    const tierClean = newTier.includes('Diamond') ? 'Diamond EPC' :
                      newTier.includes('Platinum') ? 'Platinum Tier' :
                      newTier.includes('Silver') ? 'Silver Installer' : 'Gold EPC';

    const cleanCap = Number(String(newCap).replace(/[^0-9]/g, '')) || 5000;

    const newDealerObj = {
      id: `SV-DLR-0${Math.floor(800 + Math.random() * 100)}`,
      firmName: newFirm.trim(),
      contactPerson: newContact.trim(),
      mobile: newMobile.trim(),
      email: newEmail.trim() || 'partner@sunvinedealer.in',
      city: newZone.includes('Rajkot') ? 'Rajkot' : newZone.includes('Surat') ? 'Surat' : newZone.includes('Vadodara') ? 'Vadodara' : 'Ahmedabad',
      state: 'Gujarat',
      discom: newZone.includes('Rajkot') ? 'PGVCL Circle' : newZone.includes('Surat') ? 'DGVCL Circle' : newZone.includes('Vadodara') ? 'MGVCL Circle' : 'UGVCL Circle',
      tier: tierClean,
      maxMarginCapPerKw: cleanCap,
      gstin: newGstin.trim() || '24AAECB1234F1Z5',
      pan: newPan.trim() || (newGstin.trim() ? newGstin.trim().slice(2, 12) : 'AAECB1234F'),
      totalQuotes: 0,
      totalCapacityKw: 0,
      status: 'Active',
      joinedDate: new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date()),
      password: newPassword.trim() || 'dealer123'
    };

    if (addDealer) {
      addDealer(newDealerObj);
    }
    if (addNotification) {
      addNotification({
        title: 'New EPC Dealer Onboarded',
        description: `${newFirm.trim()} (${tierClean}) added with assigned login credentials.`,
        type: 'success',
        icon: 'person_add',
        audience: 'admin'
      });
    }

    // Reset Form
    setNewFirm('');
    setNewContact('');
    setNewMobile('');
    setNewEmail('');
    setNewAddress('');
    setNewGstinState('');
    setNewPan('');
    setNewPassword('Sunvine@2026');
    setFormError('');
    setShowAddModal(false);
  };

  // If Onboarding Mode is Active, show exact Stitch Onboard Screen
  if (showAddModal) {
    return (
      <div className="flex flex-col w-full pb-16">
        {/* Breadcrumb Header */}
        <section className="bg-surface-container-lowest border-b border-surface-container-highest px-8 py-5 -mt-4 -mx-6 mb-6">
          <div className="max-w-[1520px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="inline-flex items-center gap-1 font-label-sm text-label-sm text-tertiary hover:text-primary transition-colors font-semibold"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Back to Dealer Management</span>
                </button>
                <span className="text-secondary/40 text-xs">/</span>
                <nav className="flex items-center gap-1.5 text-secondary font-label-xs text-label-xs">
                  <button
                    onClick={() => setActiveTab('admin_dashboard')}
                    className="hover:text-primary transition-colors cursor-pointer"
                    type="button"
                  >
                    Admin Console
                  </button>
                  <span>&gt;</span>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="hover:text-primary transition-colors cursor-pointer"
                    type="button"
                  >
                    Dealer Partners
                  </button>
                  <span>&gt;</span>
                  <span className="text-on-surface font-semibold">Onboard New Partner</span>
                </nav>
              </div>
              <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
                Onboard New EPC Dealer Partner
              </h1>
              <p className="font-body-md text-body-md text-secondary">
                Create authorized dealer profile, configure margin caps, DISCOM empanelment, and issue authenticated portal credentials.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 font-label-md text-label-md text-secondary hover:text-error transition-colors rounded-lg"
                type="button"
              >
                Discard Changes
              </button>
              <button
                onClick={handleCreateDealer}
                className="px-4 py-2 bg-primary-container text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary transition-colors shadow-sm flex items-center gap-1.5"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                <span>Save &amp; Onboard Partner</span>
              </button>
            </div>
          </div>
        </section>

        {/* 12-Column Layout */}
        <div className="grid grid-cols-12 gap-6 max-w-[1520px] mx-auto w-full">
          {/* Left Column (8 cols) */}
          <div className="col-span-12 xl:col-span-8 flex flex-col gap-6">
            {/* Section 1: Firm & Agency Profile */}
            <div className="bg-surface-container-lowest rounded-xl border border-surface-container-highest p-6 shadow-[0px_2px_8px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between pb-5 border-b border-surface-container-highest">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary-container/15 flex items-center justify-center text-primary font-bold">
                    <span className="material-symbols-outlined text-[20px]">apartment</span>
                  </div>
                  <div>
                    <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">1. Firm &amp; Agency Profile</h2>
                    <p className="font-body-sm text-body-sm text-secondary">Statutory operational business identity and primary communications point</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-label-xs font-label-xs bg-primary-container/15 text-primary font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  Verified Entity
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-6">
                <div className="col-span-2">
                  <label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1.5">
                    Firm / Agency Trade Name <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <input
                      className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-surface-container-highest rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 font-medium"
                      type="text"
                      value={newFirm}
                      onChange={(e) => setNewFirm(e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-primary">
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                  </div>
                  <p className="mt-1 font-body-sm text-body-sm text-secondary">Registered under Registrar of Companies (ROC - Ahmedabad)</p>
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1.5">
                    Authorized Signatory / Person <span className="text-error">*</span>
                  </label>
                  <input
                    className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-surface-container-highest rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
                    type="text"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1.5 flex items-center justify-between">
                    <span>Registered Mobile (OTP &amp; Login) <span className="text-error">*</span></span>
                    <span className="font-label-xs text-label-xs text-secondary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">lock</span> Auth Key
                    </span>
                  </label>
                  <input
                    className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-surface-container-highest rounded-lg text-body-md font-body-md text-on-surface font-semibold focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
                    type="text"
                    value={newMobile}
                    onChange={(e) => setNewMobile(e.target.value)}
                  />
                  <p className="mt-1 font-body-sm text-body-sm text-secondary">Primary authentication identifier for portal sign-in and signature OTPs</p>
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1.5">
                    Official Business Email <span className="text-error">*</span>
                  </label>
                  <input
                    className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-surface-container-highest rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1.5">
                    Territory &amp; Region Hub <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={newZone}
                      onChange={(e) => setNewZone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-surface-container-highest rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 appearance-none"
                    >
                      <option>Rajkot &amp; Saurashtra Zone (Western Gujarat)</option>
                      <option>Ahmedabad Central &amp; Gandhinagar</option>
                      <option>Surat &amp; South Gujarat Hub</option>
                      <option>Vadodara Industrial Corridor</option>
                      <option>North Gujarat Zone (UGVCL / Mehsana)</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-secondary">
                      <span className="material-symbols-outlined text-[20px]">unfold_more</span>
                    </div>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1.5">
                    Registered Office Physical Address <span className="text-error">*</span>
                  </label>
                  <textarea
                    className="w-full px-3.5 py-2 bg-surface-container-lowest border border-surface-container-highest rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
                    rows={2}
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Statutory KYC & DISCOM Empanelment */}
            <div className="bg-surface-container-lowest rounded-xl border border-surface-container-highest p-6 shadow-[0px_2px_8px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between pb-5 border-b border-surface-container-highest">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-tertiary/15 flex items-center justify-center text-tertiary font-bold">
                    <span className="material-symbols-outlined text-[20px]">verified_user</span>
                  </div>
                  <div>
                    <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">2. Statutory KYC &amp; DISCOM Empanelment</h2>
                    <p className="font-body-sm text-body-sm text-secondary">Government tax compliance and utility board grid-synchronization licenses</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-label-xs font-label-xs bg-tertiary/15 text-tertiary font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">shield</span>
                  KYC Tier-1 Passed
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-6">
                <div>
                  <label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1.5">
                    GSTIN Number <span className="text-error">*</span>
                  </label>
                  <input
                    className="w-full px-3.5 py-2.5 font-mono uppercase bg-surface-container-lowest border border-surface-container-highest rounded-lg text-body-md font-body-md text-on-surface font-semibold focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
                    type="text"
                    value={newGstin}
                    onChange={(e) => setNewGstin(e.target.value)}
                  />
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-primary-container/15 text-primary">
                      <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Verified via GSTN API
                    </span>
                    <span className="text-[11px] text-secondary font-medium">Active • Regular Taxpayer</span>
                  </div>
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1.5">
                    Business PAN <span className="text-error">*</span>
                  </label>
                  <input
                    className="w-full px-3.5 py-2.5 font-mono uppercase bg-surface-container-low border border-surface-container-highest rounded-lg text-body-md font-body-md text-on-surface font-semibold focus:outline-none cursor-not-allowed"
                    readOnly
                    type="text"
                    value={newPan}
                  />
                  <p className="mt-1.5 font-body-sm text-body-sm text-secondary">Auto-extracted from verified GSTIN record (Income Tax Dept sync)</p>
                </div>
                <div className="col-span-2">
                  <label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1.5">
                    DISCOM Vendor Empanelment Code <span className="text-error">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      className="flex-1 px-3.5 py-2.5 font-mono bg-surface-container-lowest border border-surface-container-highest rounded-lg text-body-md font-body-md text-on-surface font-semibold focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
                      type="text"
                      value={newDiscomCode}
                      onChange={(e) => setNewDiscomCode(e.target.value)}
                    />
                    <span className="px-3 py-2 bg-surface-container-low text-secondary border border-surface-container-highest rounded-lg text-label-sm font-semibold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                      Verified Rooftop Vendor
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Commercial Controls & Dealer Margin Governance */}
            <div className="bg-surface-container-lowest rounded-xl border border-surface-container-highest p-6 shadow-[0px_2px_8px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between pb-5 border-b border-surface-container-highest">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary-container/50 flex items-center justify-center text-on-secondary-container font-bold">
                    <span className="material-symbols-outlined text-[20px]">price_check</span>
                  </div>
                  <div>
                    <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">3. Commercial Controls &amp; Dealer Margin Governance</h2>
                    <p className="font-body-sm text-body-sm text-secondary">Enforce pricing safeguards, quote ceilings, and automated escrow payout workflows</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-label-xs font-label-xs bg-secondary-container text-on-secondary-fixed font-semibold">
                  Audit Policy Active
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-6">
                <div>
                  <label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1.5">
                    Assigned Partner Tier <span className="text-error">*</span>
                  </label>
                  <select
                    value={newTier}
                    onChange={(e) => setNewTier(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-surface-container-highest rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 font-semibold"
                  >
                    <option>Gold EPC Partner (Quarterly Cap: 1.5 MW)</option>
                    <option>Platinum Tier (Quarterly Cap: &gt; 3.0 MW)</option>
                    <option>Silver Installer (Quarterly Cap: 500 kW)</option>
                    <option>Bronze Associate (Speculative)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1.5">
                    Minimum Quote Enforced Floor (Turnkey Base) <span className="text-error">*</span>
                  </label>
                  <input
                    className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container-highest rounded-lg text-body-md font-body-md text-on-surface font-semibold focus:outline-none cursor-not-allowed"
                    readOnly
                    type="text"
                    value="₹ 54,000 / kW turnkey base"
                  />
                  <p className="mt-1 font-body-sm text-body-sm text-secondary">System-wide quality protection floor to prevent sub-standard module delivery</p>
                </div>
                <div className="col-span-2">
                  <label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1.5 flex items-center justify-between">
                    <span>Max Allowed Dealer Margin Addition Cap <span className="text-error">*</span></span>
                    <span className="font-label-xs text-label-xs text-primary font-bold">Standard Cap: ₹ 5,000</span>
                  </label>
                  <input
                    className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-surface-container-highest rounded-lg text-body-md font-body-md text-on-surface font-bold focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
                    type="text"
                    value={newCap}
                    onChange={(e) => setNewCap(e.target.value)}
                  />
                  <div className="mt-3 p-3.5 rounded-lg bg-amber-50 border border-amber-200/80 flex items-start gap-3">
                    <span className="material-symbols-outlined text-amber-700 text-[20px] mt-0.5">policy</span>
                    <p className="font-body-sm text-body-sm text-amber-900 leading-relaxed">
                      <strong className="font-semibold">Protective Regulatory Threshold:</strong> Prevents predatory consumer overcharging. Any customer quote generated with a margin addition exceeding <strong className="font-bold">₹5,000/kW</strong> will be paused and routed to the Sunvine Super Admin Desk for mandatory pricing review.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols) */}
          <div className="col-span-12 xl:col-span-4 flex flex-col gap-6">
            <div className="bg-surface-container-lowest rounded-xl border border-surface-container-highest p-6 shadow-[0px_2px_8px_rgba(0,0,0,0.06)] flex flex-col gap-5 sticky top-20">
              <div className="flex items-center justify-between pb-4 border-b border-surface-container-highest">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-primary text-[22px]">key</span>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">System Credentials</h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-primary-container/20 text-primary border border-primary-container/30">
                  AUTO-ALLOCATED
                </span>
              </div>
              <div className="p-3.5 bg-surface-container-low rounded-lg border border-surface-container-highest flex items-center justify-between">
                <div>
                  <span className="font-label-xs text-label-xs text-secondary uppercase tracking-wider block">Assigned Partner ID</span>
                  <span className="font-headline-sm text-headline-sm font-bold font-mono text-on-surface">#SV-DLR-0845</span>
                </div>
                <div className="text-right">
                  <span className="font-label-xs text-label-xs text-secondary block">Provisioning Status</span>
                  <span className="inline-flex items-center gap-1 font-label-xs text-label-xs font-bold text-primary">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-ping"></span>
                    Ready to Dispatch
                  </span>
                </div>
              </div>
              <div className="space-y-3 bg-surface-bright p-4 rounded-lg border border-surface-container-highest">
                <div className="flex flex-col">
                  <span className="font-label-xs text-label-xs text-secondary uppercase font-semibold">Dealer Portal URL</span>
                  <span className="font-mono text-body-sm text-tertiary font-medium select-all">sunvine-dealer.vprotech.online</span>
                </div>
                <div className="h-px bg-surface-container-highest"></div>
                <div className="flex flex-col">
                  <span className="font-label-xs text-label-xs text-secondary uppercase font-semibold">Login Username (Mobile)</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="font-body-sm font-semibold text-on-surface">Registered Mobile</span>
                    <span className="font-mono text-label-sm text-primary font-bold">{newMobile || '10-digit mobile'}</span>
                  </div>
                </div>
                <div className="h-px bg-surface-container-highest"></div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-label-xs text-label-xs text-secondary uppercase font-semibold">Assigned Portal Password</span>
                    <button
                      type="button"
                      onClick={() => setNewPassword(generateRandomPassword())}
                      className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">refresh</span>
                      Auto-Generate
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-secondary text-[18px]">key</span>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full h-9 pl-9 pr-9 bg-white border border-surface-container-highest rounded-lg font-mono text-xs text-on-surface font-semibold focus:outline-none focus:border-primary-container"
                      placeholder="Assign password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 text-secondary hover:text-on-surface cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {showNewPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                  <p className="text-[11px] text-secondary">
                    Dealer logs in with registered mobile and this password. Dealer panel cannot alter this password.
                  </p>
                </div>
              </div>
              <button
                onClick={handleCreateDealer}
                className="w-full h-11 bg-primary-container hover:bg-primary text-on-primary rounded-lg font-label-md font-semibold transition-colors shadow-sm flex items-center justify-center gap-2"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                <span>Confirm &amp; Issue Credentials</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, render Exact Dealer Management Directory
  return (
    <div className="flex flex-col gap-6 w-full pb-16">
      {/* Page Header & Action Clusters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs font-label-xs text-secondary mb-2">
            <button
              onClick={() => setActiveTab('admin_dashboard')}
              className="hover:text-primary transition-colors cursor-pointer flex items-center gap-1"
              type="button"
            >
              <span className="material-symbols-outlined text-[14px]">dashboard</span>
              <span>Admin Console</span>
            </button>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <button
              onClick={() => {
                setActiveTabFilter('all');
                setDiscomFilter('all');
                setTierFilter('all');
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="hover:text-primary transition-colors cursor-pointer"
              type="button"
            >
              Partner Directory
            </button>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-on-surface font-semibold">Dealer Partner Management</span>
          </nav>
          <h1 className="font-poppins font-bold text-headline-xl text-[#0F1B2E] tracking-tight">
            Dealer Partner Management
          </h1>
          <p className="text-body-md text-secondary mt-1">
            Manage onboarded EPC dealers, commission tiers, login credentials, and quotation permissions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => {
              setTempTierMargins(tierMargins || {});
              setShowTierModal(true);
            }}
            className="h-10 px-3.5 sm:px-4 bg-white border border-[#E4E7EB] hover:border-primary text-on-surface font-label-md rounded-lg hover:bg-surface-container-low transition-all duration-150 flex items-center gap-2 shadow-xs cursor-pointer text-xs sm:text-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">tune</span>
            <span>Configure Tier Margins</span>
          </button>
          <button
            onClick={handleExportDirectory}
            className="h-10 px-3.5 sm:px-4 bg-white border border-[#0F1B2E] text-[#0F1B2E] font-label-md rounded-lg hover:bg-[#F6F8F7] transition-all duration-150 flex items-center gap-2 shadow-xs text-xs sm:text-sm cursor-pointer"
            type="button"
            title="Export Gujarat dealer directory as CSV"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export Directory</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="h-10 px-3.5 sm:px-4 bg-[#6CBF3D] hover:bg-[#4F9A2C] text-white font-label-md font-semibold rounded-lg transition-all duration-150 flex items-center gap-2 shadow-sm focus:ring-2 focus:ring-primary-container focus:ring-offset-2 text-xs sm:text-sm cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            <span>+ Onboard New Dealer</span>
          </button>
        </div>
      </div>

      {/* 4 METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="kpi-card bg-white rounded-xl border border-[#E4E7EB] p-5 shadow-sm relative overflow-hidden group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-secondary font-label-sm uppercase tracking-wider text-[11px] group-hover:text-primary transition-colors">Total Registered Dealers</span>
              <span className="w-9 h-9 rounded-lg bg-surface-container group-hover:bg-primary/10 group-hover:text-primary flex items-center justify-center text-[#0F1B2E] transition-colors">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>handshake</span>
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-headline-xl font-poppins font-bold text-[#0F1B2E]">{totalDealersCount}</span>
              <span className="inline-flex items-center gap-0.5 text-label-xs font-semibold text-[#2E7D32] bg-[#6CBF3D]/15 px-2 py-0.5 rounded-full">
                <span className="material-symbols-outlined text-[14px]">verified</span> 100% Gujarat
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#F1F4F9] flex items-center justify-between text-body-sm text-secondary">
            <span>Western Grid Region</span>
            <span className="font-semibold text-on-surface">Gujarat (4 DISCOMs)</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="kpi-card bg-white rounded-xl border border-[#E4E7EB] p-5 shadow-sm relative overflow-hidden group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-secondary font-label-sm uppercase tracking-wider text-[11px] group-hover:text-primary transition-colors">Active &amp; Quoting</span>
              <span className="w-9 h-9 rounded-lg bg-[#6CBF3D]/15 group-hover:bg-primary/20 flex items-center justify-center text-[#2E7D32] transition-colors">
                <span className="material-symbols-outlined text-[20px]">bolt</span>
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-headline-xl font-poppins font-bold text-[#0F1B2E]">{activeDealersCount}</span>
              <span className="text-label-sm font-semibold text-secondary">
                ({totalDealersCount > 0 ? ((activeDealersCount / totalDealersCount) * 100).toFixed(0) : 0}% activation)
              </span>
              <span className="ml-auto inline-flex items-center text-label-xs font-semibold text-[#2E7D32]">
                <span className="material-symbols-outlined text-[14px]">trending_up</span> Live
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#F1F4F9] flex items-center justify-between text-body-sm text-secondary">
            <span>Cumulative Capacity</span>
            <span className="font-semibold text-[#2E7D32]">{totalCapacityMw} MW</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="kpi-card bg-white rounded-xl border border-[#E4E7EB] p-5 shadow-sm relative overflow-hidden group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-secondary font-label-sm uppercase tracking-wider text-[11px] group-hover:text-primary transition-colors">Pending Verification / KYC</span>
              <span className="w-9 h-9 rounded-lg bg-amber-500/15 group-hover:bg-primary/10 flex items-center justify-center text-amber-700 transition-colors">
                <span className="material-symbols-outlined text-[20px]">verified_user</span>
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-headline-xl font-poppins font-bold text-[#0F1B2E]">{pendingDealersCount}</span>
              <span className="inline-flex items-center text-label-xs font-semibold text-[#B27204] bg-[#F9A825]/15 px-2 py-0.5 rounded-full">
                Requires Audit
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#F1F4F9] flex items-center justify-between text-body-sm text-secondary">
            <span>Avg. review SLA</span>
            <span className="font-semibold text-on-surface font-poppins">4.2 hours</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="kpi-card bg-white rounded-xl border border-[#E4E7EB] p-5 shadow-sm relative overflow-hidden group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-secondary font-label-sm uppercase tracking-wider text-[11px] group-hover:text-primary transition-colors">Suspended / Inactive</span>
              <span className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-primary/10 flex items-center justify-center text-slate-600 transition-colors">
                <span className="material-symbols-outlined text-[20px]">person_off</span>
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-headline-xl font-poppins font-bold text-[#0F1B2E]">{suspendedDealersCount}</span>
              <span className="inline-flex items-center text-label-xs font-medium text-secondary bg-surface-container px-2 py-0.5 rounded-full">
                {totalDealersCount > 0 ? ((suspendedDealersCount / totalDealersCount) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#F1F4F9] text-body-sm text-secondary truncate">
            License review or dormant
          </div>
        </div>
      </div>

      {/* FILTER & CONTROL BAR */}
      <div className="bg-white rounded-xl border border-[#E4E7EB] p-4 shadow-[0px_2px_8px_rgba(0,0,0,0.06)] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-[280px] max-w-md relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-secondary text-[18px]">filter_list</span>
            <input
              className="w-full h-10 pl-9 pr-3 text-body-sm rounded-lg border border-[#E4E7EB] focus:border-[#6CBF3D] focus:ring-2 focus:ring-[#6CBF3D]/20 outline-none"
              placeholder="Search by Dealer, Firm Name, City, or GSTIN..."
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={discomFilter}
              onChange={(e) => { setDiscomFilter(e.target.value); setCurrentPage(1); }}
              className="h-10 px-3 bg-white border border-[#E4E7EB] rounded-lg text-body-sm text-on-surface focus:border-[#6CBF3D] outline-none"
            >
              <option value="all">Region / DISCOM Circle (All Circles)</option>
              <option value="PGVCL">PGVCL - Paschim Gujarat</option>
              <option value="DGVCL">DGVCL - Dakshin Gujarat</option>
              <option value="MGVCL">MGVCL - Madhya Gujarat</option>
              <option value="UGVCL">UGVCL - Uttar Gujarat</option>
              <option value="Torrent">Torrent Power (Ahm/Surat)</option>
            </select>
            <select
              value={tierFilter}
              onChange={(e) => { setTierFilter(e.target.value); setCurrentPage(1); }}
              className="h-10 px-3 bg-white border border-[#E4E7EB] rounded-lg text-body-sm text-on-surface focus:border-[#6CBF3D] outline-none"
            >
              <option value="all">Margin Slab Tier (All Tiers)</option>
              <option value="Platinum Partner">Platinum Partner (₹7.5k/kW)</option>
              <option value="Gold EPC Partner">Gold EPC Partner (₹6.0k/kW)</option>
              <option value="Standard Tier">Standard Tier (₹5.0k/kW)</option>
              <option value="Diamond Partner">Diamond Partner (₹8.0k/kW)</option>
            </select>
            <button
              onClick={() => {
                setSearchTerm('');
                setActiveTabFilter('all');
                setDiscomFilter('all');
                setTierFilter('all');
                setCurrentPage(1);
              }}
              className="h-10 px-3 rounded-lg text-secondary hover:text-[#0F1B2E] hover:bg-[#F6F8F7] text-label-sm flex items-center gap-1 transition-colors"
              title="Reset Filters"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            </button>
          </div>
        </div>

        {/* Quick Tabs */}
        <div className="pt-3 border-t border-[#F1F4F9] flex flex-wrap items-center justify-between gap-3 text-label-sm">
          <div className="flex items-center gap-1 bg-[#F6F8F7] p-1 rounded-lg">
            <button
              onClick={() => { setActiveTabFilter('all'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                activeTabFilter === 'all' ? 'bg-white text-[#0F1B2E] shadow-xs' : 'text-secondary hover:text-on-surface'
              }`}
            >
              All ({totalDealersCount})
            </button>
            <button
              onClick={() => { setActiveTabFilter('active'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTabFilter === 'active' ? 'bg-white text-[#0F1B2E] shadow-xs' : 'text-secondary hover:text-on-surface'
              }`}
            >
              Active ({activeDealersCount})
            </button>
            <button
              onClick={() => { setActiveTabFilter('pending'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTabFilter === 'pending' ? 'bg-white text-[#0F1B2E] shadow-xs' : 'text-secondary hover:text-on-surface'
              }`}
            >
              Pending KYC ({pendingDealersCount})
            </button>
            <button
              onClick={() => { setActiveTabFilter('suspended'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTabFilter === 'suspended' ? 'bg-white text-[#0F1B2E] shadow-xs' : 'text-secondary hover:text-on-surface'
              }`}
            >
              Suspended ({suspendedDealersCount})
            </button>
          </div>
          <div className="text-body-sm text-secondary">
            Showing <span className="font-semibold text-on-surface">{filteredDealers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredDealers.length)}</span> of <span className="font-semibold text-on-surface">{filteredDealers.length}</span> Gujarat Dealers
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-xl border border-[#E4E7EB] shadow-[0px_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1240px]">
            <thead>
              <tr className="bg-[#0F1B2E] text-white text-label-xs uppercase tracking-wider h-11 select-none">
                <th className="py-3 px-4 font-semibold text-left w-32">Dealer ID</th>
                <th className="py-3 px-4 font-semibold text-left min-w-[240px]">Dealer / Firm Name</th>
                <th className="py-3 px-4 font-semibold text-left min-w-[170px]">Region &amp; DISCOM</th>
                <th className="py-3 px-4 font-semibold text-left min-w-[160px]">Pricing &amp; Margin</th>
                <th className="py-3 px-4 font-semibold text-right w-36">Quotes Issued</th>
                <th className="py-3 px-4 font-semibold text-right min-w-[140px]">Capacity Sold</th>
                <th className="py-3 px-4 font-semibold text-left w-48">KYC &amp; GSTIN</th>
                <th className="py-3 px-4 font-semibold text-center w-28">Portal Status</th>
                <th className="py-3 px-4 font-semibold text-center w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EB] text-body-sm">
              {paginatedDealers.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-secondary">
                    <span className="material-symbols-outlined text-4xl text-secondary/40 block mb-2">search_off</span>
                    No Gujarat dealers match your current filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedDealers.map((d) => {
                  const isGold = d.tier.includes('Gold');
                  const isPlat = d.tier.includes('Platinum');
                  const isDiam = d.tier.includes('Diamond');
                  const tierColor = isPlat
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : isDiam
                    ? 'bg-purple-50 text-purple-800 border-purple-200'
                    : isGold
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-gray-100 text-gray-800 border-gray-300';
                  const initials = (d.firmName || 'ST').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

                  return (
                    <tr key={d.id} className="bg-white hover:bg-[#F0F4F2] transition-colors duration-150 group">
                      <td className="py-3 px-4">
                        <span className="font-mono text-label-xs font-semibold text-[#0F1B2E] bg-surface-container px-2 py-1 rounded">
                          #{d.id}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {d.avatar ? (
                            <img
                              alt={d.contactPerson}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-[#6CBF3D]/40 shrink-0"
                              src={d.avatar}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-surface-container-high text-primary font-bold flex items-center justify-center text-xs shrink-0 border border-primary/20">
                              {initials}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-poppins font-semibold text-on-surface group-hover:text-primary transition-colors truncate max-w-[220px]">
                              {d.firmName}
                            </div>
                            <div className="text-[12px] text-secondary flex items-center gap-2">
                              <span className="font-medium text-on-surface truncate">{d.contactPerson}</span>
                              <span className="text-outline-variant">•</span>
                              <span className="shrink-0">{d.mobile}</span>
                            </div>
                            <div className="text-[11px] text-secondary/70 truncate">{d.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-on-surface">{d.city}, Gujarat</div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                          {d.discom} Circle
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {(() => {
                          const tierKey = (d.tier || '').toLowerCase().includes('diamond') ? 'diamond' :
                                          (d.tier || '').toLowerCase().includes('platinum') ? 'platinum' :
                                          (d.tier || '').toLowerCase().includes('silver') ? 'silver' : 'gold';
                          const conf = tierMargins?.[tierKey] || { defaultMarginPerKw: 4500, maxMarginCapPerKw: 6000 };
                          return (
                            <>
                              <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${tierColor}`}>
                                <span className="material-symbols-outlined text-[13px]">military_tech</span> {d.tier || conf.tierName}
                              </div>
                              <div className="text-[11px] text-secondary mt-1">
                                Margin: <strong className="text-on-surface font-semibold">₹{conf.defaultMarginPerKw.toLocaleString('en-IN')}/kW</strong>
                              </div>
                              <div className="text-[10px] text-secondary">
                                Cap: ₹{(d.maxMarginCapPerKw || conf.maxMarginCapPerKw).toLocaleString('en-IN')}/kW
                              </div>
                            </>
                          );
                        })()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="font-semibold text-on-surface font-poppins">{d.totalQuotes} Quotes</div>
                        <div className="text-[11px] text-[#2E7D32]">Active partner</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="font-bold text-on-surface font-poppins">
                          {d.totalCapacityKw >= 1000 ? `${(d.totalCapacityKw / 1000).toFixed(2)} MW` : `${d.totalCapacityKw} kW`}
                        </div>
                        <div className="w-24 ml-auto mt-1.5 bg-surface-container rounded-full h-1.5 overflow-hidden">
                          <div className="bg-[#6CBF3D] h-full rounded-full" style={{ width: `${Math.min(100, Math.max(20, (d.totalCapacityKw / 30)))}%` }}></div>
                        </div>
                        <div className="text-[10px] text-secondary mt-0.5">Gujarat Solar Grid</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-on-surface font-medium">
                          <span>{d.gstin || '24AFPFS7402A1Z7'}</span>
                          <span className="material-symbols-outlined text-[15px] text-[#2E7D32]" title="GSTIN Active & Verified">check_circle</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-green-50 text-green-700 font-semibold">PAN OK</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-green-50 text-green-700 font-semibold">Aadhaar e-KYC</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className={`text-[10px] font-semibold inline-flex items-center gap-1 ${
                          d.status === 'Active' ? 'text-[#2E7D32]' : d.status === 'Pending' ? 'text-amber-700' : 'text-slate-500'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            d.status === 'Active' ? 'bg-[#6CBF3D]' : d.status === 'Pending' ? 'bg-amber-500' : 'bg-slate-400'
                          }`}></span> {d.status}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setCredModalDealer(d);
                              setEditPassword(d.password || 'dealer123');
                              setShowEditPassword(false);
                              setCopiedCreds(false);
                              setCredSavedNotice(false);
                            }}
                            className="w-7 h-7 rounded hover:bg-surface-container text-[#6CBF3D] hover:text-[#4F9A2C] transition-colors flex items-center justify-center cursor-pointer"
                            title="Manage Password & Credentials"
                          >
                            <span className="material-symbols-outlined text-[17px]">key</span>
                          </button>
                          <button
                            onClick={() => toggleDealerStatus(d.id)}
                            className={`w-7 h-7 rounded hover:bg-surface-container transition-colors ${
                              d.status === 'Active' ? 'text-secondary hover:text-error' : 'text-primary hover:text-primary-container'
                            }`}
                            title={d.status === 'Active' ? 'Suspend Portal Access' : 'Activate Dealer'}
                          >
                            <span className="material-symbols-outlined text-[17px]">
                              {d.status === 'Active' ? 'block' : 'check_circle'}
                            </span>
                          </button>
                          <button
                            onClick={() => setShowAddModal(true)}
                            className="w-7 h-7 rounded hover:bg-surface-container text-secondary hover:text-[#0F1B2E] transition-colors"
                            title="Edit Dealer Profile"
                          >
                            <span className="material-symbols-outlined text-[17px]">edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with real Gujarat pagination */}
        <div className="p-4 border-t border-[#E4E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-secondary font-label-sm text-label-sm">
          <span>
            Showing <span className="font-semibold text-on-surface">{filteredDealers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredDealers.length)}</span> of <span className="font-semibold text-on-surface">{filteredDealers.length}</span> Gujarat entries
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-[#E4E7EB] text-secondary hover:bg-surface-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = i + 1;
              if (totalPages > 5 && currentPage > 3) {
                pageNum = currentPage - 2 + i;
                if (pageNum > totalPages) pageNum = totalPages - (4 - i);
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                    currentPage === pageNum ? 'bg-[#0F1B2E] text-white' : 'hover:bg-surface-container text-on-surface'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-[#E4E7EB] text-secondary hover:bg-surface-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Configure Tier Margins Modal */}
      {showTierModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-surface-container-high animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-surface-container-high">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">price_check</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-lg font-bold text-on-surface">
                    Dealer Commission Tiers &amp; Default Margins
                  </h3>
                  <p className="text-xs text-secondary mt-0.5">
                    Set default quotation margins and protective ceiling caps across all partner tiers.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTierModal(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-secondary cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="py-5 space-y-4">
              {[
                { key: 'diamond', name: 'Diamond EPC Partner', desc: 'Premier High-Volume Partners (> 5.0 MW/quarter)', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
                { key: 'platinum', name: 'Platinum Tier', desc: 'Tier-1 Large Scale EPC (> 3.0 MW/quarter)', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                { key: 'gold', name: 'Gold EPC Partner', desc: 'Established Standard Installers (1.5 - 3.0 MW/quarter)', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
                { key: 'silver', name: 'Silver Installer', desc: 'Entry / Regional Empanelled Installers (< 1.5 MW/quarter)', badge: 'bg-slate-100 text-slate-700 border-slate-300' }
              ].map((tier) => {
                const currentConfig = tempTierMargins[tier.key] || tierMargins?.[tier.key] || { defaultMarginPerKw: 4500, maxMarginCapPerKw: 6000 };
                return (
                  <div key={tier.key} className="p-4 rounded-xl border border-surface-container-high bg-surface-container-low/40 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${tier.badge}`}>
                          {tier.name}
                        </span>
                        <span className="text-xs text-secondary hidden sm:inline">{tier.desc}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-semibold text-on-surface mb-1">
                          Default Commercial Margin (₹/kW)
                        </label>
                        <div className="relative flex items-center">
                          <span className="absolute left-3 text-secondary font-bold text-xs">₹</span>
                          <input
                            type="number"
                            value={currentConfig.defaultMarginPerKw}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setTempTierMargins((prev) => ({
                                ...prev,
                                [tier.key]: {
                                  ...(prev[tier.key] || tierMargins[tier.key]),
                                  defaultMarginPerKw: val
                                }
                              }));
                            }}
                            className="w-full h-9 pl-7 pr-3 bg-surface-container-lowest border border-surface-container-highest rounded-lg text-xs font-bold text-on-surface focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-on-surface mb-1">
                          Protective Margin Cap (₹/kW)
                        </label>
                        <div className="relative flex items-center">
                          <span className="absolute left-3 text-secondary font-bold text-xs">₹</span>
                          <input
                            type="number"
                            value={currentConfig.maxMarginCapPerKw}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setTempTierMargins((prev) => ({
                                ...prev,
                                [tier.key]: {
                                  ...(prev[tier.key] || tierMargins[tier.key]),
                                  maxMarginCapPerKw: val
                                }
                              }));
                            }}
                            className="w-full h-9 pl-7 pr-3 bg-surface-container-lowest border border-surface-container-highest rounded-lg text-xs font-bold text-on-surface focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-container-high">
              <button
                type="button"
                onClick={() => setShowTierModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-secondary hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (updateTierMargins) {
                    updateTierMargins(tempTierMargins);
                  }
                  setShowTierModal(false);
                }}
                className="px-5 py-2 rounded-lg bg-primary-container hover:bg-primary text-on-primary text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Save Tier Margins
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dealer Credentials & Password Modal */}
      {credModalDealer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-surface-container-highest">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">vpn_key</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-base font-bold text-on-surface">Manage Dealer Credentials</h3>
                  <p className="text-xs text-secondary">Set portal login password for partner</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCredModalDealer(null)}
                className="w-8 h-8 rounded-lg hover:bg-surface-container text-secondary hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="py-4 space-y-4">
              <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container-highest space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-secondary">Dealer Firm</span>
                  <span className="text-xs font-bold text-on-surface truncate max-w-[200px]">{credModalDealer.firmName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-secondary">Contact Person</span>
                  <span className="text-xs font-semibold text-on-surface">{credModalDealer.contactPerson}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-secondary">Login Mobile ID</span>
                  <span className="text-xs font-mono font-bold text-primary">{credModalDealer.mobile}</span>
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-on-surface">Portal Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      const rand = generateRandomPassword();
                      setEditPassword(rand);
                    }}
                    className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[13px]">refresh</span>
                    Auto-Generate
                  </button>
                </div>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-secondary text-[18px]">lock</span>
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full h-10 pl-9 pr-10 bg-white border border-surface-container-highest rounded-lg font-mono text-sm font-semibold text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 text-secondary hover:text-on-surface cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showEditPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                <p className="text-[11px] text-secondary">
                  Dealers cannot change their password from the dealer portal. Only Super Admin can set or reset it.
                </p>
              </div>

              {credSavedNotice && (
                <div className="p-2.5 rounded-lg bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-green-600">check_circle</span>
                  <span>Password updated successfully in Gujarat ledger!</span>
                </div>
              )}

              {/* Copy credentials helper */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const cleanPhone = String(credModalDealer.mobile).replace(/\D/g, '').slice(-10);
                    const text = `Sunvine Dealer Portal Credentials:\nPortal: https://sunvine-dealer.vprotech.online\nMobile: ${cleanPhone}\nPassword: ${editPassword}`;
                    navigator.clipboard.writeText(text);
                    setCopiedCreds(true);
                    setTimeout(() => setCopiedCreds(false), 3000);
                  }}
                  className="w-full py-2 px-3 rounded-lg border border-surface-container-highest hover:bg-surface-container-low text-xs font-semibold text-secondary hover:text-on-surface flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">{copiedCreds ? 'done' : 'content_copy'}</span>
                  <span>{copiedCreds ? 'Credentials Copied to Clipboard!' : 'Copy Login Details to Clipboard'}</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-container-highest">
              <button
                type="button"
                onClick={() => setCredModalDealer(null)}
                className="px-4 py-2 rounded-lg border border-surface-container-highest text-xs font-semibold text-secondary hover:bg-surface-container-low cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!editPassword.trim()) return;
                  if (updateDealerPassword) {
                    updateDealerPassword(credModalDealer.id, editPassword.trim());
                  }
                  setCredSavedNotice(true);
                  if (addNotification) {
                    addNotification({
                      title: 'Dealer Password Updated',
                      description: `Portal login password for ${credModalDealer.firmName} was updated by Admin.`,
                      type: 'success',
                      icon: 'key',
                      audience: 'admin'
                    });
                  }
                  setTimeout(() => {
                    setCredModalDealer(null);
                    setCredSavedNotice(false);
                  }, 1200);
                }}
                className="px-4 py-2 rounded-lg bg-primary hover:bg-[#4F9A2C] text-on-primary text-xs font-semibold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>Save Password</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
