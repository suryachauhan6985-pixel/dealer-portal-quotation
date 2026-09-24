import React, { useState, useMemo } from 'react';
import {
  generateDynamicLayouts,
  parseModuleDimensions,
  mmToMeters,
  mmToFeet,
  sqMmToSqFt,
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

  const handleSelect = (layout) => {
    setSelectedId(layout.id);
    if (onSelectLayout) {
      onSelectLayout(layout);
    }
  };

  const handlePanelCountChange = (delta) => {
    setPanelCount(prev => Math.max(1, Math.min(36, Number(prev) + delta)));
  };

  return (
    <div className="flex flex-col w-full bg-surface-container-lowest rounded-2xl border border-surface-container-high shadow-lg overflow-hidden">
      {/* 1. Header Bar */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-[#0F1B2E] via-[#1E293B] to-[#0F1B2E] text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-container-highest">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#6CBF3D] text-[26px]">grid_view</span>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
              2D Solar Structure &amp; Panel Layout Studio
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#6CBF3D]/20 text-[#6CBF3D] border border-[#6CBF3D]/40 uppercase">
              Dynamic 2D Presets
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            पैनल संख्या के आधार पर सभी व्यावहारिक 2D स्ट्रक्चर माउंटिंग विकल्प (Pure Portrait, Pure Landscape, Hybrid Khadi+Aadi) और हार्डवेयर BOM लाइव देखें।
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

      {/* 2. Controls & Filter Bar */}
      <div className="p-4 sm:p-5 bg-surface-container-low border-b border-surface-container-high flex flex-col gap-4">
        {/* Row 1: Interactive Panel Count Controller */}
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
            <span className="text-xs font-semibold text-primary hidden sm:inline-block">
              ~{(panelCount * 0.55).toFixed(1)} kW System
            </span>
          </div>

          {/* Quick Preset Buttons */}
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

          {/* Module Specs Info Chip */}
          <div className="text-[11px] text-secondary flex items-center gap-1 bg-surface-container-high px-2.5 py-1 rounded-md">
            <span className="material-symbols-outlined text-[14px]">straighten</span>
            <span>Module Spec: <b>{moduleDims.lengthMm} × {moduleDims.widthMm} mm</b> (~2:1 Ratio)</span>
          </div>
        </div>

        {/* Row 2: Category Filter Tabs */}
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

          <div className="text-xs text-secondary font-medium">
            Showing <b className="text-on-surface">{filteredLayouts.length}</b> design combinations
          </div>
        </div>
      </div>

      {/* 3. Layout Cards Grid */}
      <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto bg-surface-container-lowest">
        {filteredLayouts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-secondary">
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
          filteredLayouts.map((layout, idx) => {
            const isSelected = selectedId === layout.id;
            const widthM = mmToMeters(layout.widthMm);
            const depthM = mmToMeters(layout.depthMm);
            const widthFt = mmToFeet(layout.widthMm);
            const depthFt = mmToFeet(layout.depthMm);
            const areaSqM = layout.areaSqM.toFixed(1);
            const areaSqFt = (layout.areaSqM * 10.7639).toFixed(0);

            return (
              <div
                key={layout.id}
                onClick={() => handleSelect(layout)}
                className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/30 shadow-md bg-white'
                    : 'border-surface-container-highest hover:border-primary/50 hover:shadow-md bg-white'
                }`}
              >
                {/* Card Header */}
                <div className="p-4 border-b border-surface-container-high bg-surface-container-lowest flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-on-surface">{layout.name}</span>
                      {layout.excelTag && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300">
                          {layout.excelTag}
                        </span>
                      )}
                      {layout.isRecommended && !layout.excelTag && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[11px]">star</span>
                          Popular
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-secondary mt-0.5 flex items-center gap-2">
                      <span className="font-semibold text-primary">{layout.category}</span>
                      <span>•</span>
                      <span>{layout.totalPanels} Modules</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-primary text-white' : 'border border-surface-container-highest text-transparent'
                    }`}>
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    </span>
                  </div>
                </div>

                {/* 2D Visual Architectural Drawing Area */}
                <div className="p-4 bg-[#F8FAFC] flex flex-col items-center justify-center min-h-[220px] relative border-b border-surface-container-high">
                  {/* Compass / True South Indicator */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded bg-white/90 border border-slate-200 text-[10px] font-bold text-slate-700 shadow-2xs">
                    <span className="material-symbols-outlined text-[14px] text-rose-500 animate-pulse">explore</span>
                    <span>🧭 South Tilt</span>
                  </div>

                  {/* Top Dimension Arrow (Width) */}
                  <div className="w-full flex items-center justify-center gap-1 text-[10px] font-bold text-slate-600 mb-1.5">
                    <span className="text-slate-400">◄</span>
                    <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
                      Width: {widthM}m ({widthFt} ft)
                    </span>
                    <span className="text-slate-400">►</span>
                  </div>

                  {/* 2D Solar Array SVG Rendering */}
                  <div className="w-full flex items-center justify-center py-2 px-1">
                    <Render2DArraySvg layout={layout} moduleDims={moduleDims} />
                  </div>

                  {/* Bottom / Side Dimension (Depth) */}
                  <div className="w-full flex items-center justify-center gap-1 text-[10px] font-bold text-slate-500 mt-1.5">
                    <span>Slope / Depth: <b>{depthM}m ({depthFt} ft)</b></span>
                    <span>•</span>
                    <span>Area: <b>{areaSqM} m² ({areaSqFt} sq.ft)</b></span>
                  </div>
                </div>

                {/* BOM Specs Grid */}
                <div className="p-3.5 bg-surface-container-lowest flex flex-col gap-2">
                  <div className="text-[11px] font-bold text-secondary uppercase tracking-wider flex items-center justify-between">
                    <span>Structural BOM Spec</span>
                    <span className="text-[10px] text-primary lowercase">~{layout.bom.estimatedSteelWeightKg} kg GI Steel</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-surface-container-low border border-surface-container-high">
                      <span className="block font-black text-on-surface text-sm text-[#0F1B2E]">
                        {layout.bom.jBoltsCount}
                      </span>
                      <span className="text-[10px] text-secondary font-semibold">J-Bolts</span>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-container-low border border-surface-container-high">
                      <span className="block font-black text-on-surface text-sm text-[#0F1B2E]">
                        {layout.bom.midClampsCount}
                      </span>
                      <span className="text-[10px] text-secondary font-semibold">Mid Clamps</span>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-container-low border border-surface-container-high">
                      <span className="block font-black text-on-surface text-sm text-[#0F1B2E]">
                        {layout.bom.endClampsCount}
                      </span>
                      <span className="text-[10px] text-secondary font-semibold">End Clamps</span>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-container-low border border-surface-container-high">
                      <span className="block font-black text-primary text-sm font-extrabold">
                        {layout.bom.totalLegs}
                      </span>
                      <span className="text-[10px] text-secondary font-semibold">Legs ({layout.bom.frontLegs}F+{layout.bom.rearLegs}R)</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(layout);
                    }}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1 ${
                      isSelected
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-surface-container-high text-on-surface hover:bg-primary hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isSelected ? 'check_circle' : 'touch_app'}
                    </span>
                    <span>{isSelected ? 'Selected for Proposal' : 'Select This Mounting Layout'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Footer Note */}
      <div className="p-3 bg-surface-container-low border-t border-surface-container-high flex flex-wrap items-center justify-between text-[11px] text-secondary">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[15px] text-primary">info</span>
          <span>
            <b>Standard Gujarat Tilt:</b> 15°–22° South Facing. All structural fasteners are computed for 150 km/h wind resilience.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1E3A8A]"></span>
            <span>Khadi (Portrait)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]"></span>
            <span>Aadi (Landscape)</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * High-detail 2D SVG Renderer for Solar Array
 * Draws realistic photovoltaic solar cells, silver aluminium frame, busbars, and panel labels
 */
function Render2DArraySvg({ layout, moduleDims }) {
  const { widthMm, depthMm, rows } = layout;

  // SVG viewport dimensions
  const svgWidth = 320;
  const svgHeight = 150;
  const padding = 12;

  // Scale factors to fit within SVG box
  const availableW = svgWidth - padding * 2;
  const availableH = svgHeight - padding * 2;
  const scale = Math.min(availableW / widthMm, availableH / depthMm);

  const arraySvgW = widthMm * scale;
  const arraySvgH = depthMm * scale;
  const startX = (svgWidth - arraySvgW) / 2;
  const startY = (svgHeight - arraySvgH) / 2;

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="max-w-full drop-shadow-xs overflow-visible"
    >
      <defs>
        {/* Photovoltaic Solar Cell Dark Navy Gradient */}
        <linearGradient id={`pvGrad_${layout.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0B192C" />
          <stop offset="50%" stopColor="#1E3E62" />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>

        {/* Landscape panel gradient */}
        <linearGradient id={`pvGradLand_${layout.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0369A1" />
          <stop offset="50%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#075985" />
        </linearGradient>
      </defs>

      {/* Structural Rafter / C-Channel Rail Rails (Background mounting purlins) */}
      <line
        x1={startX - 4}
        y1={startY + arraySvgH * 0.25}
        x2={startX + arraySvgW + 4}
        y2={startY + arraySvgH * 0.25}
        stroke="#94A3B8"
        strokeWidth="2.5"
        strokeDasharray="4 2"
      />
      <line
        x1={startX - 4}
        y1={startY + arraySvgH * 0.75}
        x2={startX + arraySvgW + 4}
        y2={startY + arraySvgH * 0.75}
        stroke="#94A3B8"
        strokeWidth="2.5"
        strokeDasharray="4 2"
      />

      {/* Rows and Panels */}
      {(() => {
        let currentY = startY;
        return rows.map((row, rIdx) => {
          const rowPanels = Array.isArray(row) ? row : [];
          if (rowPanels.length === 0) return null;

          const firstPanel = rowPanels[0];
          const rowH = firstPanel.heightMm * scale;
          const totalRowW = rowPanels.reduce((acc, p) => acc + (p.widthMm * scale), 0);
          let currentX = startX + ((arraySvgW - totalRowW) / 2); // Center row if row widths differ

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
                  fill="#CBD5E1"
                  stroke="#64748B"
                  strokeWidth="1"
                  rx="1.5"
                />

                {/* Blue Photovoltaic Glass Surface */}
                <rect
                  x={px + 1}
                  y={py + 1}
                  width={Math.max(1, pw - 2)}
                  height={Math.max(1, ph - 2)}
                  fill={isLandscape ? `url(#pvGradLand_${layout.id})` : `url(#pvGrad_${layout.id})`}
                  rx="1"
                />

                {/* Subtle Solar Cell Busbars (Grid lines) */}
                <line
                  x1={px + pw * 0.33}
                  y1={py + 1}
                  x2={px + pw * 0.33}
                  y2={py + ph - 1}
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="0.5"
                />
                <line
                  x1={px + pw * 0.66}
                  y1={py + 1}
                  x2={px + pw * 0.66}
                  y2={py + ph - 1}
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="0.5"
                />
                <line
                  x1={px + 1}
                  y1={py + ph * 0.5}
                  x2={px + pw - 1}
                  y2={py + ph * 0.5}
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="0.5"
                />

                {/* Panel Number Label */}
                {pw >= 16 && ph >= 16 && (
                  <text
                    x={px + pw / 2}
                    y={py + ph / 2 + 3}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize={Math.max(7, Math.min(10, pw / 3.5))}
                    fontWeight="bold"
                    filter="drop-shadow(0 1px 1px rgba(0,0,0,0.8))"
                  >
                    {panel.label || `P${pIdx + 1}`}
                  </text>
                )}

                {/* Corner J-Bolt & Clamp Indicators */}
                <circle cx={px + 2} cy={py + 2} r="1" fill="#22C55E" />
                <circle cx={px + pw - 2} cy={py + 2} r="1" fill="#22C55E" />
                <circle cx={px + 2} cy={py + ph - 2} r="1" fill="#22C55E" />
                <circle cx={px + pw - 2} cy={py + ph - 2} r="1" fill="#22C55E" />
              </g>
            );
          });

          currentY += rowH;
          return <g key={`row_${rIdx}`}>{rowElements}</g>;
        });
      })()}

      {/* Structure Legs (Front & Rear leg base indicators) */}
      {(() => {
        const legCount = layout.bom.frontLegs;
        const legStep = arraySvgW / (legCount - 1);
        const legs = [];
        for (let i = 0; i < legCount; i++) {
          const lx = startX + (i * legStep);
          legs.push(
            <g key={`leg_${i}`}>
              {/* Rear Leg Indicator */}
              <circle cx={lx} cy={startY + 2} r="2.5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="0.8" />
              {/* Front Leg Indicator */}
              <circle cx={lx} cy={startY + arraySvgH - 2} r="2.5" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="0.8" />
            </g>
          );
        }
        return legs;
      })()}
    </svg>
  );
}
