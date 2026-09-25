import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Interactive Image Roof Tracer with Automatic Line Straightening (Smart CAD Doodle)
 * 
 * Features:
 * 1. Freehand Draw with Auto-Straighten: Draw any slightly wavy or tilted line with mouse/finger,
 *    and on release it automatically snaps into a crisp, perfectly straight 90° horizontal or vertical CAD line!
 * 2. Connect-the-dots snapping: Snaps start/end points to previous corners and automatically closes the polygon.
 * 3. Corner Pin Dragging: Move any corner pin with mouse/touch to fine-tune alignment on the photo.
 * 4. Inline Measurement Badges: Click any wall badge directly on the photo to enter or edit feet length.
 * 5. Instant 2D & 3D Synchronization: One click generates the final CAD Blueprint and 3D model!
 */
export default function InteractiveImageRoofTracer({
  imageUrl,
  initialCorners = [],
  initialWalls = [],
  onApplyGeometry,
  onClose
}) {
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const canvasRef = useRef(null);

  // Corner pins stored as percentages (0 to 100) of image width/height
  const [pins, setPins] = useState(() => {
    if (initialCorners && initialCorners.length >= 3) {
      return initialCorners.map((c, i) => ({
        id: `pin_${i + 1}`,
        xPct: Math.max(2, Math.min(98, c.x_pct || c.xPct || 50)),
        yPct: Math.max(2, Math.min(98, c.y_pct || c.yPct || 50)),
        label: c.label || `P${i + 1}`,
        lengthFt: initialWalls[i]?.lengthFt || initialWalls[i]?.length_ft || 10
      }));
    }
    return [];
  });

  const [activePinIndex, setActivePinIndex] = useState(null);
  const [draggingPinIndex, setDraggingPinIndex] = useState(null);
  const [drawMode, setDrawMode] = useState('freehand'); // 'freehand' (draw lines that auto-straighten), 'pin_drag' (adjust pins)
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState([]); // Temporary points during mouse drag
  const [editingWallIndex, setEditingWallIndex] = useState(null);
  const [tempLengthInput, setTempLengthInput] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isLoopClosed, setIsLoopClosed] = useState(false);

  // Sync initialCorners when AI finishes
  useEffect(() => {
    if (initialCorners && initialCorners.length >= 3) {
      setPins(
        initialCorners.map((c, i) => ({
          id: `pin_${i + 1}`,
          xPct: Math.max(2, Math.min(98, c.x_pct || c.xPct || 50)),
          yPct: Math.max(2, Math.min(98, c.y_pct || c.yPct || 50)),
          label: c.label || `P${i + 1}`,
          lengthFt: initialWalls[i]?.lengthFt || initialWalls[i]?.length_ft || 10
        }))
      );
      setIsLoopClosed(true);
    }
  }, [initialCorners, initialWalls]);

  // Convert client (X, Y) to percentage of image
  const getCoordinatesFromEvent = e => {
    const img = imageRef.current;
    if (!img) return null;

    const rect = img.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const posX = clientX - rect.left;
    const posY = clientY - rect.top;

    const xPct = Math.max(1, Math.min(99, (posX / rect.width) * 100));
    const yPct = Math.max(1, Math.min(99, (posY / rect.height) * 100));

    return { xPct, yPct, pixelX: posX, pixelY: posY };
  };

  // 1. FREEHAND DRAW WITH AUTOMATIC STRAIGHTENING
  const handleMouseDown = e => {
    if (drawMode !== 'freehand') return;
    if (e.target.closest('.pin-element') || e.target.closest('.wall-badge')) return;

    const coords = getCoordinatesFromEvent(e);
    if (!coords) return;

    setIsDrawing(true);
    setCurrentStroke([coords]);
  };

  const handleMouseMove = e => {
    if (isDrawing && drawMode === 'freehand') {
      const coords = getCoordinatesFromEvent(e);
      if (coords) {
        setCurrentStroke(prev => [...prev, coords]);
      }
    } else if (draggingPinIndex !== null) {
      // Pin dragging
      const coords = getCoordinatesFromEvent(e);
      if (coords) {
        setPins(prev => {
          const next = [...prev];
          next[draggingPinIndex] = {
            ...next[draggingPinIndex],
            xPct: Number(coords.xPct.toFixed(1)),
            yPct: Number(coords.yPct.toFixed(1))
          };
          return next;
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (draggingPinIndex !== null) {
      setDraggingPinIndex(null);
    }

    if (isDrawing && drawMode === 'freehand') {
      setIsDrawing(false);

      if (currentStroke.length < 2) {
        setCurrentStroke([]);
        return;
      }

      const startPt = currentStroke[0];
      const endPt = currentStroke[currentStroke.length - 1];

      // Auto-Straighten: Determine dominant direction (Horizontal or Vertical)
      const dx = endPt.xPct - startPt.xPct;
      const dy = endPt.yPct - startPt.yPct;
      const isHorizontal = Math.abs(dx) >= Math.abs(dy);

      // Snap start point to the previous pin if close (within 6% distance)
      let effectiveStart = { xPct: startPt.xPct, yPct: startPt.yPct };
      if (pins.length > 0) {
        const lastPin = pins[pins.length - 1];
        const distToLast = Math.hypot(startPt.xPct - lastPin.xPct, startPt.yPct - lastPin.yPct);
        if (distToLast < 10 || pins.length > 0) {
          // Snap start directly to last corner
          effectiveStart = { xPct: lastPin.xPct, yPct: lastPin.yPct };
        }
      }

      // Straighten the end point (auto 90-degree orthogonal line)
      let straightEnd = {
        xPct: isHorizontal ? endPt.xPct : effectiveStart.xPct,
        yPct: isHorizontal ? effectiveStart.yPct : endPt.yPct
      };

      // Check if end is close to first pin -> Close the loop!
      if (pins.length >= 2) {
        const firstPin = pins[0];
        const distToFirst = Math.hypot(straightEnd.xPct - firstPin.xPct, straightEnd.yPct - firstPin.yPct);
        if (distToFirst < 8) {
          setIsLoopClosed(true);
          setCurrentStroke([]);
          return;
        }
      }

      // If this is the very first line, add both start and end pins
      if (pins.length === 0) {
        const p1 = {
          id: `pin_1`,
          xPct: Number(effectiveStart.xPct.toFixed(1)),
          yPct: Number(effectiveStart.yPct.toFixed(1)),
          label: 'P1',
          lengthFt: 30
        };
        const p2 = {
          id: `pin_2`,
          xPct: Number(straightEnd.xPct.toFixed(1)),
          yPct: Number(straightEnd.yPct.toFixed(1)),
          label: 'P2',
          lengthFt: 10
        };
        setPins([p1, p2]);
      } else {
        // Add straight end point as next pin
        const newPin = {
          id: `pin_${pins.length + 1}`,
          xPct: Number(straightEnd.xPct.toFixed(1)),
          yPct: Number(straightEnd.yPct.toFixed(1)),
          label: `P${pins.length + 1}`,
          lengthFt: 10
        };
        setPins(prev => [...prev, newPin]);
      }

      setCurrentStroke([]);
    }
  };

  // Dragging existing pin
  const handleMouseDownPin = (e, index) => {
    e.stopPropagation();
    setDraggingPinIndex(index);
    setActivePinIndex(index);
  };

  // Undo last drawn wall
  const handleUndo = () => {
    if (pins.length === 0) return;
    setPins(prev => prev.slice(0, prev.length - 1));
    setIsLoopClosed(false);
  };

  // Clear all pins to start fresh
  const handleClearAll = () => {
    setPins([]);
    setIsLoopClosed(false);
    setActivePinIndex(null);
  };

  // Snap all current lines to strict 90-degree orthogonal CAD
  const handleSnapAllOrthogonal = () => {
    if (pins.length < 3) return;
    const snapped = [...pins];

    for (let i = 0; i < snapped.length - 1; i++) {
      const p1 = snapped[i];
      const p2 = snapped[i + 1];
      const dx = Math.abs(p2.xPct - p1.xPct);
      const dy = Math.abs(p2.yPct - p1.yPct);

      if (dx >= dy) {
        snapped[i + 1] = { ...p2, yPct: p1.yPct }; // Straight horizontal
      } else {
        snapped[i + 1] = { ...p2, xPct: p1.xPct }; // Straight vertical
      }
    }

    setPins(snapped);
  };

  // Final confirmation: Convert to CAD Polygon and pass to 2D & 3D viewers
  const handleApply = () => {
    if (pins.length < 3) {
      alert('Please trace at least 3 walls to form a closed roof polygon.');
      return;
    }

    const n = pins.length;
    const walls = [];

    for (let i = 0; i < n; i++) {
      const p1 = pins[i];
      const p2 = pins[(i + 1) % n];
      const dx = p2.xPct - p1.xPct;
      const dy = p2.yPct - p1.yPct;

      let dir = 'E';
      if (Math.abs(dx) >= Math.abs(dy)) {
        dir = dx >= 0 ? 'E' : 'W';
      } else {
        dir = dy >= 0 ? 'S' : 'N';
      }

      walls.push({
        side: i + 1,
        name: `Wall ${i + 1} (${p1.label || `P${i + 1}`} → ${p2.label || `P${((i + 1) % n) + 1}`})`,
        lengthFt: parseFloat(p1.lengthFt) || 10,
        direction: dir
      });
    }

    // Mathematical closed vector accumulation
    let currX = 0;
    let currZ = 0;
    const rawVertices = [{ x: 0, z: 0, label: pins[0].label || 'Corner 1' }];

    for (let i = 0; i < walls.length - 1; i++) {
      const w = walls[i];
      const len = w.lengthFt;
      if (w.direction === 'E') currX += len;
      else if (w.direction === 'W') currX -= len;
      else if (w.direction === 'S') currZ += len;
      else if (w.direction === 'N') currZ -= len;

      rawVertices.push({
        x: Number(currX.toFixed(1)),
        z: Number(currZ.toFixed(1)),
        label: pins[i + 1]?.label || `Corner ${i + 2}`
      });
    }

    // Center coordinates around (0, 0)
    const xs = rawVertices.map(v => v.x);
    const zs = rawVertices.map(v => v.z);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minZ = Math.min(...zs);
    const maxZ = Math.max(...zs);
    const midX = (minX + maxX) / 2;
    const midZ = (minZ + maxZ) / 2;

    const customVertices = rawVertices.map(v => ({
      x: Number((v.x - midX).toFixed(1)),
      z: Number((v.z - midZ).toFixed(1)),
      label: v.label
    }));

    const widthFt = Math.max(10, Math.round(maxX - minX));
    const depthFt = Math.max(10, Math.round(maxZ - minZ));

    onApplyGeometry({
      customVertices,
      walls,
      corners: pins.map((p, i) => ({
        corner_number: i + 1,
        x_pct: p.xPct,
        y_pct: p.yPct,
        label: p.label
      })),
      widthFt,
      depthFt
    });
  };

  return (
    <div className="flex flex-col w-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Toolbar */}
      <div className="p-3 sm:p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#6CBF3D] text-[24px]">gesture</span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-white">Smart Image Drawing &amp; Auto-Straighten</h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#6CBF3D]/20 text-[#6CBF3D] border border-[#6CBF3D]/40">
                ✨ Auto-Straight Line Snapping Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              माउस या उंगली से फ़ोटो पर टेढ़ी-मेढ़ी लाइन खींचें—छोड़ते ही लाइन अपने-आप <b>बिल्कुल सीधी (Straight 90°)</b> हो जाएगी!
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tool Modes */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setDrawMode('freehand')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                drawMode === 'freehand' ? 'bg-[#6CBF3D] text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              <span>1. Draw Wavy $\rightarrow$ Auto-Straight</span>
            </button>

            <button
              type="button"
              onClick={() => setDrawMode('pin_drag')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                drawMode === 'pin_drag' ? 'bg-[#6CBF3D] text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">pan_tool</span>
              <span>2. Move / Drag Corners</span>
            </button>
          </div>

          {/* Undo Button */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={pins.length === 0}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-bold text-xs flex items-center gap-1 cursor-pointer"
            title="Undo last wall"
          >
            <span className="material-symbols-outlined text-[16px]">undo</span>
            <span>Undo</span>
          </button>

          {/* Snap 90° button */}
          <button
            type="button"
            onClick={handleSnapAllOrthogonal}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1 border border-slate-700 cursor-pointer"
            title="Square all walls to perfect 90° right angles"
          >
            <span className="material-symbols-outlined text-[16px] text-amber-400">square_foot</span>
            <span>Snap 90°</span>
          </button>

          {/* Clear button */}
          <button
            type="button"
            onClick={handleClearAll}
            className="px-2.5 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
            <span>Reset</span>
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.15))}
              className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white cursor-pointer font-black"
            >
              -
            </button>
            <span className="text-[10px] font-mono text-slate-300 w-8 text-center">{Math.round(zoomLevel * 100)}%</span>
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.min(2.0, prev + 0.15))}
              className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white cursor-pointer font-black"
            >
              +
            </button>
          </div>

          {/* Confirm & Apply to 3D */}
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6CBF3D] to-emerald-500 hover:brightness-110 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg cursor-pointer ml-auto"
          >
            <span className="material-symbols-outlined text-[18px]">view_in_ar</span>
            <span>Generate 2D &amp; 3D Model</span>
          </button>
        </div>
      </div>

      {/* Main Drawing Viewport */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        className="w-full relative min-h-[480px] max-h-[680px] overflow-auto flex items-center justify-center bg-[#070D18] p-4 select-none cursor-crosshair"
      >
        <div
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
          className="relative inline-block transition-transform duration-100"
        >
          {/* Base Sketch Photo */}
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Uploaded Rooftop Sketch"
            className="max-h-[550px] max-w-[90vw] object-contain rounded-xl shadow-2xl pointer-events-none border border-slate-700 block"
          />

          {/* Real-time Wavy Stroke Preview while dragging mouse */}
          {isDrawing && currentStroke.length > 1 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-30">
              <polyline
                points={currentStroke.map(p => `${p.xPct}%,${p.yPct}%`).join(' ')}
                fill="none"
                stroke="#F59E0B"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="4 2"
              />
            </svg>
          )}

          {/* Auto-Straightened SVG Lines & Polygon Fill */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-10">
            {/* Shaded Closed Polygon */}
            {pins.length >= 3 && (
              <polygon
                points={pins.map(p => `${p.xPct}%,${p.yPct}%`).join(' ')}
                fill="rgba(108, 191, 61, 0.22)"
                stroke="#6CBF3D"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
            )}

            {/* Straightened Connecting Wall Lines */}
            {pins.map((p1, idx) => {
              if (!isLoopClosed && idx === pins.length - 1 && pins.length > 1) return null;
              const p2 = pins[(idx + 1) % pins.length];
              return (
                <line
                  key={`straight_line_${idx}`}
                  x1={`${p1.xPct}%`}
                  y1={`${p1.yPct}%`}
                  x2={`${p2.xPct}%`}
                  y2={`${p2.yPct}%`}
                  stroke="#6CBF3D"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              );
            })}
          </svg>

          {/* Draggable Numbered Corner Pins */}
          {pins.map((pin, idx) => {
            const isActive = activePinIndex === idx;
            const isDragging = draggingPinIndex === idx;

            return (
              <div
                key={pin.id}
                onMouseDown={e => handleMouseDownPin(e, idx)}
                onTouchStart={e => handleMouseDownPin(e, idx)}
                style={{
                  left: `${pin.xPct}%`,
                  top: `${pin.yPct}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                className={`pin-element absolute z-20 cursor-grab active:cursor-grabbing flex items-center justify-center transition-all ${
                  isDragging ? 'scale-125' : 'hover:scale-115'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-[10px] shadow-2xl border-2 ${
                    isActive
                      ? 'bg-amber-500 border-white text-slate-950 ring-4 ring-amber-500/50'
                      : 'bg-[#6CBF3D] border-slate-950 text-slate-950 ring-2 ring-[#6CBF3D]/60'
                  }`}
                >
                  {idx + 1}
                </div>
              </div>
            );
          })}

          {/* Wall Measurement Badges (Placed between adjacent pins) */}
          {pins.map((p1, idx) => {
            if (!isLoopClosed && idx === pins.length - 1 && pins.length > 1) return null;
            const p2 = pins[(idx + 1) % pins.length];
            const midX = (p1.xPct + p2.xPct) / 2;
            const midY = (p1.yPct + p2.yPct) / 2;

            return (
              <div
                key={`badge_${idx}`}
                style={{
                  left: `${midX}%`,
                  top: `${midY}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                onClick={e => {
                  e.stopPropagation();
                  setEditingWallIndex(idx);
                  setTempLengthInput(String(p1.lengthFt || 10));
                }}
                className="wall-badge absolute z-30 cursor-pointer bg-slate-950/95 hover:bg-[#6CBF3D] text-[#6CBF3D] hover:text-slate-950 font-mono font-black text-[11px] px-2 py-0.5 rounded-md border border-[#6CBF3D] shadow-xl transition-all"
                title="Click to edit wall length in feet"
              >
                {editingWallIndex === idx ? (
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <input
                      type="number"
                      autoFocus
                      value={tempLengthInput}
                      onChange={e => setTempLengthInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          const val = parseFloat(tempLengthInput) || 10;
                          setPins(prev => {
                            const next = [...prev];
                            next[idx] = { ...next[idx], lengthFt: val };
                            return next;
                          });
                          setEditingWallIndex(null);
                        }
                      }}
                      className="w-12 h-6 px-1 text-center bg-slate-900 text-white rounded outline-none border border-amber-400 text-xs font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = parseFloat(tempLengthInput) || 10;
                        setPins(prev => {
                          const next = [...prev];
                          next[idx] = { ...next[idx], lengthFt: val };
                          return next;
                        });
                        setEditingWallIndex(null);
                      }}
                      className="px-1.5 py-0.5 bg-emerald-500 text-slate-950 rounded text-[10px] font-bold"
                    >
                      ✓
                    </button>
                  </div>
                ) : (
                  <span>
                    Side {idx + 1}: <b>{p1.lengthFt || 10}&apos;</b>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Status / Instructions Bar */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[#6CBF3D] font-bold">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>{pins.length} Walls Traced</span>
          </span>
          <span>•</span>
          <span className="text-slate-400">
            {isLoopClosed
              ? '✓ Closed roof polygon ready! Click "Generate 2D & 3D Model" to view.'
              : 'Draw next wall line on photo $\rightarrow$ Lines auto-straighten instantly $\rightarrow$ Connect back to Point #1 to close.'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleApply}
          className="px-5 py-2 rounded-xl bg-[#6CBF3D] hover:bg-[#5ca633] text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer ml-auto"
        >
          <span>Generate 2D &amp; 3D Model</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
