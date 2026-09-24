import React, { useState, useMemo, useRef } from 'react';

/**
 * Default Roof Presets
 */
export const DEFAULT_ROOF_CONFIG = {
  type: 'rectangle', // 'rectangle', 'l_shape', 'custom_polygon'
  widthFt: 36,
  depthFt: 26,
  parapetHeightFt: 3.0,
  parapetThicknessInches: 9, // 9-inch standard brick parapet
  // For L-Shape Roof
  lCutoutWidthFt: 14,
  lCutoutDepthFt: 12,
  lCutoutCorner: 'ne', // 'ne', 'nw', 'se', 'sw'
  // For Custom Polygon (Vertices in relative ft from center)
  customVertices: [
    { x: -18, z: -13 },
    { x: 18, z: -13 },
    { x: 18, z: 13 },
    { x: -18, z: 13 }
  ],
  uploadedImage: null
};

/**
 * Computes polygon 2D vertices (in feet) for any roof config
 */
export function getRoofPolygonVertices(roof) {
  const w = parseFloat(roof.widthFt) || 36;
  const d = parseFloat(roof.depthFt) || 26;
  const halfW = w / 2;
  const halfD = d / 2;

  if (roof.type === 'l_shape') {
    const cw = Math.min(w - 6, parseFloat(roof.lCutoutWidthFt) || 12);
    const cd = Math.min(d - 6, parseFloat(roof.lCutoutDepthFt) || 10);
    // L-shape with cutout in North-East corner (top-right)
    return [
      { x: -halfW, z: -halfD, label: 'NW' }, // Top-Left
      { x: halfW - cw, z: -halfD, label: 'N-Cut' },
      { x: halfW - cw, z: -halfD + cd, label: 'Inner-Corner' },
      { x: halfW, z: -halfD + cd, label: 'E-Cut' },
      { x: halfW, z: halfD, label: 'SE' }, // Bottom-Right
      { x: -halfW, z: halfD, label: 'SW' }  // Bottom-Left
    ];
  }

  if (roof.type === 'custom_polygon' && roof.customVertices && roof.customVertices.length >= 3) {
    return roof.customVertices;
  }

  // Standard Rectangle
  return [
    { x: -halfW, z: -halfD, label: 'NW Corner' },
    { x: halfW, z: -halfD, label: 'NE Corner' },
    { x: halfW, z: halfD, label: 'SE Corner' },
    { x: -halfW, z: halfD, label: 'SW Corner' }
  ];
}

/**
 * Computes side lengths (walls) for a polygon
 */
export function getRoofWalls(vertices) {
  const walls = [];
  const n = vertices.length;
  for (let i = 0; i < n; i++) {
    const p1 = vertices[i];
    const p2 = vertices[(i + 1) % n];
    const dx = p2.x - p1.x;
    const dz = p2.z - p1.z;
    const lengthFt = Number(Math.sqrt(dx * dx + dz * dz).toFixed(1));
    walls.push({
      index: i + 1,
      name: `Side ${i + 1} (${p1.label || `P${i + 1}`} → ${p2.label || `P${((i + 1) % n) + 1}`})`,
      lengthFt,
      p1,
      p2
    });
  }
  return walls;
}

