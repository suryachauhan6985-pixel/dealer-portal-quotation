import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';

export default function DealerSettings() {
  const { currentDealer, updateDealerProfile, setActiveTab: setGlobalTab } = useApp();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: 'success' });
    }, 3500);
  };

  const [form, setForm] = useState({
    agencyName: currentDealer?.firmName || currentDealer?.agencyName || 'Surya Solar Tech Private Limited',
    contactPerson: currentDealer?.contactPerson || 'Rajesh Kumar',
    phone: currentDealer?.phone || '+91 98765 43210',
    email: currentDealer?.email || 'rajesh@suryasolartech.in',
    gstin: currentDealer?.gstin || '24AFPFS7402A1Z7',
    pan: currentDealer?.pan || 'AABCS1429B',
    address: currentDealer?.address || 'Shop No. 12, GIDC Industrial Estate, Metoda, Rajkot, Gujarat - 360021',
    defaultDiscom: 'PGVCL (Paschim Gujarat Vij Company Ltd)',
    discomDivision: 'Rajkot Rural Division / Metoda Sub-division',
    gedaLicenseNo: 'GEDA/EPC/2024/0981',
    defaultPaymentTerms: '30% Advance, 50% on Delivery, 20% on Net-metering',
    defaultDeliveryWeeks: '3 to 4 Weeks from GEDA Approval',
    bankName: 'State Bank of India',
    accountNumber: '394857201948',
    ifscCode: 'SBIN0001234',
    whatsappAlerts: true,
    emailAlerts: true,
    autoPdfDownload: true
  });

  // Password Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const ruleLength = newPassword.length >= 8;
  const ruleCasing = /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword);
  const ruleSymbol = /[0-9]/.test(newPassword) || /[^A-Za-z0-9]/.test(newPassword);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      triggerToast('Please select a valid image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      triggerToast('Image size should be less than 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      if (updateDealerProfile) {
        updateDealerProfile({ avatar: base64 });
      }
      triggerToast('Profile photo updated successfully!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (updateDealerProfile) {
      updateDealerProfile({
        firmName: form.agencyName,
        contactPerson: form.contactPerson,
        email: form.email,
        gstin: form.gstin,
        pan: form.pan,
        address: form.address,
      });
    }
    setSaved(true);
    triggerToast('Settings & preferences saved successfully', 'success');
    setTimeout(() => setSaved(false), 3000);
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!currentPassword) {
      triggerToast('Please enter your current password', 'error');
      return;
    }
    if (!newPassword) {
      triggerToast('Please enter a new password', 'error');
      return;
    }
    if (!ruleLength || !ruleCasing || !ruleSymbol) {
      triggerToast('Please satisfy all password requirements', 'error');
      return;
    }
    if (!confirmPassword) {
      triggerToast('Please confirm your new password', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      triggerToast('Passwords do not match', 'error');
      return;
    }

    setIsUpdatingPassword(true);
    setTimeout(() => {
      setIsUpdatingPassword(false);
      triggerToast('Password updated successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }, 450);
  };

  return (
    <div className="flex flex-col w-full gap-6 min-w-0">
      {/* Toast Notification */}
      <div
        className={`fixed bottom-20 md:bottom-6 right-4 md:right-6 left-4 sm:left-auto max-w-sm z-50 transition-all duration-300 pointer-events-none flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl font-label-sm ${
          toast.type === 'error'
            ? 'bg-neutral-900 border border-red-500/50 text-white'
            : 'bg-on-secondary-fixed text-on-secondary'
        } ${
          toast.message ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}
      >
        <span
          className={`material-symbols-outlined text-[20px] shrink-0 ${
            toast.type === 'error' ? 'text-red-400' : 'text-primary-fixed'
          }`}
        >
          {toast.type === 'error' ? 'cancel' : 'check_circle'}
        </span>
        <span className="break-words">{toast.message}</span>
      </div>

      <input
        accept="image/*"
        className="hidden"
        onChange={handleAvatarChange}
        ref={fileInputRef}
        type="file"
      />

      {/* Top Breadcrumbs & Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 w-full">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 text-secondary font-label-sm text-xs sm:text-label-sm flex-wrap">
            <button
              type="button"
              onClick={() => setGlobalTab('dashboard')}
              className="inline-flex items-center gap-1 text-secondary hover:text-primary hover:underline cursor-pointer transition-colors font-medium"
              title="Return to Dealer Dashboard"
            >
              <span className="material-symbols-outlined text-[16px]">dashboard</span>
              <span>Dealer Console</span>
            </button>
            <span className="material-symbols-outlined text-[14px] text-secondary/60">chevron_right</span>
            <button
              type="button"
              onClick={() => {
                setActiveTab('profile');
                if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-secondary hover:text-primary hover:underline cursor-pointer transition-colors font-medium"
              title="Go to Settings Root"
            >
              Settings
            </button>
            <span className="material-symbols-outlined text-[14px] text-secondary/60">chevron_right</span>
            <span className="text-on-surface font-semibold truncate cursor-default">Account &amp; Configurations</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h1 className="font-headline-xl text-2xl sm:text-headline-xl text-on-surface tracking-tight">Dealer Settings</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-label-xs text-label-xs flex items-center gap-1 shrink-0">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              Tier-1 Partner
            </span>
          </div>
          <p className="font-body-md text-xs sm:text-body-md text-secondary max-w-3xl">
            Manage your authorized EPC agency profile, security credentials, quotation calculation rules, and cross-channel notifications.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => setSaved(false)}
            type="button"
            className="px-3.5 sm:px-4 py-2 bg-surface-container-lowest text-on-surface hover:bg-surface-container-low transition-colors duration-150 font-label-md text-xs sm:text-label-md rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer whitespace-nowrap border border-surface-container-high"
          >
            <span className="material-symbols-outlined text-[18px]">undo</span>
            <span>Discard</span>
          </button>
          <button
            onClick={handleSave}
            type="button"
            className="px-4 sm:px-5 py-2 bg-primary-container hover:bg-primary text-on-primary font-label-md text-xs sm:text-label-md rounded-lg transition-colors duration-150 shadow-sm flex items-center gap-2 active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[18px]">
              {saved ? 'check_circle' : 'save'}
            </span>
            <span>{saved ? 'Saved' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Main Multi-Column Settings Architecture */}
      <div className="grid grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Navigation Tabs Sidebar */}
        <nav className="col-span-12 lg:col-span-3 flex flex-col gap-2 bg-surface-container-lowest p-3 rounded-xl shadow-sm border border-surface-container-high">
          <div className="px-3 py-2 flex items-center justify-between">
            <span className="font-label-xs text-label-xs uppercase tracking-wider text-secondary">Settings Hub</span>
            <span className="material-symbols-outlined text-secondary text-[16px]">tune</span>
          </div>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center justify-between px-3.5 py-3 rounded-lg text-left font-label-md text-label-md transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-surface-container text-on-surface font-semibold'
                : 'text-secondary hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-primary text-[20px]">badge</span>
              <span>Account &amp; Profile</span>
            </div>
            <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center justify-between px-3.5 py-3 rounded-lg text-left font-label-md text-label-md transition-colors cursor-pointer ${
              activeTab === 'security'
                ? 'bg-surface-container text-on-surface font-semibold'
                : 'text-secondary hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px]">lock_reset</span>
              <span>Security &amp; Password</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('discom')}
            className={`flex items-center justify-between px-3.5 py-3 rounded-lg text-left font-label-md text-label-md transition-colors cursor-pointer ${
              activeTab === 'discom'
                ? 'bg-surface-container text-on-surface font-semibold'
                : 'text-secondary hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px]">electrical_services</span>
              <span>DISCOM &amp; Grid Defaults</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-xs text-label-xs">Active</span>
          </button>

          <button
            onClick={() => setActiveTab('banking')}
            className={`flex items-center justify-between px-3.5 py-3 rounded-lg text-left font-label-md text-label-md transition-colors cursor-pointer ${
              activeTab === 'banking'
                ? 'bg-surface-container text-on-surface font-semibold'
                : 'text-secondary hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px]">account_balance</span>
              <span>Banking &amp; Commission</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center justify-between px-3.5 py-3 rounded-lg text-left font-label-md text-label-md transition-colors cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-surface-container text-on-surface font-semibold'
                : 'text-secondary hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px]">notifications_active</span>
              <span>Alerts &amp; Notifications</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-primary-container"></span>
          </button>

          {/* Left Sidebar Telemetry Pill */}
          <div className="mt-4 p-3 rounded-lg bg-surface-container-low flex flex-col gap-2">
            <div className="flex items-center justify-between font-label-xs text-label-xs text-secondary">
              <span>Profile Strength</span>
              <span className="font-bold text-primary">100%</span>
            </div>
            <div className="w-full bg-surface-variant h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary-container h-full rounded-full" style={{ width: '100%' }}></div>
            </div>
            <span className="text-[11px] font-body-sm text-secondary">Aadhaar e-KYC, GSTIN &amp; License verified.</span>
          </div>
        </nav>

        {/* Right Column: Settings Content Sections */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-6">
          {/* Section A: Agency Profile & Statutory Credentials */}
          {activeTab === 'profile' && (
            <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-surface-container-high flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[22px]">corporate_fare</span>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="font-headline-md text-headline-md text-on-surface">Agency Profile &amp; Statutory Credentials</h2>
                    <span className="font-body-sm text-body-sm text-secondary">Official registration parameters vetted under national EPC compliance standards.</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-semibold inline-flex items-center gap-1.5 self-start sm:self-center">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  Verified Partner
                </span>
              </div>

              {/* Profile Top Banner with Photo Upload */}
              <div className="p-4 rounded-xl bg-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative group cursor-pointer" onClick={handleAvatarClick} title="Click to upload profile photo">
                    <div className="w-16 h-16 rounded-full overflow-hidden shadow-sm bg-surface-container shrink-0 border-2 border-primary/30">
                      <img
                        alt="Dealer Profile"
                        className="w-full h-full object-cover"
                        src={currentDealer?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPrXHZs-qW_IfxFB32q6OMBxh9-Q8lbGsGBMHtdkNUgY_4yuNIKjzl9IouO3S3aNB09wnjzip9MP60dQxzL4kQPmGopeAc3FhmzSe-rn5i-NJoa8LROkq6pxtArBvBH1gOf32o8gNlXRFqVCbs_ran3kYrMxI68PMiaTNELo-PNmGam_oiuZjvHaBAalOT1KVsAA0nMIY8TkaF5V5g5bstz4lf60C_guBjH_ZJgQWwByqwwd7bZd8y'}
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-white text-[20px]">photo_camera</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-headline-sm text-headline-sm text-on-surface">{form.contactPerson}</span>
                      <span className="px-2 py-0.5 rounded bg-surface-container text-secondary text-[11px] font-semibold">Managing Director</span>
                    </div>
                    <span className="font-body-md text-body-md text-secondary">{form.agencyName}</span>
                    <button
                      type="button"
                      onClick={handleAvatarClick}
                      className="text-primary text-xs font-semibold hover:underline mt-0.5 self-start cursor-pointer"
                    >
                      Change photo
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-lg self-start md:self-auto shadow-sm border border-surface-container-high">
                  <span className="material-symbols-outlined text-secondary text-[18px]">lock</span>
                  <div className="flex flex-col">
                    <span className="font-label-xs text-label-xs text-secondary uppercase tracking-wider">Dealer Unique ID</span>
                    <span className="font-headline-sm text-headline-sm font-mono text-on-surface">SV-DLR-GJ-0842</span>
                  </div>
                </div>
              </div>

              {/* Grid of Statutory & Contact Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface font-medium">Registered Agency Legal Name</label>
                  <input
                    className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg font-body-md text-body-md text-on-surface shadow-sm focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none"
                    type="text"
                    value={form.agencyName}
                    onChange={(e) => setForm({ ...form, agencyName: e.target.value })}
                  />
                  <span className="text-[11px] font-body-sm text-secondary">Registered under the Companies Act (India)</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface font-medium">Principal Solar Engineer / Signatory</label>
                  <input
                    className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg font-body-md text-body-md text-on-surface shadow-sm focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none"
                    type="text"
                    value={form.contactPerson}
                    onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-label-sm text-label-sm text-on-surface font-medium">Primary Registered Phone</label>
                    <span className="text-[11px] text-tertiary font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">lock</span> e-KYC Bound
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      className="w-full px-3.5 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface select-none outline-none"
                      readOnly
                      type="text"
                      value={form.phone}
                    />
                    <span className="material-symbols-outlined absolute right-3 top-3 text-[18px] text-primary">verified</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface font-medium">Official Business Email</label>
                  <input
                    className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg font-body-md text-body-md text-on-surface shadow-sm focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-label-sm text-label-sm text-on-surface font-medium">GST Identification Number (GSTIN)</label>
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold tracking-wide">GST PORTAL VERIFIED</span>
                  </div>
                  <div className="relative">
                    <input
                      className="w-full font-mono px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-body-md text-on-surface shadow-sm uppercase outline-none"
                      type="text"
                      value={form.gstin}
                      onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                    />
                    <span className="material-symbols-outlined absolute right-3 top-2.5 text-[20px] text-primary">gpp_good</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface font-medium">Permanent Account Number (PAN)</label>
                  <input
                    className="w-full font-mono px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg font-body-md text-body-md text-on-surface shadow-sm uppercase outline-none"
                    type="text"
                    value={form.pan}
                    onChange={(e) => setForm({ ...form, pan: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="font-label-sm text-label-sm text-on-surface font-medium">Office &amp; Workshop Address</label>
                  <textarea
                    className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg font-body-md text-body-md text-on-surface shadow-sm focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none resize-none"
                    rows={2}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>
              </div>

              {/* Quick Jump to Security */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[22px]">lock_reset</span>
                  <div className="flex flex-col">
                    <span className="font-label-sm font-semibold text-on-surface">Account Password &amp; Credentials</span>
                    <span className="text-xs text-secondary">Keep your portal access and pricing margins secure.</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('security')}
                  className="px-3.5 py-1.5 bg-surface-container-lowest hover:bg-surface-container border border-surface-container-high rounded-lg text-xs font-semibold text-primary transition-colors cursor-pointer"
                >
                  Manage Password
                </button>
              </div>
            </section>
          )}

          {/* Section B: Security & Password Management */}
          {activeTab === 'security' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl shadow-sm p-4 sm:p-6 border border-surface-container-high">
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-primary text-[22px] shrink-0">security</span>
                    <h2 className="text-lg sm:text-xl font-bold text-on-secondary-fixed">Security &amp; Password Management</h2>
                  </div>
                  <p className="text-xs sm:text-sm text-secondary">Keep your Sunvine portal login credentials and quotes protected.</p>
                </div>

                <form className="flex flex-col gap-space-md" onSubmit={handleUpdatePassword}>
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <label className="font-label-sm text-on-surface" htmlFor="current-password">Current Password</label>
                    <div className="relative">
                      <input
                        className="w-full h-11 sm:h-10 px-3 pr-11 bg-surface-container-low rounded-lg font-body-md text-base sm:text-body-md text-on-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container outline-none transition-all"
                        id="current-password"
                        placeholder="••••••••••••"
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <button
                        className="absolute right-0 top-0 bottom-0 w-11 flex items-center justify-center text-secondary hover:text-on-surface cursor-pointer rounded-r-lg transition-colors"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        type="button"
                        aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showCurrentPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 min-w-0">
                    <label className="font-label-sm text-on-surface" htmlFor="new-password">New Password</label>
                    <div className="relative">
                      <input
                        className={`w-full h-11 sm:h-10 px-3 pr-11 bg-surface-container-low rounded-lg font-body-md text-base sm:text-body-md text-on-surface focus:bg-surface-container-lowest outline-none transition-all ${
                          newPassword.length > 0
                            ? ruleLength && ruleCasing && ruleSymbol
                              ? 'border border-primary focus:ring-2 focus:ring-primary/20'
                              : 'border border-amber-500/50 focus:ring-2 focus:ring-amber-500/20'
                            : 'border border-transparent focus:ring-2 focus:ring-primary-container'
                        }`}
                        id="new-password"
                        placeholder="Enter new secure password"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        className="absolute right-0 top-0 bottom-0 w-11 flex items-center justify-center text-secondary hover:text-on-surface cursor-pointer rounded-r-lg transition-colors"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        type="button"
                        aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showNewPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Animated Password Requirements */}
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      newPassword.length > 0
                        ? 'grid-rows-[1fr] opacity-100 translate-y-0'
                        : 'grid-rows-[0fr] opacity-0 -translate-y-2 pointer-events-none'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="p-space-sm rounded-lg bg-surface-container-low border border-surface-container-high/60 flex flex-col gap-2 min-w-0 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="font-label-xs text-secondary uppercase tracking-wider font-semibold">Password Requirements</span>
                          <span className="text-[11px] font-semibold text-secondary">
                            {[ruleLength, ruleCasing, ruleSymbol].filter(Boolean).length}/3 Met
                          </span>
                        </div>

                        {/* Progress Indicator Bar */}
                        <div className="w-full bg-surface-container-high h-1 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 rounded-full ${
                              [ruleLength, ruleCasing, ruleSymbol].filter(Boolean).length === 3
                                ? 'bg-primary w-full'
                                : [ruleLength, ruleCasing, ruleSymbol].filter(Boolean).length === 2
                                ? 'bg-amber-500 w-2/3'
                                : [ruleLength, ruleCasing, ruleSymbol].filter(Boolean).length === 1
                                ? 'bg-orange-500 w-1/3'
                                : 'w-0'
                            }`}
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-1.5 text-label-xs font-label-xs pt-0.5">
                          <div className={`flex items-start sm:items-center gap-1.5 transition-all duration-300 ${ruleLength ? 'text-primary font-medium translate-x-0.5' : 'text-secondary'}`}>
                            <span
                              className={`material-symbols-outlined text-[16px] shrink-0 mt-0.5 sm:mt-0 transition-all duration-300 ${ruleLength ? 'scale-110 text-primary' : 'scale-95 text-secondary/60'}`}
                              style={{ fontVariationSettings: ruleLength ? "'FILL' 1" : "'FILL' 0" }}
                            >
                              {ruleLength ? 'check_circle' : 'radio_button_unchecked'}
                            </span>
                            <span className="break-words leading-tight transition-colors duration-300">Minimum 8+ characters</span>
                          </div>
                          <div className={`flex items-start sm:items-center gap-1.5 transition-all duration-300 ${ruleCasing ? 'text-primary font-medium translate-x-0.5' : 'text-secondary'}`}>
                            <span
                              className={`material-symbols-outlined text-[16px] shrink-0 mt-0.5 sm:mt-0 transition-all duration-300 ${ruleCasing ? 'scale-110 text-primary' : 'scale-95 text-secondary/60'}`}
                              style={{ fontVariationSettings: ruleCasing ? "'FILL' 1" : "'FILL' 0" }}
                            >
                              {ruleCasing ? 'check_circle' : 'radio_button_unchecked'}
                            </span>
                            <span className="break-words leading-tight transition-colors duration-300">Uppercase &amp; lowercase letters</span>
                          </div>
                          <div className={`flex items-start sm:items-center gap-1.5 transition-all duration-300 ${ruleSymbol ? 'text-primary font-medium translate-x-0.5' : 'text-secondary'}`}>
                            <span
                              className={`material-symbols-outlined text-[16px] shrink-0 mt-0.5 sm:mt-0 transition-all duration-300 ${ruleSymbol ? 'scale-110 text-primary' : 'scale-95 text-secondary/60'}`}
                              style={{ fontVariationSettings: ruleSymbol ? "'FILL' 1" : "'FILL' 0" }}
                            >
                              {ruleSymbol ? 'check_circle' : 'radio_button_unchecked'}
                            </span>
                            <span className="break-words leading-tight transition-colors duration-300">At least one number or special symbol (@, #, $)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 min-w-0">
                    <label className="font-label-sm text-on-surface" htmlFor="confirm-password">Confirm New Password</label>
                    <div className="relative">
                      <input
                        className={`w-full h-11 sm:h-10 px-3 pr-11 bg-surface-container-low rounded-lg font-body-md text-base sm:text-body-md text-on-surface focus:bg-surface-container-lowest outline-none transition-all ${
                          confirmPassword.length > 0
                            ? newPassword.length === 0
                              ? 'border border-surface-container-high focus:ring-2 focus:ring-secondary/20'
                              : confirmPassword === newPassword
                              ? 'border border-primary focus:ring-2 focus:ring-primary/20 bg-primary/5'
                              : 'border border-error focus:ring-2 focus:ring-error/20 bg-error-container/10'
                            : 'border border-transparent focus:ring-2 focus:ring-primary-container'
                        }`}
                        id="confirm-password"
                        placeholder="Re-enter new secure password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        className="absolute right-0 top-0 bottom-0 w-11 flex items-center justify-center text-secondary hover:text-on-surface cursor-pointer rounded-r-lg transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        type="button"
                        aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showConfirmPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                    {confirmPassword.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-0.5 transition-all text-xs">
                        {newPassword.length === 0 ? (
                          <span className="text-secondary flex items-center gap-1 font-medium">
                            <span className="material-symbols-outlined text-[16px]">info</span>
                            Please enter new password first
                          </span>
                        ) : confirmPassword === newPassword ? (
                          <span className="text-primary flex items-center gap-1 font-medium">
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            Passwords match
                          </span>
                        ) : (
                          <span className="text-error flex items-center gap-1 font-medium">
                            <span className="material-symbols-outlined text-[16px]">cancel</span>
                            Passwords do not match
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-space-xs">
                    <button
                      className="w-full h-11 sm:h-10 bg-primary-container hover:bg-primary text-on-primary rounded-lg font-label-md transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      type="submit"
                      disabled={isUpdatingPassword}
                    >
                      {isUpdatingPassword ? (
                        <>
                          <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                          <span>Updating Password...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[18px]">key</span>
                          <span>Update Password</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Partner Support Card */}
              <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl shadow-sm p-4 sm:p-6 border border-surface-container-high relative overflow-hidden">
                <div className="w-1.5 h-full bg-primary absolute left-0 top-0"></div>
                <div className="flex flex-col gap-3 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-tertiary-container/30 text-on-tertiary-container flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[22px]">contact_support</span>
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-on-surface">Sunvine Partner Support</h3>
                      <p className="text-xs text-secondary">Direct EPC partner priority assistance.</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col gap-2.5 font-body-sm min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-primary shrink-0">support_agent</span>
                      <span className="text-secondary text-xs">Official Helpline:</span>
                      <a className="text-on-surface font-bold hover:text-primary transition-colors text-xs ml-auto" href="tel:+918000050580">
                        +91 80000 50580
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-primary shrink-0">mail</span>
                      <span className="text-secondary text-xs">Email Desk:</span>
                      <a className="text-on-surface font-semibold hover:text-primary transition-colors text-xs ml-auto" href="mailto:support@sunvine.in">
                        support@sunvine.in
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-primary shrink-0">schedule</span>
                      <span className="text-secondary text-xs">Working Hours:</span>
                      <span className="text-on-surface font-medium text-xs ml-auto">Mon - Sat (9am - 7pm)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section C: DISCOM & Grid Connections */}
          {activeTab === 'discom' && (
            <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-surface-container-high flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[22px]">electrical_services</span>
                </div>
                <div className="flex flex-col">
                  <h2 className="font-headline-md text-headline-md text-on-surface">DISCOM &amp; Solar Grid Parameters</h2>
                  <span className="font-body-sm text-body-sm text-secondary">Default distribution company jurisdiction and GEDA registration parameters.</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface font-medium">Default Utility Grid DISCOM</label>
                  <select
                    value={form.defaultDiscom}
                    onChange={(e) => setForm({ ...form, defaultDiscom: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg font-body-md text-body-md text-on-surface shadow-sm focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none"
                  >
                    <option value="PGVCL (Paschim Gujarat Vij Company Ltd)">PGVCL (Paschim Gujarat Vij Company Ltd)</option>
                    <option value="UGVCL (Uttar Gujarat Vij Company Ltd)">UGVCL (Uttar Gujarat Vij Company Ltd)</option>
                    <option value="MGVCL (Madhya Gujarat Vij Company Ltd)">MGVCL (Madhya Gujarat Vij Company Ltd)</option>
                    <option value="DGVCL (Dakshin Gujarat Vij Company Ltd)">DGVCL (Dakshin Gujarat Vij Company Ltd)</option>
                    <option value="Torrent Power (Ahmedabad / Surat)">Torrent Power (Ahmedabad / Surat)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface font-medium">Sub-Division / Regional Office</label>
                  <input
                    type="text"
                    value={form.discomDivision}
                    onChange={(e) => setForm({ ...form, discomDivision: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg font-body-md text-body-md text-on-surface shadow-sm focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="font-label-sm text-label-sm text-on-surface font-medium">State Nodal Agency EPC License Number (GEDA)</label>
                  <input
                    type="text"
                    value={form.gedaLicenseNo}
                    onChange={(e) => setForm({ ...form, gedaLicenseNo: e.target.value })}
                    className="w-full font-mono px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg font-body-md text-body-md text-on-surface shadow-sm uppercase focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none"
                  />
                </div>
              </div>
            </section>
          )}

          {/* Section D: Banking & Commission Payouts */}
          {activeTab === 'banking' && (
            <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-surface-container-high flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[22px]">account_balance</span>
                </div>
                <div className="flex flex-col">
                  <h2 className="font-headline-md text-headline-md text-on-surface">Banking &amp; Commission Payouts</h2>
                  <span className="font-body-sm text-body-sm text-secondary">Direct bank settlement coordinates for confidential dealer margins and EPC incentives.</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface font-medium">Bank Name</label>
                  <input
                    type="text"
                    value={form.bankName}
                    onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg font-body-md text-body-md text-on-surface shadow-sm focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface font-medium">Account Number</label>
                  <input
                    type="text"
                    value={form.accountNumber}
                    onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                    className="w-full font-mono px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg font-body-md text-body-md text-on-surface shadow-sm focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface font-medium">IFSC Code</label>
                  <input
                    type="text"
                    value={form.ifscCode}
                    onChange={(e) => setForm({ ...form, ifscCode: e.target.value })}
                    className="w-full font-mono px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg font-body-md text-body-md text-on-surface shadow-sm uppercase focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none"
                  />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-surface-container-low flex items-center justify-between border border-surface-container-high">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">verified</span>
                  <span className="font-label-sm text-label-sm text-on-surface">Direct RTGS / NEFT Payout Gateway Active</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-primary-container text-on-primary font-label-xs text-label-xs font-bold">VERIFIED</span>
              </div>
            </section>
          )}

          {/* Section E: Alerts & Notifications */}
          {activeTab === 'notifications' && (
            <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-surface-container-high flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[22px]">notifications_active</span>
                </div>
                <div className="flex flex-col">
                  <h2 className="font-headline-md text-headline-md text-on-surface">Alerts &amp; Channel Automation</h2>
                  <span className="font-body-sm text-body-sm text-secondary">Cross-channel instant proposal delivery alerts via WhatsApp and Email.</span>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-3.5 rounded-lg border border-outline-variant/20 hover:bg-surface-container-low cursor-pointer transition-colors">
                  <div>
                    <span className="font-semibold text-on-surface block text-sm">WhatsApp Proposal Dispatch</span>
                    <span className="text-xs text-secondary">Transmit signed 4-page PDF proposal link directly to customer WhatsApp</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.whatsappAlerts}
                    onChange={(e) => setForm({ ...form, whatsappAlerts: e.target.checked })}
                    className="rounded text-primary-container focus:ring-primary-container w-5 h-5 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-lg border border-outline-variant/20 hover:bg-surface-container-low cursor-pointer transition-colors">
                  <div>
                    <span className="font-semibold text-on-surface block text-sm">BCC Agency Email Notification</span>
                    <span className="text-xs text-secondary">Receive an encrypted duplicate of every proposal sent to customers</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.emailAlerts}
                    onChange={(e) => setForm({ ...form, emailAlerts: e.target.checked })}
                    className="rounded text-primary-container focus:ring-primary-container w-5 h-5 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-lg border border-outline-variant/20 hover:bg-surface-container-low cursor-pointer transition-colors">
                  <div>
                    <span className="font-semibold text-on-surface block text-sm">Automatic A4 PDF Cache</span>
                    <span className="text-xs text-secondary">Pre-generate high-resolution Mirana-compliant printable quotation pages</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.autoPdfDownload}
                    onChange={(e) => setForm({ ...form, autoPdfDownload: e.target.checked })}
                    className="rounded text-primary-container focus:ring-primary-container w-5 h-5 cursor-pointer"
                  />
                </label>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
