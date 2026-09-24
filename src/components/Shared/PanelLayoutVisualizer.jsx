import React, { useState, useMemo, useRef } from 'react';
import {
  generateDynamicLayouts,
  parseModuleDimensions,
  mmToMeters,
  mmToFeet,
  DEFAULT_MODULE_DIMS
} from '../../utils/solarLayoutEngine';

export default function PanelLayoutVisualizer({
  initialPanelCount = 6,
  moduleSpecs = null,
  selectedLayoutId = null,
  onSelectLayout = null,
  isModal = false,
  onClose = null
}) {
  const [panelCount, setPanelCount] = useState(initialPanelCount || 6);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedId, setSelectedId] = useState(selectedLayoutId || 'portrait_2x3');

  // Manual hardware override states (editable by dealer)
  const [manualFrontLegs, setManualFrontLegs] = useState('');
  const [manualRearLegs, setManualRearLegs] = useState('');
  const [manualMidClamps, setManualMidClamps] = useState('');
  const [manualEndClamps, setManualEndClamps] = useState('');
  const [showManualInputs, setShowManualInputs] = useState(false);

  const scrollContainerRef = useRef(null);

  // Derive module dimensions from props or fallback to standard 550W-600W
  const moduleDims = useMemo(() => {
    if (moduleSpecs?.dimensions) {
      return parseModuleDimensions(moduleSpecs.dimensions);
    }
    return DEFAULT_MODULE_DIMS;
  }, [moduleSpecs]);

  // Generate all dynamic layouts based on current panelCount
  const allLayouts = useMemo(() => {
    return generateDynamicLayouts(panelCount, moduleDims);
  }, [panelCount, moduleDims]);

  // Filter layouts by selected category tab
  const filteredLayouts = useMemo(() => {
    if (activeCategory === 'all') return allLayouts;
    if (activeCategory === 'recommended') return allLayouts.filter(l => l.isRecommended || l.excelTag);
    if (activeCategory === 'portrait') return allLayouts.filter(l => l.type === 'portrait');
    if (activeCategory === 'landscape') return allLayouts.filter(l => l.type === 'landscape');
    if (activeCategory === 'hybrid') return allLayouts.filter(l => l.type === 'hybrid');
    if (activeCategory === 'split') return allLayouts.filter(l => l.type === 'split');
    return allLayouts;
  }, [allLayouts, activeCategory]);

  // Selected layout object
  const activeSelectedLayout = useMemo(() => {
    return allLayouts.find(l => l.id === selectedId) || allLayouts[0] || null;
  }, [allLayouts, selectedId]);

  const handleSelect = (layout) => {
    setSelectedId(layout.id);
    // Pre-populate manual hardware inputs
    setManualFrontLegs(String(layout.bom.frontLegs));
    setManualRearLegs(String(layout.bom.rearLegs));
    setManualMidClamps(String(layout.bom.midClampsCount));
    setManualEndClamps(String(layout.bom.endClampsCount));

    if (onSelectLayout) {
      onSelectLayout({
        ...layout,
        manualOverrides: {
          frontLegs: layout.bom.frontLegs,
          rearLegs: layout.bom.rearLegs,
          midClamps: layout.bom.midClampsCount,
          endClamps: layout.bom.endClampsCount
        }
      });
    }
  };

  const handleSaveManualHardware = () => {
    if (!activeSelectedLayout || !onSelectLayout) return;
    const fLegs = parseInt(manualFrontLegs, 10) || activeSelectedLayout.bom.frontLegs;
    const rLegs = parseInt(manualRearLegs, 10) || activeSelectedLayout.bom.rearLegs;
    const mClamps = parseInt(manualMidClamps, 10) || activeSelectedLayout.bom.midClampsCount;
    const eClamps = parseInt(manualEndClamps, 10) || activeSelectedLayout.bom.endClampsCount;

    onSelectLayout({
      ...activeSelectedLayout,
      bom: {
        ...activeSelectedLayout.bom,
        frontLegs: fLegs,
        rearLegs: rLegs,
        totalLegs: fLegs + rLegs,
        midClampsCount: mClamps,
        endClampsCount: eClamps,
        totalClamps: mClamps + eClamps
      },
      manualOverrides: {
        frontLegs: fLegs,
        rearLegs: rLegs,
        midClamps: mClamps,
        endClamps: eClamps
      }
    });
  };

  const handlePanelCountChange = (delta) => {
    setPanelCount(prev => Math.max(1, Math.min(36, Number(prev) + delta)));
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -480 : 480;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col w-full bg-surface-container-lowest rounded-2xl border border-surface-container-high shadow-xl overflow-hidden">
      {/* 1. Header Bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0F1B2E] via-[#1E293B] to-[#0F1B2E] text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-container-highest">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="material-symbols-outlined text-[#6CBF3D] text-[26px]">grid_view</span>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
              2D Solar Structure &amp; Panel Layout Studio
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#6CBF3D]/20 text-[#6CBF3D] border border-[#6CBF3D]/40 uppercase">
              Side-by-Side 2D Presets
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            सभी डिज़ाइन्स साइड-बाय-साइड देखें। प्रत्येक कार्ड में सटीक J-Bolt संख्या दी गई है। अपनी पसंद का लेआउट चुनें।
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="self-end md:self-auto p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        )}
      </div>

      {/* 2. Interactive Panel Count & Filter Controller */}
      <div className="p-4 sm:p-5 bg-surface-container-low border-b border-surface-container-high flex flex-col gap-3.5">
        {/* Row 1: Panel Count Stepper & Quick Presets */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-surface-container-highest shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[18px]">tune</span>
              Total Solar Modules:
            </span>
            <div className="flex items-center border border-surface-container-highest rounded-lg overflow-hidden bg-surface-container-lowest shadow-xs">
              <button
                type="button"
                onClick={() => handlePanelCountChange(-1)}
                disabled={panelCount <= 1}
                className="w-8 h-8 flex items-center justify-center text-secondary hover:text-on-surface hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors font-bold text-base"
                title="Decrease 1 panel"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max="40"
                value={panelCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val >= 1 && val <= 40) {
                    setPanelCount(val);
                  }
                }}
                className="w-12 h-8 text-center text-sm font-extrabold text-on-surface bg-transparent outline-none"
              />
              <button
                type="button"
                onClick={() => handlePanelCountChange(1)}
                disabled={panelCount >= 40}
                className="w-8 h-8 flex items-center justify-center text-secondary hover:text-on-surface hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors font-bold text-base"
                title="Increase 1 panel"
              >
                +
              </button>
            </div>
            <span className="text-xs font-bold text-primary hidden sm:inline-block">
              ~{(panelCount * 0.55).toFixed(1)} kW Array
            </span>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-secondary mr-1">Quick Presets:</span>
            {[
              { count: 4, kw: '2.2kW' },
              { count: 6, kw: '3.3kW (Excel)' },
              { count: 8, kw: '4.4kW' },
              { count: 10, kw: '5.5kW' },
              { count: 12, kw: '6.6kW' },
              { count: 14, kw: '8.0kW' }
            ].map(item => (
              <button
                key={item.count}
                type="button"
                onClick={() => setPanelCount(item.count)}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  panelCount === item.count
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-container-high text-secondary hover:text-on-surface hover:bg-surface-container-highest'
                }`}
              >
                {item.count}P ({item.kw})
              </button>
            ))}
          </div>

          <div className="text-[11px] text-secondary flex items-center gap-1 bg-surface-container-high px-2.5 py-1 rounded-md">
            <span className="material-symbols-outlined text-[14px]">straighten</span>
            <span>Module: <b>{moduleDims.lengthMm} × {moduleDims.widthMm} mm</b> (~2:1 Ratio)</span>
          </div>
        </div>

        {/* Row 2: Category Filter Tabs & Horizontal Scroll Arrows */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {[
              { id: 'all', label: `All Layouts (${allLayouts.length})`, icon: 'apps' },
              { id: 'recommended', label: 'Recommended / Excel Presets', icon: 'star' },
              { id: 'portrait', label: 'Pure Portrait (खड़ी)', icon: 'crop_portrait' },
              { id: 'landscape', label: 'Pure Landscape (आड़ी)', icon: 'crop_landscape' },
              { id: 'hybrid', label: 'Hybrid (खड़ी + आड़ी)', icon: 'auto_awesome' },
              { id: 'split', label: 'Dual Split Tables', icon: 'splitscreen' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === tab.id
                    ? 'bg-[#0F1B2E] text-white shadow-sm'
                    : 'bg-white border border-surface-container-highest text-secondary hover:text-on-surface hover:bg-surface-container-low'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Side-by-Side Scroll Control Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-secondary font-medium mr-1">
              Scroll Layouts:
            </span>
            <button
              type="button"
              onClick={() => scroll('left')}
              className="w-8 h-8 rounded-lg bg-white border border-surface-container-highest hover:bg-surface-container-low text-on-surface flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
              title="Scroll left"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="w-8 h-8 rounded-lg bg-white border border-surface-container-highest hover:bg-surface-container-low text-on-surface flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
              title="Scroll right"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Horizontal Scrollable Cards (Side-by-Side with Generous Width) */}
      <div
        ref={scrollContainerRef}
        className="p-4 sm:p-6 flex flex-row overflow-x-auto gap-6 bg-surface-container-lowest scroll-smooth snap-x pb-6"
      >
        {filteredLayouts.length === 0 ? (
          <div className="w-full py-12 text-center text-secondary">
            <span className="material-symbols-outlined text-4xl opacity-50 mb-2">grid_off</span>
            <p className="text-sm font-semibold">No layout combinations found for this category filter.</p>
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className="mt-2 text-xs text-primary hover:underline font-bold"
            >
              Reset Category Filter
            </button>
          </div>
        ) : (
          filteredLayouts.map((layout) => {
            const isSelected = selectedId === layout.id;
            const widthM = mmToMeters(layout.widthMm);
            const depthM = mmToMeters(layout.depthMm);
            const widthFt = mmToFeet(layout.widthMm);
            const depthFt = mmToFeet(layout.depthMm);
            const areaSqM = ((layout.areaSqM || 0)).toFixed(1);
            const areaSqFt = (((layout.areaSqM || 0)) * 10.7639).toFixed(0);

            return (
              <div
                key={layout.id}
                onClick={() => handleSelect(layout)}
                className={`min-w-[420px] sm:min-w-[460px] max-w-[480px] shrink-0 snap-start rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/40 shadow-lg bg-white'
                    : 'border-surface-container-highest hover:border-primary/50 hover:shadow-md bg-white'
                }`}
              >
                {/* Card Header */}
                <div className="p-4 border-b border-surface-container-high bg-surface-container-lowest flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-extrabold text-on-surface">{layout.name}</span>
                      {layout.excelTag && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-300">
                          {layout.excelTag}
                        </span>
                      )}
                      {layout.isRecommended && !layout.excelTag && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[12px]">star</span>
                          Popular
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-secondary mt-1 flex items-center gap-2">
                      <span className="font-semibold text-primary">{layout.category}</span>
                      <span>•</span>
                      <span className="font-bold text-on-surface">{layout.totalPanels} Solar Panels</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-primary text-white shadow-xs' : 'border border-surface-container-highest text-transparent'
                    }`}>
                      <span className="material-symbols-outlined text-[18px]">check</span>
                    </span>
                  </div>
                </div>

                {/* 2D Architectural CAD Drawing Box (Large & High Definition) */}
                <div className="p-4 bg-[#F8FAFC] flex flex-col items-center justify-center min-h-[260px] relative border-b border-surface-container-high">
                  {/* Top Bar inside CAD box: Compass + Dimensions */}
                  <div className="w-full flex items-center justify-between gap-2 mb-2 text-xs">
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-bold shadow-2xs">
                      <span className="material-symbols-outlined text-[16px] text-rose-500 animate-pulse">explore</span>
                      <span>🧭 South Tilt (180°)</span>
                    </div>
                    <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-slate-200 text-slate-700 font-extrabold shadow-2xs">
                      <span>Width: {widthM}m ({widthFt} ft)</span>
                    </div>
                  </div>

                  {/* 2D Solar Array Large SVG Canvas */}
                  <div className="w-full flex items-center justify-center py-2">
                    <Render2DArraySvg layout={layout} />
                  </div>

                  {/* Bottom Bar: Depth & Area Footprint */}
                  <div className="w-full flex items-center justify-between text-xs text-slate-600 font-semibold mt-2 pt-2 border-t border-slate-200/60">
                    <span>Slope / Depth: <b>{depthM}m ({depthFt} ft)</b></span>
                    <span>Array Area: <b>{areaSqM} m² ({areaSqFt} sq.ft)</b></span>
                  </div>
                </div>

                {/* Bottom BOM Area: Highlight ONLY J-Bolts as requested */}
                <div className="p-4 bg-surface-container-lowest flex flex-col gap-3">
                  {/* Dedicated Clean J-Bolt Card */}
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center font-black text-lg">
                        ⚡
                      </div>
                      <div>
                        <span className="text-xs font-bold text-amber-950 block">
                          Total J-Bolts Required
                        </span>
                        <span className="text-[11px] text-amber-800">
                          {layout.totalPanels} Panels × 4 J-Bolts per panel
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-amber-950 block leading-tight">
                        {layout.bom.jBoltsCount} <span className="text-xs font-bold text-amber-800">Pcs</span>
                      </span>
                    </div>
                  </div>

                  {/* Select Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(layout);
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                      isSelected
                        ? 'bg-primary text-white ring-2 ring-primary/30'
                        : 'bg-surface-container-high text-on-surface hover:bg-primary hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isSelected ? 'check_circle' : 'touch_app'}
                    </span>
                    <span>{isSelected ? 'Selected Layout Active' : 'Select This Mounting Layout'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Manual Hardware Customization Bar (Dealer can manually fill legs, clamps etc.) */}
      <div className="p-4 sm:p-5 bg-surface-container-low border-t border-surface-container-high flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">construction</span>
            <span className="text-xs sm:text-sm font-bold text-on-surface">
              Manual Hardware Customization (Optional):
            </span>
            <span className="text-xs text-secondary">
              (Active: <b className="text-on-surface">{activeSelectedLayout?.name || 'Selected Layout'}</b>)
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowManualInputs(!showManualInputs)}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{showManualInputs ? 'Hide Custom Inputs' : 'Edit Legs & Clamps Manually'}</span>
            <span className="material-symbols-outlined text-[16px]">
              {showManualInputs ? 'expand_less' : 'tune'}
            </span>
          </button>
        </div>

        {showManualInputs && (
          <div className="p-4 rounded-xl bg-white border border-surface-container-highest shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-3 animate-in fade-in duration-150">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-secondary">Front Legs (आगे के पैर)</label>
              <input
                type="number"
                min="1"
                max="20"
                value={manualFrontLegs}
                onChange={(e) => setManualFrontLegs(e.target.value)}
                placeholder={String(activeSelectedLayout?.bom?.frontLegs || 3)}
                className="h-9 px-3 rounded-lg border border-surface-container-highest text-xs font-bold text-on-surface outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-secondary">Rear Legs (पीछे के पैर)</label>
              <input
                type="number"
                min="1"
                max="20"
                value={manualRearLegs}
                onChange={(e) => setManualRearLegs(e.target.value)}
                placeholder={String(activeSelectedLayout?.bom?.rearLegs || 3)}
                className="h-9 px-3 rounded-lg border border-surface-container-highest text-xs font-bold text-on-surface outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-secondary">Mid Clamps (बीच के क्लैम्प)</label>
              <input
                type="number"
                min="0"
                max="50"
                value={manualMidClamps}
                onChange={(e) => setManualMidClamps(e.target.value)}
                placeholder={String(activeSelectedLayout?.bom?.midClampsCount || 8)}
                className="h-9 px-3 rounded-lg border border-surface-container-highest text-xs font-bold text-on-surface outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-secondary">End Clamps (कोने के क्लैम्प)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={manualEndClamps}
                  onChange={(e) => setManualEndClamps(e.target.value)}
                  placeholder={String(activeSelectedLayout?.bom?.endClampsCount || 4)}
                  className="h-9 px-3 w-full rounded-lg border border-surface-container-highest text-xs font-bold text-on-surface outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={handleSaveManualHardware}
                  className="h-9 px-3 bg-primary hover:bg-[#4F9A2C] text-white text-xs font-bold rounded-lg shrink-0 cursor-pointer shadow-xs transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Footer Info */}
      <div className="p-3 bg-surface-container-low border-t border-surface-container-high flex flex-wrap items-center justify-between text-xs text-secondary">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-primary">info</span>
          <span>
            <b>Standard Gujarat Tilt:</b> 15°–22° South Facing. Panels scale automatically to real physical proportions (~2:1).
          </span>
        </div>
        <div className="flex items-center gap-3 font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#1E3E62] border border-[#CBD5E1]"></span>
            <span>Khadi (Portrait)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#0284C7] border border-[#CBD5E1]"></span>
            <span>Aadi (Landscape)</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Large High-Detail 2D SVG Renderer for Solar Array
 * Renders large, crystal-clear photovoltaic cells with busbars and legible panel numbers
 */
function Render2DArraySvg({ layout }) {
  const { widthMm, depthMm, rows } = layout;

  // Large SVG viewport dimensions for big, readable display
  const svgWidth = 440;
  const svgHeight = 220;
  const padding = 16;

  // Scale factors to fit nicely within SVG box
  const availableW = svgWidth - padding * 2;
  const availableH = svgHeight - padding * 2;
  const scale = Math.min(availableW / (widthMm || 2278), availableH / (depthMm || 1134));

  const arraySvgW = (widthMm || 2278) * scale;
  const arraySvgH = (depthMm || 1134) * scale;
  const startX = (svgWidth - arraySvgW) / 2;
  const startY = (svgHeight - arraySvgH) / 2;

  return (
    <svg
      width="100%"
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="max-w-full drop-shadow-sm overflow-visible"
    >
      <defs>
        {/* Photovoltaic Solar Cell Dark Navy Gradient (Portrait) */}
        <linearGradient id={`pvGrad_${layout.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0B192C" />
          <stop offset="60%" stopColor="#1E3E62" />
          <stop offset="100%" stopColor="#06121E" />
        </linearGradient>

        {/* Photovoltaic Solar Cell Sky Blue Gradient (Landscape) */}
        <linearGradient id={`pvGradLand_${layout.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0369A1" />
          <stop offset="60%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#075985" />
        </linearGradient>
      </defs>

      {/* Structural Purlins / C-Channel Rails behind panels */}
      <line
        x1={startX - 6}
        y1={startY + arraySvgH * 0.25}
        x2={startX + arraySvgW + 6}
        y2={startY + arraySvgH * 0.25}
        stroke="#94A3B8"
        strokeWidth="3.5"
        strokeDasharray="6 3"
      />
      <line
        x1={startX - 6}
        y1={startY + arraySvgH * 0.75}
        x2={startX + arraySvgW + 6}
        y2={startY + arraySvgH * 0.75}
        stroke="#94A3B8"
        strokeWidth="3.5"
        strokeDasharray="6 3"
      />

      {/* Rows and Panels */}
      {(() => {
        let currentY = startY;
        return (rows || []).map((row, rIdx) => {
          const rowPanels = Array.isArray(row) ? row : [];
          if (rowPanels.length === 0) return null;

          const firstPanel = rowPanels[0];
          const rowH = firstPanel.heightMm * scale;
          const totalRowW = rowPanels.reduce((acc, p) => acc + (p.widthMm * scale), 0);
          let currentX = startX + ((arraySvgW - totalRowW) / 2);

          const rowElements = rowPanels.map((panel, pIdx) => {
            const pw = panel.widthMm * scale;
            const ph = panel.heightMm * scale;
            const px = currentX;
            const py = currentY;
            currentX += pw;

            const isLandscape = panel.orientation === 'landscape';

            return (
              <g key={`panel_${panel.id || `${rIdx}_${pIdx}`}`}>
                {/* Silver Anodized Aluminium Frame */}
                <rect
                  x={px}
                  y={py}
                  width={pw}
                  height={ph}
                  fill="#E2E8F0"
                  stroke="#475569"
                  strokeWidth="1.5"
                  rx="2"
                />

                {/* Photovoltaic Blue Glass Wafer */}
                <rect
                  x={px + 1.5}
                  y={py + 1.5}
                  width={Math.max(1, pw - 3)}
                  height={Math.max(1, ph - 3)}
                  fill={isLandscape ? `url(#pvGradLand_${layout.id})` : `url(#pvGrad_${layout.id})`}
                  rx="1.5"
                />

                {/* Distinct Solar Busbar Grid Lines */}
                <line
                  x1={px + pw * 0.33}
                  y1={py + 2}
                  x2={px + pw * 0.33}
                  y2={py + ph - 2}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="0.8"
                />
                <line
                  x1={px + pw * 0.66}
                  y1={py + 2}
                  x2={px + pw * 0.66}
                  y2={py + ph - 2}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="0.8"
                />
                <line
                  x1={px + 2}
                  y1={py + ph * 0.5}
                  x2={px + pw - 2}
                  y2={py + ph * 0.5}
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="0.8"
                />

                {/* Bold, Legible Panel Number Text */}
                {pw >= 14 && ph >= 14 && (
                  <text
                    x={px + pw / 2}
                    y={py + ph / 2 + 4}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize={Math.max(8, Math.min(13, pw / 3.2))}
                    fontWeight="900"
                    filter="drop-shadow(0 1px 2px rgba(0,0,0,0.9))"
                  >
                    {panel.label || `P${pIdx + 1}`}
                  </text>
                )}

                {/* J-Bolt Fastener Corner Dots */}
                <circle cx={px + 3} cy={py + 3} r="1.5" fill="#22C55E" stroke="#000" strokeWidth="0.4" />
                <circle cx={px + pw - 3} cy={py + 3} r="1.5" fill="#22C55E" stroke="#000" strokeWidth="0.4" />
                <circle cx={px + 3} cy={py + ph - 3} r="1.5" fill="#22C55E" stroke="#000" strokeWidth="0.4" />
                <circle cx={px + pw - 3} cy={py + ph - 3} r="1.5" fill="#22C55E" stroke="#000" strokeWidth="0.4" />
              </g>
            );
          });

          currentY += rowH;
          return <g key={`row_${rIdx}`}>{rowElements}</g>;
        });
      })()}

      {/* Front & Rear Leg Position Markers */}
      {(() => {
        const legCount = layout?.bom?.frontLegs || 2;
        const legStep = legCount > 1 ? arraySvgW / (legCount - 1) : 0;
        const legs = [];
        for (let i = 0; i < legCount; i++) {
          const lx = startX + (i * legStep);
          legs.push(
            <g key={`leg_${i}`}>
              <circle cx={lx} cy={startY + 3} r="3" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1" />
              <circle cx={lx} cy={startY + arraySvgH - 3} r="3" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1" />
            </g>
          );
        }
        return legs;
      })()}
    </svg>
  );
}
