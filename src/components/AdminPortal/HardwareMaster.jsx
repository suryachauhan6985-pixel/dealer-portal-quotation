import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function HardwareMaster() {
  const { modulesList, setModulesList, invertersList, setInvertersList, addNotification, pdfBomSpecs, dealers } = useApp();
  const [activeTab, setActiveTab] = useState('modules'); // 'modules' | 'inverters' | 'bos'
  const [moduleSearch, setModuleSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [inverterSearch, setInverterSearch] = useState('');
  const [inverterFilter, setInverterFilter] = useState('all');
  const [bosCapacityFilter, setBosCapacityFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState('');
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [showAddInverterModal, setShowAddInverterModal] = useState(false);

  const [moduleForm, setModuleForm] = useState({
    brand: '',
    model: '',
    cellTech: 'TOPCon Mono Bifacial',
    wattage: '550',
    efficiency: '22.6%',
    ratePerWp: '19.20',
    warranty: '30 Years Performance'
  });

  const [inverterForm, setInverterForm] = useState({
    brand: '',
    model: '',
    capacity: '5 kW',
    phase: '3-Phase 415V',
    efficiency: '98.4%',
    warranty: '10 Years'
  });

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSaveModule = (e) => {
    e.preventDefault();
    if (!moduleForm.brand.trim() || !moduleForm.model.trim()) return;
    const newMod = {
      id: `mod-${Date.now()}`,
      brand: moduleForm.brand.trim(),
      model: moduleForm.model.trim(),
      cellTech: moduleForm.cellTech,
      wattage: Number(moduleForm.wattage) || 550,
      efficiency: moduleForm.efficiency,
      ratePerWp: `₹ ${moduleForm.ratePerWp}/Wp`,
      warranty: moduleForm.warranty
    };
    if (setModulesList) {
      setModulesList(prev => [...(prev || []), newMod]);
    }
    if (addNotification) {
      addNotification({
        type: 'success',
        icon: 'solar_power',
        title: `New Solar Module Added: ${newMod.brand} ${newMod.model}`,
        description: `High-efficiency ${newMod.wattage}W (${newMod.cellTech}) added to hardware catalog.`,
        targetTab: 'hardware_master'
      });
    }
    setShowAddModuleModal(false);
    triggerToast(`Added ${newMod.brand} ${newMod.model} to catalog!`);
    setModuleForm({
      brand: '',
      model: '',
      cellTech: 'TOPCon Mono Bifacial',
      wattage: '550',
      efficiency: '22.6%',
      ratePerWp: '19.20',
      warranty: '30 Years Performance'
    });
  };

  const handleSaveInverter = (e) => {
    e.preventDefault();
    if (!inverterForm.brand.trim() || !inverterForm.model.trim()) return;
    const newInv = {
      id: `inv-${Date.now()}`,
      brand: inverterForm.brand.trim(),
      model: inverterForm.model.trim(),
      capacity: inverterForm.capacity,
      phase: inverterForm.phase,
      efficiency: inverterForm.efficiency,
      warranty: inverterForm.warranty
    };
    if (setInvertersList) {
      setInvertersList(prev => [...(prev || []), newInv]);
    }
    if (addNotification) {
      addNotification({
        type: 'success',
        icon: 'bolt',
        title: `New Inverter Added: ${newInv.brand} ${newInv.model}`,
        description: `${newInv.capacity} (${newInv.phase}) solar inverter published to hardware catalog.`,
        targetTab: 'hardware_master'
      });
    }
    setShowAddInverterModal(false);
    triggerToast(`Added ${newInv.brand} ${newInv.model} to catalog!`);
    setInverterForm({
      brand: '',
      model: '',
      capacity: '5 kW',
      phase: '3-Phase 415V',
      efficiency: '98.4%',
      warranty: '10 Years'
    });
  };

  // Filtered lists
  const filteredModules = (modulesList || []).filter(mod => {
    const term = moduleSearch.toLowerCase();
    const matchText = (mod.brand && mod.brand.toLowerCase().includes(term)) ||
                      (mod.model && mod.model.toLowerCase().includes(term)) ||
                      (mod.cellTech && mod.cellTech.toLowerCase().includes(term)) ||
                      String(mod.wattage).includes(term);
    if (!matchText) return false;
    if (moduleFilter === 'topcon' && !(mod.cellTech || '').toLowerCase().includes('topcon')) return false;
    if (moduleFilter === 'perc' && !(mod.cellTech || '').toLowerCase().includes('perc')) return false;
    if (moduleFilter === 'commercial' && Number(mod.wattage) < 585) return false;
    return true;
  });

  const filteredInverters = (invertersList || []).filter(inv => {
    const term = inverterSearch.toLowerCase();
    const matchText = (inv.brand && inv.brand.toLowerCase().includes(term)) ||
                      (inv.model && inv.model.toLowerCase().includes(term)) ||
                      (inv.capacity && inv.capacity.toLowerCase().includes(term));
    if (!matchText) return false;
    if (inverterFilter === 'single' && !(inv.phase || '').toLowerCase().includes('1-phase')) return false;
    if (inverterFilter === 'three' && !(inv.phase || '').toLowerCase().includes('3-phase')) return false;
    return true;
  });

  const filteredBomSpecs = (pdfBomSpecs || []).filter(spec => {
    if (bosCapacityFilter === 'all') return true;
    return spec.capacityKW.includes(bosCapacityFilter);
  });

  const totalDealersCount = dealers?.length || 550;

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Toast Notification */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 pointer-events-none flex items-center gap-2 px-4 py-3 rounded-lg bg-on-secondary-fixed text-on-secondary shadow-xl font-label-sm ${
          toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}
      >
        <span className="material-symbols-outlined text-[20px] text-primary-fixed">check_circle</span>
        <span>{toastMessage}</span>
      </div>

      {/* PAGE HEADER BLOCK */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-6 border-b border-surface-container-highest">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-headline-lg text-headline-lg text-inverse-surface tracking-tight">
              Solar Equipment &amp; Hardware Master Catalog
            </h1>
            <span className="bg-primary-container/15 text-primary text-label-xs font-semibold px-2.5 py-0.5 rounded-full border border-primary-container/30">
              ALMM Compliant 2025 • Gujarat DISCOMs
            </span>
          </div>
          <p className="font-body-md text-body-md text-secondary mt-1">
            Manage approved solar modules, string inverters, and BOS specifications from Sunvine BOS Price Matrix.
          </p>
        </div>
        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <button
            onClick={() => triggerToast('Hardware specifications export initiated')}
            className="flex items-center gap-1.5 px-3 py-2 border border-surface-container-highest bg-surface-container-lowest text-inverse-surface font-label-md rounded-lg hover:bg-surface-container-low transition-colors shadow-sm text-xs sm:text-sm"
          >
            <span className="material-symbols-outlined text-secondary">file_download</span>
            <span>Import Specs (Excel)</span>
          </button>
          <button
            onClick={() => triggerToast('Bulk price revision opened')}
            className="flex items-center gap-1.5 px-3 py-2 border border-surface-container-highest bg-surface-container-lowest text-inverse-surface font-label-md rounded-lg hover:bg-surface-container-low transition-colors shadow-sm text-xs sm:text-sm"
          >
            <span className="material-symbols-outlined text-secondary">price_change</span>
            <span>Bulk Price Update</span>
          </button>
          <button
            onClick={() => setShowAddInverterModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-inverse-surface bg-surface-container-lowest text-inverse-surface font-label-md rounded-lg hover:bg-surface-container-low transition-colors shadow-sm cursor-pointer text-xs sm:text-sm"
          >
            <span className="material-symbols-outlined">add</span>
            <span>+ Add Inverter Model</span>
          </button>
          <button
            onClick={() => setShowAddModuleModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary-container hover:bg-primary text-on-primary font-label-md font-bold rounded-lg shadow-sm transition-colors cursor-pointer text-xs sm:text-sm"
          >
            <span className="material-symbols-outlined">add_circle</span>
            <span>+ Add Solar Module</span>
          </button>
        </div>
      </div>

      {/* TOP TELEMETRY KPI QUICK STATS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 my-6">
        {/* Card 1: Active PV Modules */}
        <div className="kpi-card bg-surface-container-lowest rounded-xl p-5 border border-surface-container-highest shadow-sm group">
          <div className="flex items-center justify-between text-secondary">
            <span className="font-label-sm text-label-sm font-semibold tracking-wider uppercase group-hover:text-primary transition-colors">Active PV Modules</span>
            <span className="p-1.5 rounded-lg bg-surface-container-low text-primary group-hover:bg-primary/10 transition-colors">
              <span className="material-symbols-outlined">grid_view</span>
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="font-headline-xl text-headline-xl text-inverse-surface font-bold">{modulesList?.length || 8}</span>
            <span className="font-label-sm text-label-sm text-secondary font-medium">ALMM Models</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5">
            <span className="material-symbols-outlined text-primary text-sm">verified</span>
            <span className="font-label-xs text-label-xs text-primary font-semibold">Waaree, APS, Adani, Rayzone</span>
          </div>
        </div>

        {/* Card 2: Active Inverters */}
        <div className="kpi-card bg-surface-container-lowest rounded-xl p-5 border border-surface-container-highest shadow-sm group">
          <div className="flex items-center justify-between text-secondary">
            <span className="font-label-sm text-label-sm font-semibold tracking-wider uppercase group-hover:text-primary transition-colors">Active Inverters</span>
            <span className="p-1.5 rounded-lg bg-surface-container-low text-primary group-hover:bg-primary/10 transition-colors">
              <span className="material-symbols-outlined">power</span>
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="font-headline-xl text-headline-xl text-inverse-surface font-bold">{invertersList?.length || 9}</span>
            <span className="font-label-sm text-label-sm text-secondary font-medium">2.2kW to 125kW</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5">
            <span className="material-symbols-outlined text-primary text-sm">bolt</span>
            <span className="font-label-xs text-label-xs text-secondary font-semibold">Solaryaan, Solis, Sungrow</span>
          </div>
        </div>

        {/* Card 3: Avg. Module Efficiency */}
        <div className="kpi-card bg-surface-container-lowest rounded-xl p-5 border border-surface-container-highest shadow-sm group">
          <div className="flex items-center justify-between text-secondary">
            <span className="font-label-sm text-label-sm font-semibold tracking-wider uppercase group-hover:text-primary transition-colors">BOS BOM Profiles</span>
            <span className="p-1.5 rounded-lg bg-surface-container-low text-primary group-hover:bg-primary/10 transition-colors">
              <span className="material-symbols-outlined">table_view</span>
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="font-headline-xl text-headline-xl text-inverse-surface font-bold">{pdfBomSpecs?.length || 9}</span>
            <span className="font-label-xs text-label-xs text-primary font-semibold">2.16kW - 8.10kW</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5">
            <span className="material-symbols-outlined text-secondary text-sm">tune</span>
            <span className="font-label-xs text-label-xs text-secondary font-semibold">Exact PDF Specifications</span>
          </div>
        </div>

        {/* Card 4: Catalog Synchronization */}
        <div className="kpi-card bg-surface-container-lowest rounded-xl p-5 border border-surface-container-highest shadow-sm group">
          <div className="flex items-center justify-between text-secondary">
            <span className="font-label-sm text-label-sm font-semibold tracking-wider uppercase group-hover:text-primary transition-colors">Catalog Synchronization</span>
            <span className="p-1.5 rounded-lg bg-surface-container-low text-primary group-hover:bg-primary/10 transition-colors">
              <span className="material-symbols-outlined">sync</span>
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="font-headline-sm text-headline-sm text-inverse-surface font-bold">Today, 09:30 AM</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5">
            <span className="w-2 h-2 rounded-full bg-primary-container"></span>
            <span className="font-label-xs text-label-xs text-secondary font-semibold">Synced across {totalDealersCount} Gujarat Dealers</span>
          </div>
        </div>
      </section>

      {/* SEGMENTED TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-surface-container-highest pb-3 gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setActiveTab('modules')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-label-md font-bold flex items-center gap-2 shadow-sm transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'modules'
                ? 'bg-inverse-surface text-surface-container-lowest'
                : 'bg-surface-container-low text-secondary hover:text-inverse-surface'
            }`}
          >
            <span className="material-symbols-outlined text-primary-container">solar_power</span>
            <span>Solar PV Modules (ALMM Approved)</span>
            <span className="bg-surface-container-lowest/20 text-surface-container-lowest text-label-xs px-2 py-0.5 rounded-full">{modulesList?.length || 8} Models</span>
          </button>
          <button
            onClick={() => setActiveTab('inverters')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-label-md font-medium flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'inverters'
                ? 'bg-inverse-surface text-surface-container-lowest font-bold shadow-sm'
                : 'bg-surface-container-low text-secondary hover:text-inverse-surface'
            }`}
          >
            <span className="material-symbols-outlined">settings_input_component</span>
            <span>Solar Inverters (Grid-Tied &amp; Hybrid)</span>
            <span className="bg-surface-container-highest text-secondary text-label-xs px-2 py-0.5 rounded-full">{invertersList?.length || 9} Models</span>
          </button>
          <button
            onClick={() => setActiveTab('bos')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-label-md font-medium flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'bos'
                ? 'bg-inverse-surface text-surface-container-lowest font-bold shadow-sm'
                : 'bg-surface-container-low text-secondary hover:text-inverse-surface'
            }`}
          >
            <span className="material-symbols-outlined">cable</span>
            <span>Bill of Materials (BOM Specs Table)</span>
            <span className="bg-surface-container-highest text-secondary text-label-xs px-2 py-0.5 rounded-full">PDF Specs</span>
          </button>
        </div>
        <button
          onClick={() => triggerToast('Exported catalog inventory spreadsheet')}
          className="flex items-center gap-1.5 text-primary font-label-md hover:underline self-end sm:self-center shrink-0"
        >
          <span className="material-symbols-outlined">download</span>
          <span>Export Ledger</span>
        </button>
      </div>

      {/* SECTION 1: SOLAR MODULES CATALOG TABLE */}
      {activeTab === 'modules' && (
        <div className="mt-6 bg-surface-container-lowest rounded-xl border border-surface-container-highest shadow-sm overflow-hidden">
          <div className="p-4 bg-surface-container-lowest border-b border-surface-container-highest flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-secondary">search</span>
                <input
                  className="w-full pl-9 pr-3 py-1.5 text-body-md rounded-lg border border-surface-container-highest focus:ring-1 focus:ring-primary-container focus:border-primary-container placeholder-secondary/60"
                  placeholder="Filter by OEM make, wattage, or cell tech..."
                  type="text"
                  value={moduleSearch}
                  onChange={(e) => setModuleSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-label-xs text-secondary font-semibold uppercase mr-1">Filter:</span>
              <button
                onClick={() => setModuleFilter('all')}
                className={`px-3 py-1 rounded-full text-label-xs font-semibold ${moduleFilter === 'all' ? 'bg-inverse-surface text-surface-container-lowest' : 'bg-surface-container-low text-secondary border border-surface-container-highest'}`}
              >
                All ({modulesList?.length || 0})
              </button>
              <button
                onClick={() => setModuleFilter('topcon')}
                className={`px-3 py-1 rounded-full text-label-xs font-medium border ${moduleFilter === 'topcon' ? 'bg-inverse-surface text-surface-container-lowest' : 'bg-surface-container-low text-secondary border-surface-container-highest'}`}
              >
                TOPCon Bifacial
              </button>
              <button
                onClick={() => setModuleFilter('perc')}
                className={`px-3 py-1 rounded-full text-label-xs font-medium border ${moduleFilter === 'perc' ? 'bg-inverse-surface text-surface-container-lowest' : 'bg-surface-container-low text-secondary border-surface-container-highest'}`}
              >
                Mono PERC
              </button>
              <button
                onClick={() => setModuleFilter('commercial')}
                className={`px-3 py-1 rounded-full text-label-xs font-medium border ${moduleFilter === 'commercial' ? 'bg-inverse-surface text-surface-container-lowest' : 'bg-surface-container-low text-secondary border-surface-container-highest'}`}
              >
                High Wattage (≥ 585W)
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-inverse-surface text-surface-container-lowest text-label-sm font-semibold h-11 border-b border-surface-container-lowest/10">
                  <th className="px-4 py-2 font-label-sm">OEM Brand / Make</th>
                  <th className="px-4 py-2 font-label-sm">Model Name &amp; Series</th>
                  <th className="px-4 py-2 font-label-sm">Cell Tech</th>
                  <th className="px-4 py-2 font-label-sm text-right">Wattage</th>
                  <th className="px-4 py-2 font-label-sm">Dimensions &amp; Weight</th>
                  <th className="px-4 py-2 font-label-sm text-right">Efficiency %</th>
                  <th className="px-4 py-2 font-label-sm text-right">Base Procurement Rate</th>
                  <th className="px-4 py-2 font-label-sm">Performance Warranty</th>
                  <th className="px-4 py-2 font-label-sm text-center">Dealer Catalog</th>
                  <th className="px-4 py-2 font-label-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-highest font-body-md text-on-surface">
                {filteredModules.map((mod, idx) => {
                  const initial = mod.brand ? mod.brand.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'PV';
                  return (
                    <tr key={mod.id || idx} className={`hover:bg-surface-container-low/60 transition-colors ${idx % 2 === 1 ? 'bg-surface-container-low/30' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded bg-surface-container-low text-inverse-surface font-bold text-xs flex items-center justify-center border border-surface-container-highest">
                            {initial}
                          </span>
                          <span className="font-semibold text-inverse-surface">{mod.brand}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-inverse-surface">{mod.model}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-label-xs font-semibold ${
                          (mod.cellTech || '').includes('TOPCon')
                            ? 'bg-tertiary-container/20 text-tertiary'
                            : 'bg-secondary-container text-on-secondary-fixed'
                        }`}>
                          {mod.cellTech || 'TOPCon Mono Bifacial'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-inverse-surface font-mono">{mod.wattage} WP</td>
                      <td className="px-4 py-3 text-body-sm text-secondary font-mono">{mod.dimensions || '2278 × 1134 × 30 mm | 28 kg'}</td>
                      <td className="px-4 py-3 text-right font-bold text-primary font-mono">{mod.efficiency || '22.4%'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-bold text-inverse-surface font-mono">{mod.ratePerWp || '₹ 18.50 / Wp'}</div>
                        <div className="text-label-xs text-secondary font-mono">₹ {Math.round(Number(mod.wattage || 550) * 18.5).toLocaleString()} / Panel</div>
                      </td>
                      <td className="px-4 py-3 text-body-sm text-secondary">{mod.warranty || '30 Years Performance'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                          <span className="w-2 h-2 rounded-full bg-primary-container"></span> Active
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 text-secondary">
                          <button className="p-1 hover:text-inverse-surface transition-colors" title="Edit Spec"><span className="material-symbols-outlined">edit</span></button>
                          <button className="p-1 hover:text-error transition-colors" title="Archive Spec"><span className="material-symbols-outlined">archive</span></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: SOLAR INVERTERS CATALOG TABLE */}
      {activeTab === 'inverters' && (
        <div className="mt-6 bg-surface-container-lowest rounded-xl border border-surface-container-highest shadow-sm overflow-hidden">
          <div className="p-4 bg-surface-container-lowest border-b border-surface-container-highest flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-inverse-surface font-bold">
                Approved String &amp; Central Inverters Master (Single &amp; Three Phase)
              </h2>
              <p className="font-body-sm text-body-sm text-secondary mt-0.5">
                Preset efficiencies, phase configurations, and base distributor rates for Gujarat quotations.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-2 text-secondary text-sm">search</span>
                <input
                  type="text"
                  placeholder="Search inverters..."
                  value={inverterSearch}
                  onChange={(e) => setInverterSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-surface-container-highest"
                />
              </div>
              <button
                onClick={() => setInverterFilter('all')}
                className={`px-3 py-1.5 text-label-xs font-semibold rounded-lg border ${inverterFilter === 'all' ? 'bg-inverse-surface text-surface-container-lowest' : 'bg-surface-container-low text-secondary border-surface-container-highest'}`}
              >
                All ({invertersList?.length || 0})
              </button>
              <button
                onClick={() => setInverterFilter('single')}
                className={`px-3 py-1.5 text-label-xs font-semibold rounded-lg border ${inverterFilter === 'single' ? 'bg-inverse-surface text-surface-container-lowest' : 'bg-surface-container-low text-secondary border-surface-container-highest'}`}
              >
                1-Phase
              </button>
              <button
                onClick={() => setInverterFilter('three')}
                className={`px-3 py-1.5 text-label-xs font-semibold rounded-lg border ${inverterFilter === 'three' ? 'bg-inverse-surface text-surface-container-lowest' : 'bg-surface-container-low text-secondary border-surface-container-highest'}`}
              >
                3-Phase
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-inverse-surface text-surface-container-lowest text-label-sm font-semibold h-11 border-b border-surface-container-lowest/10">
                  <th className="px-4 py-2 font-label-sm">Brand / OEM</th>
                  <th className="px-4 py-2 font-label-sm">Model</th>
                  <th className="px-4 py-2 font-label-sm text-right">Rated Capacity</th>
                  <th className="px-4 py-2 font-label-sm">Grid Phase &amp; MPPT</th>
                  <th className="px-4 py-2 font-label-sm text-right">Euro Efficiency</th>
                  <th className="px-4 py-2 font-label-sm text-right">Inverter Base Price (₹)</th>
                  <th className="px-4 py-2 font-label-sm">Replacement Warranty</th>
                  <th className="px-4 py-2 font-label-sm text-center">Dealer Quoting</th>
                  <th className="px-4 py-2 font-label-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-highest font-body-md text-on-surface">
                {filteredInverters.map((inv, idx) => {
                  const initial = inv.brand ? inv.brand.slice(0, 2).toUpperCase() : 'IN';
                  return (
                    <tr key={inv.id || idx} className={`hover:bg-surface-container-low/60 transition-colors ${idx % 2 === 1 ? 'bg-surface-container-low/30' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded bg-primary-container/20 text-primary font-bold text-xs flex items-center justify-center border border-primary-container/40">
                            {initial}
                          </span>
                          <span className="font-semibold text-inverse-surface">{inv.brand}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-inverse-surface">{inv.model}</td>
                      <td className="px-4 py-3 text-right font-bold text-inverse-surface font-mono">{inv.capacity}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 rounded-full text-label-xs font-semibold bg-surface-container-high text-on-surface">
                          {inv.phase || '3-Phase'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-primary font-mono">{inv.efficiency || '98.6%'}</td>
                      <td className="px-4 py-3 text-right font-bold text-inverse-surface font-mono">{inv.basePrice || '₹ 54,000'}</td>
                      <td className="px-4 py-3 text-body-sm text-secondary">{inv.warranty || '8 Years Comprehensive'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                          <span className="w-2 h-2 rounded-full bg-primary-container"></span> Active
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 text-secondary">
                          <button className="p-1 hover:text-inverse-surface transition-colors" title="Edit Spec"><span className="material-symbols-outlined">edit</span></button>
                          <button className="p-1 hover:text-primary transition-colors" title="Specs Sheet PDF"><span className="material-symbols-outlined">picture_as_pdf</span></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: REAL PDF BOS SPECIFICATIONS TABLE */}
      {activeTab === 'bos' && (
        <div className="mt-6 bg-surface-container-lowest rounded-xl border border-surface-container-highest shadow-sm overflow-hidden p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-surface-container-highest gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline-sm text-headline-sm text-inverse-surface font-bold">
                  BOS (Balance of System) Master Specification Table
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-primary-container/20 text-primary text-label-xs font-bold">
                  From Official Price List PDF
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-secondary mt-1">
                Standard component bill of materials (Wires, ACDB, DCDB, Earthing, PVC, MC4) across system capacities.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-secondary">Capacity:</span>
              <select
                value={bosCapacityFilter}
                onChange={(e) => setBosCapacityFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-surface-container-highest bg-surface-container-lowest"
              >
                <option value="all">All Capacities (2.16kW to 8.10kW)</option>
                <option value="2.16">2.16 kW</option>
                <option value="2.70">2.70 kW</option>
                <option value="3.24">3.24 kW</option>
                <option value="3.78">3.78 kW</option>
                <option value="4.32">4.32 kW</option>
                <option value="4.86">4.86 kW</option>
                <option value="5.40">5.40 kW</option>
                <option value="5.94">5.94 kW</option>
                <option value="8.10">8.10 kW</option>
              </select>
            </div>
          </div>

          {/* BOS Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-inverse-surface text-surface-container-lowest text-label-sm font-semibold h-11 border-b border-surface-container-lowest/10">
                  <th className="px-3 py-2 font-label-sm">Capacity</th>
                  <th className="px-3 py-2 font-label-sm">Modules</th>
                  <th className="px-3 py-2 font-label-sm">Inverter</th>
                  <th className="px-3 py-2 font-label-sm">DC Wire (1C×4)</th>
                  <th className="px-3 py-2 font-label-sm">AC Wire</th>
                  <th className="px-3 py-2 font-label-sm">Earthing Wire</th>
                  <th className="px-3 py-2 font-label-sm">LA Wire</th>
                  <th className="px-3 py-2 font-label-sm">ACDB / DCDB</th>
                  <th className="px-3 py-2 font-label-sm">Earthing Kit</th>
                  <th className="px-3 py-2 font-label-sm">PVC &amp; Hardware</th>
                  <th className="px-3 py-2 font-label-sm">MC4</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-highest font-body-sm text-xs text-on-surface">
                {filteredBomSpecs.map((row, idx) => (
                  <tr key={idx} className={`hover:bg-surface-container-low/60 transition-colors ${idx % 2 === 1 ? 'bg-surface-container-low/20' : ''}`}>
                    <td className="px-3 py-3 font-bold text-inverse-surface font-mono">{row.capacityKW}</td>
                    <td className="px-3 py-3 font-semibold text-primary">{row.modulesQty}</td>
                    <td className="px-3 py-3">{row.inverterQty}</td>
                    <td className="px-3 py-3 font-mono">{row.dcWire}</td>
                    <td className="px-3 py-3 font-mono">{row.acWire}</td>
                    <td className="px-3 py-3 font-mono">{row.earthingWire}</td>
                    <td className="px-3 py-3 font-mono">{row.laWire}</td>
                    <td className="px-3 py-3">{row.acdbDcdb}</td>
                    <td className="px-3 py-3">{row.earthingKit}</td>
                    <td className="px-3 py-3">{row.pvcHardware}</td>
                    <td className="px-3 py-3 font-mono">{row.mc4Connectors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Standard compliance tags */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-surface-container-highest">
            <div className="p-3.5 rounded-lg bg-surface-container-low border border-surface-container-highest">
              <div className="font-label-md font-bold text-on-surface">Galvanized Structure (IS 2062)</div>
              <p className="text-xs text-secondary mt-1">80 Micron minimum zinc coating, withstands 150 km/h wind load.</p>
            </div>
            <div className="p-3.5 rounded-lg bg-surface-container-low border border-surface-container-highest">
              <div className="font-label-md font-bold text-on-surface">Solar DC Cables (EN 50618)</div>
              <p className="text-xs text-secondary mt-1">XLPO insulated, UV resistant, electron-beam cross-linked copper.</p>
            </div>
            <div className="p-3.5 rounded-lg bg-surface-container-low border border-surface-container-highest">
              <div className="font-label-md font-bold text-on-surface">SPD Type II ACDB / DCDB (IP65)</div>
              <p className="text-xs text-secondary mt-1">Polycarbonate distribution enclosures with surge protection.</p>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER & AUDIT TRAIL ADVISORY */}
      <div className="mt-8 mb-4 p-4 rounded-xl bg-surface-container-lowest border border-surface-container-highest flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-lg bg-secondary-container text-on-secondary-fixed">
            <span className="material-symbols-outlined">info</span>
          </span>
          <div className="flex flex-col">
            <span className="font-label-md text-label-md font-semibold text-inverse-surface">Global Catalog Engine Advisory</span>
            <span className="font-body-sm text-body-sm text-secondary">Hardware additions immediately reflect inside the dealer quotation calculation engine for all active DISCOM regions.</span>
          </div>
        </div>
      </div>

      {/* ADD SOLAR MODULE MODAL */}
      {showAddModuleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-surface-container-high animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-surface-container-high">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">solar_power</span>
                </span>
                <h3 className="font-headline-sm text-lg font-bold text-on-surface">Add Solar PV Module</h3>
              </div>
              <button
                onClick={() => setShowAddModuleModal(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-secondary cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveModule} className="py-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">OEM Brand / Make *</label>
                  <input
                    required
                    type="text"
                    value={moduleForm.brand}
                    onChange={(e) => setModuleForm({ ...moduleForm, brand: e.target.value })}
                    placeholder="e.g. Adani Solar / Waaree"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-surface-container-highest bg-surface-container-lowest focus:ring-1 focus:ring-primary-container"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Model Name &amp; Series *</label>
                  <input
                    required
                    type="text"
                    value={moduleForm.model}
                    onChange={(e) => setModuleForm({ ...moduleForm, model: e.target.value })}
                    placeholder="e.g. Shine 600WP TOPCon"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-surface-container-highest bg-surface-container-lowest focus:ring-1 focus:ring-primary-container"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Wattage (W) *</label>
                  <input
                    required
                    type="number"
                    value={moduleForm.wattage}
                    onChange={(e) => setModuleForm({ ...moduleForm, wattage: e.target.value })}
                    placeholder="550"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-surface-container-highest bg-surface-container-lowest focus:ring-1 focus:ring-primary-container"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Efficiency %</label>
                  <input
                    type="text"
                    value={moduleForm.efficiency}
                    onChange={(e) => setModuleForm({ ...moduleForm, efficiency: e.target.value })}
                    placeholder="22.6%"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-surface-container-highest bg-surface-container-lowest focus:ring-1 focus:ring-primary-container"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Rate (₹/Wp)</label>
                  <input
                    type="text"
                    value={moduleForm.ratePerWp}
                    onChange={(e) => setModuleForm({ ...moduleForm, ratePerWp: e.target.value })}
                    placeholder="19.20"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-surface-container-highest bg-surface-container-lowest focus:ring-1 focus:ring-primary-container"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">Cell Tech</label>
                <select
                  value={moduleForm.cellTech}
                  onChange={(e) => setModuleForm({ ...moduleForm, cellTech: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-surface-container-highest bg-surface-container-lowest focus:ring-1 focus:ring-primary-container"
                >
                  <option value="TOPCon Mono Bifacial">TOPCon Mono Bifacial (Recommended)</option>
                  <option value="Mono PERC">Mono PERC Half-Cut</option>
                  <option value="HJT Ultra-Efficiency">HJT Ultra-Efficiency</option>
                  <option value="Polycrystalline DCR">Polycrystalline DCR</option>
                </select>
              </div>

              <div className="pt-3 border-t border-surface-container-high flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModuleModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-secondary hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-primary-container text-surface-container-lowest hover:bg-primary rounded-lg transition-all shadow-sm cursor-pointer"
                >
                  Publish to Catalog &amp; Notify Dealers
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD INVERTER MODEL MODAL */}
      {showAddInverterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-surface-container-high animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-surface-container-high">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">bolt</span>
                </span>
                <h3 className="font-headline-sm text-lg font-bold text-on-surface">Add Inverter Model</h3>
              </div>
              <button
                onClick={() => setShowAddInverterModal(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-secondary cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveInverter} className="py-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Brand / OEM Make *</label>
                  <input
                    required
                    type="text"
                    value={inverterForm.brand}
                    onChange={(e) => setInverterForm({ ...inverterForm, brand: e.target.value })}
                    placeholder="e.g. Sungrow / Solis / Sunvine"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-surface-container-highest bg-surface-container-lowest focus:ring-1 focus:ring-primary-container"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Model Name *</label>
                  <input
                    required
                    type="text"
                    value={inverterForm.model}
                    onChange={(e) => setInverterForm({ ...inverterForm, model: e.target.value })}
                    placeholder="e.g. SG10RT 3-Phase Multi-MPPT"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-surface-container-highest bg-surface-container-lowest focus:ring-1 focus:ring-primary-container"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Rated Capacity *</label>
                  <input
                    required
                    type="text"
                    value={inverterForm.capacity}
                    onChange={(e) => setInverterForm({ ...inverterForm, capacity: e.target.value })}
                    placeholder="10 kW"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-surface-container-highest bg-surface-container-lowest focus:ring-1 focus:ring-primary-container"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Phase</label>
                  <select
                    value={inverterForm.phase}
                    onChange={(e) => setInverterForm({ ...inverterForm, phase: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-surface-container-highest bg-surface-container-lowest focus:ring-1 focus:ring-primary-container"
                  >
                    <option value="3-Phase 415V">3-Phase 415V</option>
                    <option value="1-Phase 230V">1-Phase 230V</option>
                    <option value="Hybrid Battery-Ready">Hybrid Battery-Ready</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Efficiency</label>
                  <input
                    type="text"
                    value={inverterForm.efficiency}
                    onChange={(e) => setInverterForm({ ...inverterForm, efficiency: e.target.value })}
                    placeholder="98.5%"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-surface-container-highest bg-surface-container-lowest focus:ring-1 focus:ring-primary-container"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-surface-container-high flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddInverterModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-secondary hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-primary-container text-surface-container-lowest hover:bg-primary rounded-lg transition-all shadow-sm cursor-pointer"
                >
                  Publish to Catalog &amp; Notify Dealers
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