export default function RooftopDesigner({
  roofConfig = DEFAULT_ROOF_CONFIG,
  onSaveRoofConfig = null,
  onOpen3D = null
}) {
  const [config, setConfig] = useState(roofConfig || DEFAULT_ROOF_CONFIG);
  const [activeTab, setActiveTab] = useState(config.type === 'custom_polygon' ? 'manual' : (config.type === 'l_shape' ? 'presets' : 'presets'));
  const [uploadPreview, setUploadPreview] = useState(config.uploadedImage || null);
  const [selectedWallIndex, setSelectedWallIndex] = useState(null);
  const fileInputRef = useRef(null);

  // Compute vertices and walls
  const vertices = useMemo(() => getRoofPolygonVertices(config), [config]);
  const walls = useMemo(() => getRoofWalls(vertices), [vertices]);
  const totalPerimeterFt = useMemo(() => walls.reduce((acc, w) => acc + w.lengthFt, 0).toFixed(1), [walls]);
  const estimatedAreaSqFt = useMemo(() => {
    // Shoelace formula for polygon area
    let area = 0;
    for (let i = 0; i < vertices.length; i++) {
      const j = (i + 1) % vertices.length;
      area += vertices[i].x * vertices[j].z;
      area -= vertices[j].x * vertices[i].z;
    }
    return Math.abs(area / 2).toFixed(0);
  }, [vertices]);

  const handleUpdateParam = (key, value) => {
    const updated = { ...config, [key]: value };
    setConfig(updated);
    if (onSaveRoofConfig) onSaveRoofConfig(updated);
  };

  const handleSetShape = (type) => {
    const updated = { ...config, type };
    if (type === 'rectangle') {
      updated.widthFt = 36;
      updated.depthFt = 26;
    } else if (type === 'l_shape') {
      updated.widthFt = 38;
      updated.depthFt = 28;
      updated.lCutoutWidthFt = 14;
      updated.lCutoutDepthFt = 12;
    }
    setConfig(updated);
    if (onSaveRoofConfig) onSaveRoofConfig(updated);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        setUploadPreview(dataUrl);
        const updated = { ...config, uploadedImage: dataUrl };
        setConfig(updated);
        if (onSaveRoofConfig) onSaveRoofConfig(updated);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col w-full bg-slate-950 text-white rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Top Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0F1B2E] via-[#1E293B] to-[#0F1B2E] border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#6CBF3D] text-[26px]">roofing</span>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
              House Rooftop &amp; Terrace Boundary Designer
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#6CBF3D]/20 text-[#6CBF3D] border border-[#6CBF3D]/40 uppercase">
              2D CAD + 3D Sync
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            छत का आकार चुनें, प्रत्येक दीवार की लंबाई (feet) भरें या छत का फ़ोटो/नक्शा अपलोड करें। सिस्टम हूबहू 3D मॉडल बनाएगा।
          </p>
        </div>

        {onOpen3D && (
          <button
            type="button"
            onClick={onOpen3D}
            className="px-4 py-2 rounded-xl bg-[#6CBF3D] hover:bg-[#5ca633] text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer self-start md:self-auto shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">view_in_ar</span>
            <span>View Rooftop in 3D</span>
          </button>
        )}
      </div>

      {/* Mode Navigation Tabs */}
      <div className="px-4 sm:px-6 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'presets' ? 'bg-[#6CBF3D] text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">shapes</span>
            <span>1. Quick Roof Presets (आयत / L-Shape)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'manual' ? 'bg-[#6CBF3D] text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">straighten</span>
            <span>2. Manual Sides &amp; Measurements (दीवार माप)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'upload' ? 'bg-[#6CBF3D] text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">add_photo_alternate</span>
            <span>3. Upload Roof Photo / Sketch (फ़ोटो अपलोड)</span>
          </button>
        </div>

        {/* Live Metrics Badge */}
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400">
            Usable Terrace Area: <b className="text-white font-mono">{estimatedAreaSqFt} sq.ft</b>
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">
            Perimeter: <b className="text-[#6CBF3D] font-mono">{totalPerimeterFt} ft</b> ({walls.length} Walls)
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Shape Controls / Side Measurements (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* TAB 1: Roof Preset Shapes */}
          {activeTab === 'presets' && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select Common Terrace Geometry:
              </span>

              {/* Preset Cards */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSetShape('rectangle')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer text-left ${
                    config.type === 'rectangle'
                      ? 'bg-primary/20 border-primary ring-1 ring-primary text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-[28px] text-[#6CBF3D]">rectangle</span>
                  <div className="text-center">
                    <span className="text-xs font-bold block">Standard Rectangular</span>
                    <span className="text-[10px] text-slate-400">4 Walls (चौकोर / आयताकार)</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSetShape('l_shape')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer text-left ${
                    config.type === 'l_shape'
                      ? 'bg-primary/20 border-primary ring-1 ring-primary text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-[28px] text-blue-400">polyline</span>
                  <div className="text-center">
                    <span className="text-xs font-bold block">L-Shaped Terrace</span>
                    <span className="text-[10px] text-slate-400">6 Walls (सीढ़ी / कट-आउट)</span>
                  </div>
                </button>
              </div>

              {/* Dimension Inputs for Rectangle */}
              {config.type === 'rectangle' && (
                <div className="flex flex-col gap-3 pt-3 border-t border-slate-800">
                  <span className="text-xs font-bold text-white">Terrace Boundary Dimensions (feet):</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-slate-400 font-semibold">Width (East-West)</label>
                      <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                        <input
                          type="number"
                          min="15"
                          max="120"
                          value={config.widthFt}
                          onChange={(e) => handleUpdateParam('widthFt', parseFloat(e.target.value) || 30)}
                          className="w-full bg-transparent font-black text-sm text-[#6CBF3D] outline-none"
                        />
                        <span className="text-xs text-slate-500 font-bold">ft</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-slate-400 font-semibold">Depth (North-South)</label>
                      <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                        <input
                          type="number"
                          min="15"
                          max="100"
                          value={config.depthFt}
                          onChange={(e) => handleUpdateParam('depthFt', parseFloat(e.target.value) || 24)}
                          className="w-full bg-transparent font-black text-sm text-[#6CBF3D] outline-none"
                        />
                        <span className="text-xs text-slate-500 font-bold">ft</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dimension Inputs for L-Shape */}
              {config.type === 'l_shape' && (
                <div className="flex flex-col gap-3 pt-3 border-t border-slate-800">
                  <span className="text-xs font-bold text-white">L-Shape Boundary &amp; Cutout (feet):</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-slate-400 font-semibold">Total Width (W)</label>
                      <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                        <input
                          type="number"
                          min="20"
                          max="150"
                          value={config.widthFt}
                          onChange={(e) => handleUpdateParam('widthFt', parseFloat(e.target.value) || 38)}
                          className="w-full bg-transparent font-black text-sm text-blue-400 outline-none"
                        />
                        <span className="text-xs text-slate-500 font-bold">ft</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-slate-400 font-semibold">Total Depth (D)</label>
                      <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                        <input
                          type="number"
                          min="20"
                          max="120"
                          value={config.depthFt}
                          onChange={(e) => handleUpdateParam('depthFt', parseFloat(e.target.value) || 28)}
                          className="w-full bg-transparent font-black text-sm text-blue-400 outline-none"
                        />
                        <span className="text-xs text-slate-500 font-bold">ft</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-slate-400 font-semibold">Cutout Width (CW)</label>
                      <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                        <input
                          type="number"
                          min="4"
                          max={config.widthFt - 6}
                          value={config.lCutoutWidthFt}
                          onChange={(e) => handleUpdateParam('lCutoutWidthFt', parseFloat(e.target.value) || 12)}
                          className="w-full bg-transparent font-black text-sm text-amber-400 outline-none"
                        />
                        <span className="text-xs text-slate-500 font-bold">ft</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-slate-400 font-semibold">Cutout Depth (CD)</label>
                      <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                        <input
                          type="number"
                          min="4"
                          max={config.depthFt - 6}
                          value={config.lCutoutDepthFt}
                          onChange={(e) => handleUpdateParam('lCutoutDepthFt', parseFloat(e.target.value) || 10)}
                          className="w-full bg-transparent font-black text-sm text-amber-400 outline-none"
                        />
                        <span className="text-xs text-slate-500 font-bold">ft</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Manual Sides & Measurements List */}
          {activeTab === 'manual' && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Wall-by-Wall Measurements (दीवार माप):</span>
                <span className="text-[10px] text-slate-400">Total {walls.length} Sides</span>
              </div>

              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                {walls.map((wall, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedWallIndex(idx)}
                    className={`p-2.5 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                      selectedWallIndex === idx
                        ? 'bg-primary/20 border-primary ring-1 ring-primary/40'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-black flex items-center justify-center">
                        {wall.index}
                      </span>
                      <span className="text-xs font-bold text-slate-200">{wall.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="5"
                        max="150"
                        step="0.5"
                        value={wall.lengthFt}
                        onChange={(e) => {
                          const newLen = parseFloat(e.target.value) || 10;
                          // If rectangle, adjust width or depth
                          if (config.type === 'rectangle') {
                            if (idx === 0 || idx === 2) handleUpdateParam('widthFt', newLen);
                            else handleUpdateParam('depthFt', newLen);
                          }
                        }}
                        className="w-16 h-7 text-right px-2 rounded bg-slate-900 border border-slate-700 font-mono font-bold text-xs text-[#6CBF3D] outline-none"
                      />
                      <span className="text-[11px] text-slate-500 font-bold">ft</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Upload Photo / Sketch */}
          {activeTab === 'upload' && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
              <span className="text-xs font-bold text-white">Upload Rooftop Photo / Blueprint / Google Earth:</span>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-[#6CBF3D] rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-slate-950"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <span className="material-symbols-outlined text-4xl text-[#6CBF3D] mb-2">upload_file</span>
                <span className="text-xs font-bold text-slate-200">Click to select photo or sketch</span>
                <span className="text-[10px] text-slate-400 mt-1">Supports JPG, PNG, WebP (Rooftop top-view, mobile photo, or site plan)</span>
              </div>

              {uploadPreview && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <img src={uploadPreview} alt="Roof preview" className="w-10 h-10 object-cover rounded-md border border-slate-700" />
                    <div>
                      <span className="text-xs font-bold text-white block">Roof Photo Loaded</span>
                      <span className="text-[10px] text-emerald-400">Ready to trace &amp; calibrate</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadPreview(null);
                      handleUpdateParam('uploadedImage', null);
                    }}
                    className="text-xs text-rose-400 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Parapet Wall Height Controller */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-amber-400">fence</span>
                Parapet Wall Height (मुंडेर / रेलिंग की ऊंचाई):
              </span>
              <span className="text-xs font-black text-amber-400 font-mono">
                {config.parapetHeightFt} ft
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="5.0"
                step="0.5"
                value={config.parapetHeightFt}
                onChange={(e) => handleUpdateParam('parapetHeightFt', parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>0 ft (No Wall)</span>
              <span>2.5 ft (Low)</span>
              <span>3.0 ft (Standard)</span>
              <span>4.5 ft (High Wall)</span>
            </div>
          </div>
        </div>

        {/* Right Column: 2D Architectural Blueprint Canvas with Measurement Dimensions (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#6CBF3D] text-[18px]">architecture</span>
              <span className="font-bold text-white">2D Architectural Terrace Blueprint View</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 font-mono text-[11px] border border-slate-800">
                🧭 South Facing Bottom
              </span>
            </div>
          </div>

          {/* 2D SVG Blueprint Drawing */}
          <div className="w-full flex-1 min-h-[360px] flex items-center justify-center bg-[#070D18] rounded-xl border border-slate-800/80 p-4 relative overflow-hidden">
            {/* Grid Pattern */}
            <svg width="100%" height="100%" className="absolute inset-0 opacity-15">
              <defs>
                <pattern id="blueprintGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#60A5FA" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#blueprintGrid)" />
            </svg>

            {/* Optional Uploaded Image Background */}
            {uploadPreview && (
              <img
                src={uploadPreview}
                alt="Background roof"
                className="absolute inset-4 w-[calc(100%-32px)] h-[calc(100%-32px)] object-contain opacity-35 pointer-events-none rounded-lg"
              />
            )}

            {/* Architectural Polygon SVG */}
            <RenderRoofBlueprintSvg
              vertices={vertices}
              walls={walls}
              selectedWallIndex={selectedWallIndex}
              onSelectWall={setSelectedWallIndex}
            />
          </div>

          {/* Bottom helper text */}
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Click any wall in the blueprint or list to adjust its length.</span>
            <span className="text-[#6CBF3D] font-bold">Changes reflect instantly in 3D Model</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 2D SVG Architectural Blueprint of Rooftop with Dimension Lines
 */
function RenderRoofBlueprintSvg({ vertices, walls, selectedWallIndex, onSelectWall }) {
  const svgWidth = 460;
  const svgHeight = 320;
  const padding = 45;

  // Calculate bounding box of vertices
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  vertices.forEach(v => {
    if (v.x < minX) minX = v.x;
    if (v.x > maxX) maxX = v.x;
    if (v.z < minZ) minZ = v.z;
    if (v.z > maxZ) maxZ = v.z;
  });

  const spanX = maxX - minX || 1;
  const spanZ = maxZ - minZ || 1;

  const scale = Math.min((svgWidth - padding * 2) / spanX, (svgHeight - padding * 2) / spanZ);

  // Convert (x, z) in feet to SVG (sx, sy)
  const toSvgX = (x) => svgWidth / 2 + x * scale;
  const toSvgY = (z) => svgHeight / 2 + z * scale;

  // Polygon path
  const polyPoints = vertices.map(v => `${toSvgX(v.x)},${toSvgY(v.z)}`).join(' ');

  return (
    <svg
      width="100%"
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="max-w-full drop-shadow-md overflow-visible relative z-10"
    >
      <defs>
        {/* Concrete Rooftop Hatch */}
        <pattern id="concreteHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#1E293B" strokeWidth="1" />
        </pattern>
      </defs>

      {/* Concrete Terrace Slab Polygon */}
      <polygon
        points={polyPoints}
        fill="#0F172A"
        stroke="#334155"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <polygon
        points={polyPoints}
        fill="url(#concreteHatch)"
        opacity="0.4"
      />

      {/* Outer Parapet Wall Line */}
      <polygon
        points={polyPoints}
        fill="none"
        stroke="#38BDF8"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Wall Segments and Dimension Labels */}
      {walls.map((wall, idx) => {
        const x1 = toSvgX(wall.p1.x);
        const y1 = toSvgY(wall.p1.z);
        const x2 = toSvgX(wall.p2.x);
        const y2 = toSvgY(wall.p2.z);

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        const isSelected = selectedWallIndex === idx;

        return (
          <g key={idx} onClick={() => onSelectWall && onSelectWall(idx)} className="cursor-pointer">
            {/* Highlight line on hover / select */}
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isSelected ? '#6CBF3D' : 'transparent'}
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* Corner Node */}
            <circle
              cx={x1}
              cy={y1}
              r="4"
              fill={isSelected ? '#6CBF3D' : '#38BDF8'}
              stroke="#0F172A"
              strokeWidth="1.5"
            />

            {/* Wall Dimension Badge */}
            <g transform={`translate(${midX}, ${midY})`}>
              <rect
                x="-24"
                y="-10"
                width="48"
                height="20"
                rx="5"
                fill={isSelected ? '#6CBF3D' : '#1E293B'}
                stroke={isSelected ? '#FFFFFF' : '#475569'}
                strokeWidth="1"
                className="transition-colors"
              />
              <text
                x="0"
                y="4"
                textAnchor="middle"
                fill={isSelected ? '#0F172A' : '#FFFFFF'}
                fontSize="10"
                fontWeight="900"
                fontFamily="monospace"
              >
                {wall.lengthFt}'
              </text>
            </g>
          </g>
        );
      })}

      {/* South Compass Indicator on Canvas */}
      <g transform={`translate(${svgWidth - 40}, ${svgHeight - 30})`}>
        <circle cx="0" cy="0" r="16" fill="#1E293B" stroke="#475569" strokeWidth="1" />
        <path d="M 0 -11 L 4 0 L 0 -3 L -4 0 Z" fill="#EF4444" />
        <path d="M 0 11 L 4 0 L 0 3 L -4 0 Z" fill="#94A3B8" />
        <text x="0" y="8" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">S</text>
      </g>
    </svg>
  );
}
