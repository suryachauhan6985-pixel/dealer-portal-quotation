import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * 8-Point Compass Direction Helper (Supports both 90° and Non-90° / Slanted / Diagonal Walls)
 */
function getCompassDirection(dx, dy) {
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI; // -180 to 180
  const normalized = (angle + 360) % 360; // 0 to 360 (0 is East, 90 is South, 180 is West, 270 is North)

  if (normalized >= 337.5 || normalized < 22.5) return { code: 'E', label: 'East ➡️' };
  if (normalized >= 22.5 && normalized < 67.5) return { code: 'SE', label: 'South-East ↘️' };
  if (normalized >= 67.5 && normalized < 112.5) return { code: 'S', label: 'South ⬇️' };
  if (normalized >= 112.5 && normalized < 157.5) return { code: 'SW', label: 'South-West ↙️' };
  if (normalized >= 157.5 && normalized < 202.5) return { code: 'W', label: 'West ⬅️' };
  if (normalized >= 202.5 && normalized < 247.5) return { code: 'NW', label: 'North-West ↖️' };
  if (normalized >= 247.5 && normalized < 292.5) return { code: 'N', label: 'North ⬆️' };
  return { code: 'NE', label: 'North-East ↗️' };
}

/**
 * Interactive Image Roof Tracer with Photoshop Pen Tool & Point-to-Point Straight Line
 * 
 * Features:
 * 1. ✒️ Point-to-Point Straight Line (Free Angle CAD):
 *    - Connects directly from corner to corner with a clean, straight line at ANY angle (90°, 45°, slants, skewed plots).
 *    - Optional 90° Ortho Snap toggle (or hold Shift key) if pure 90° lines are desired.
 * 2. 📏 Stage 2: Sides & Measurements + Parapet Height:
 *    - Editing feet measurements does NOT stretch or alter the traced lines on the photo.
 *    - Mathematically constructs closed CAD polygon supporting both 90° and non-90° irregular shapes.
 */
export default function InteractiveImageRoofTracer({
  imageUrl,
  initialCorners = [],
  initialWalls = [],
  initialParapetHeight = 3.0,
  onApplyGeometry,
  onClose
}) {
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // Workflow Step: 'draw' (Stage 1: Trace lines) vs 'dimensions' (Stage 2: Enter feet & parapet)
  const [activeStep, setActiveStep] = useState(() => {
    if (initialCorners && initialCorners.length >= 3) return 'dimensions';
    return 'draw';
  });

  // Tool Mode in Stage 1: 'pen' (Photoshop Pen Tool - Point & Click) vs 'freehand' (Drag)
  const [toolMode, setToolMode] = useState('pen');

  // Ortho 90° Snap Toggle (Default: false -> Point-to-Point straight at ANY angle)
  const [isOrthoSnap, setIsOrthoSnap] = useState(false);
  const [isShiftDown, setIsShiftDown] = useState(false);

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

  // Sides configuration (initialized once boundary is formed)
  const [sides, setSides] = useState(() => {
    if (initialWalls && initialWalls.length >= 3) {
      return initialWalls.map((w, i) => ({
        side: i + 1,
        name: w.name || `Side ${i + 1}`,
        lengthFt: parseFloat(w.lengthFt || w.length_ft) || 10,
        direction: w.direction || 'E'
      }));
    }
    return [];
  });

  // Parapet Wall Height in feet
  const [parapetHeightFt, setParapetHeightFt] = useState(initialParapetHeight || 3.0);

  // Active / Hovered Side for visual glow highlighting
  const [highlightedSideIndex, setHighlightedSideIndex] = useState(null);

  // Dragging pin in Review mode
  const [draggingPinIndex, setDraggingPinIndex] = useState(null);

  // Drawing state
  const [isDrawingStroke, setIsDrawingStroke] = useState(false);
  const [currentStroke, setCurrentStroke] = useState([]);
  const [mousePos, setMousePos] = useState(null);

  // Zoom
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isLoopClosed, setIsLoopClosed] = useState(() => initialCorners && initialCorners.length >= 3);

  // Keyboard listeners (Shift for Ortho, Ctrl+Z for Undo, Enter to Finish)
  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === 'Shift') setIsShiftDown(true);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (e.key === 'Enter' && activeStep === 'draw' && pins.length >= 3) {
        e.preventDefault();
        finalizeSidesFromPins(pins);
      }
    };

    const handleKeyUp = e => {
      if (e.key === 'Shift') setIsShiftDown(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeStep, pins]);

  // Sync initialCorners if AI finishes in background
  useEffect(() => {
    if (initialCorners && initialCorners.length >= 3) {
      const generatedPins = initialCorners.map((c, i) => ({
        id: `pin_${i + 1}`,
        xPct: Math.max(2, Math.min(98, c.x_pct || c.xPct || 50)),
        yPct: Math.max(2, Math.min(98, c.y_pct || c.yPct || 50)),
        label: c.label || `P${i + 1}`,
        lengthFt: initialWalls[i]?.lengthFt || initialWalls[i]?.length_ft || 10
      }));
      setPins(generatedPins);

      const generatedSides = initialWalls.map((w, i) => ({
        side: i + 1,
        name: w.name || `Side ${i + 1}`,
        lengthFt: parseFloat(w.lengthFt || w.length_ft) || 10,
        direction: w.direction || 'E'
      }));
      setSides(generatedSides);
      setIsLoopClosed(true);
      setActiveStep('dimensions');
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

  // Convert pins into sides with accurate 8-point compass directions (handles non-90° angles!)
  const finalizeSidesFromPins = useCallback(
    pinsList => {
      const n = pinsList.length;
      if (n < 3) return;

      const newSides = [];
      for (let i = 0; i < n; i++) {
        const p1 = pinsList[i];
        const p2 = pinsList[(i + 1) % n];
        const dx = p2.xPct - p1.xPct;
        const dy = p2.yPct - p1.yPct;

        const compass = getCompassDirection(dx, dy);
        const existingLen = sides[i]?.lengthFt || p1.lengthFt || 10;

        newSides.push({
          side: i + 1,
          name: `Side ${i + 1} (${compass.label})`,
          lengthFt: existingLen,
          direction: compass.code
        });
      }

      setSides(newSides);
      setIsLoopClosed(true);
      setActiveStep('dimensions');
    },
    [sides]
  );

  // Apply snap logic (if ortho snap active or shift held, snap to 90°; otherwise FREE point-to-point)
  const computeTargetPoint = (lastPoint, targetPoint) => {
    if (!lastPoint) return targetPoint;
    const shouldSnapOrtho = isOrthoSnap || isShiftDown;

    if (!shouldSnapOrtho) {
      // FREE POINT-TO-POINT STRAIGHT LINE (Any Angle!)
      return {
        xPct: targetPoint.xPct,
        yPct: targetPoint.yPct
      };
    }

    // 90° Ortho Snap
    const dx = targetPoint.xPct - lastPoint.xPct;
    const dy = targetPoint.yPct - lastPoint.yPct;
    const isHorizontal = Math.abs(dx) >= Math.abs(dy);

    return {
      xPct: isHorizontal ? targetPoint.xPct : lastPoint.xPct,
      yPct: isHorizontal ? lastPoint.yPct : targetPoint.yPct
    };
  };

  // 1. CLICK OR MOUSE DOWN
  const handleMouseDown = e => {
    const coords = getCoordinatesFromEvent(e);
    if (!coords) return;

    if (activeStep !== 'draw') return;

    // Check if clicked near first pin (P1) to close loop
    if (pins.length >= 3) {
      const firstPin = pins[0];
      const distToFirst = Math.hypot(coords.xPct - firstPin.xPct, coords.yPct - firstPin.yPct);
      if (distToFirst < 6.5) {
        finalizeSidesFromPins(pins);
        return;
      }
    }

    if (toolMode === 'pen') {
      // PHOTOSHOP PEN TOOL MODE: Point-to-Point Straight Line
      if (pins.length === 0) {
        // Place first anchor P1
        setPins([
          {
            id: 'pin_1',
            xPct: Number(coords.xPct.toFixed(1)),
            yPct: Number(coords.yPct.toFixed(1)),
            label: 'P1',
            lengthFt: 30
          }
        ]);
      } else {
        const lastPin = pins[pins.length - 1];
        const snapped = computeTargetPoint(lastPin, coords);

        const newPin = {
          id: `pin_${pins.length + 1}`,
          xPct: Number(snapped.xPct.toFixed(1)),
          yPct: Number(snapped.yPct.toFixed(1)),
          label: `P${pins.length + 1}`,
          lengthFt: 10
        };
        setPins(prev => [...prev, newPin]);
      }
    } else {
      // FREEHAND DRAG MODE
      setIsDrawingStroke(true);
      setCurrentStroke([coords]);
    }
  };

  // 2. MOUSE MOVE (Track cursor for live Pen Tool guide line)
  const handleMouseMove = e => {
    const coords = getCoordinatesFromEvent(e);
    if (!coords) return;

    setMousePos(coords);

    if (activeStep === 'draw' && toolMode === 'freehand' && isDrawingStroke) {
      setCurrentStroke(prev => [...prev, coords]);
    } else if (activeStep === 'dimensions' && draggingPinIndex !== null) {
      // Draggable fine-tuning in Stage 2
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
  };

  // 3. MOUSE UP (For freehand drag)
  const handleMouseUp = () => {
    if (draggingPinIndex !== null) {
      setDraggingPinIndex(null);
      return;
    }

    if (activeStep !== 'draw' || toolMode !== 'freehand' || !isDrawingStroke) return;
    setIsDrawingStroke(false);

    if (currentStroke.length < 2) {
      setCurrentStroke([]);
      return;
    }

    const startPt = currentStroke[0];
    const endPt = currentStroke[currentStroke.length - 1];

    let effectiveStart = { xPct: startPt.xPct, yPct: startPt.yPct };
    if (pins.length > 0) {
      const lastPin = pins[pins.length - 1];
      effectiveStart = { xPct: lastPin.xPct, yPct: lastPin.yPct };
    }

    const straightEnd = computeTargetPoint(effectiveStart, endPt);

    if (pins.length >= 3) {
      const firstPin = pins[0];
      const distToFirst = Math.hypot(straightEnd.xPct - firstPin.xPct, straightEnd.yPct - firstPin.yPct);
      if (distToFirst < 7) {
        finalizeSidesFromPins(pins);
        setCurrentStroke([]);
        return;
      }
    }

    if (pins.length === 0) {
      const p1 = {
        id: 'pin_1',
        xPct: Number(effectiveStart.xPct.toFixed(1)),
        yPct: Number(effectiveStart.yPct.toFixed(1)),
        label: 'P1',
        lengthFt: 30
      };
      const p2 = {
        id: 'pin_2',
        xPct: Number(straightEnd.xPct.toFixed(1)),
        yPct: Number(straightEnd.yPct.toFixed(1)),
        label: 'P2',
        lengthFt: 10
      };
      setPins([p1, p2]);
    } else {
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
  };

  // Undo last placed corner
  const handleUndo = () => {
    if (pins.length === 0) return;
    setPins(prev => prev.slice(0, prev.length - 1));
    setIsLoopClosed(false);
    setActiveStep('draw');
  };

  // Reset drawing
  const handleReset = () => {
    setPins([]);
    setSides([]);
    setIsLoopClosed(false);
    setActiveStep('draw');
  };

  // Update a single side measurement in Stage 2 (DOES NOT CHANGE DRAWING LENGTH ON PHOTO!)
  const handleSideLengthChange = (idx, value) => {
    const val = parseFloat(value) || 0;
    setSides(prev => {
      const next = [...prev];
      if (next[idx]) {
        next[idx] = { ...next[idx], lengthFt: val };
      }
      return next;
    });
  };

  // Final confirmation: Compute mathematically closed CAD polygon supporting both 90° and Non-90° / Slanted walls!
  const handleGenerateCADAnd3D = () => {
    const n = sides.length;
    if (pins.length < 3 || n < 3) {
      alert('Please trace at least 3 walls to form a closed roof boundary.');
      return;
    }

    // 1. Calculate raw vector displacements for each side from traced geometry & lengths
    const displacements = [];
    let totalPerimeter = 0;

    for (let i = 0; i < n; i++) {
      const s = sides[i];
      const len = parseFloat(s.lengthFt) || 10;
      totalPerimeter += len;

      const p1 = pins[i];
      const p2 = pins[(i + 1) % n];
      const dxImage = p2.xPct - p1.xPct;
      const dyImage = p2.yPct - p1.yPct;
      let angle = Math.atan2(dyImage, dxImage);

      // If angle is within 4° of cardinal axes (0, 90, 180, 270), snap to exact cardinal
      const deg = ((angle * 180) / Math.PI + 360) % 360;
      if (Math.abs(deg - 0) < 4 || Math.abs(deg - 360) < 4) angle = 0;
      else if (Math.abs(deg - 90) < 4) angle = Math.PI / 2;
      else if (Math.abs(deg - 180) < 4) angle = Math.PI;
      else if (Math.abs(deg - 270) < 4) angle = (3 * Math.PI) / 2;

      displacements.push({
        len,
        dx: len * Math.cos(angle),
        dz: len * Math.sin(angle),
        name: s.name,
        dirCode: s.direction
      });
    }

    // 2. Closure error (sum of all dx and dz should be 0)
    const errX = displacements.reduce((sum, d) => sum + d.dx, 0);
    const errZ = displacements.reduce((sum, d) => sum + d.dz, 0);

    // 3. Accumulate vertices with Bowditch compass rule correction (guarantees 100% closed loop!)
    let currX = 0;
    let currZ = 0;
    let distSoFar = 0;
    const rawVertices = [{ x: 0, z: 0, label: pins[0]?.label || 'Corner 1' }];

    for (let i = 0; i < n - 1; i++) {
      const d = displacements[i];
      distSoFar += d.len;

      const corrX = totalPerimeter > 0 ? (errX * distSoFar) / totalPerimeter : 0;
      const corrZ = totalPerimeter > 0 ? (errZ * distSoFar) / totalPerimeter : 0;

      currX += d.dx;
      currZ += d.dz;

      rawVertices.push({
        x: Number((currX - corrX).toFixed(1)),
        z: Number((currZ - corrZ).toFixed(1)),
        label: pins[i + 1]?.label || `Corner ${i + 2}`
      });
    }

    // 4. Center coordinates around (0, 0)
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
      walls: sides.map((s, idx) => ({
        side: idx + 1,
        name: s.name,
        lengthFt: parseFloat(s.lengthFt) || 10,
        direction: s.direction
      })),
      corners: pins.map((p, i) => ({
        corner_number: i + 1,
        x_pct: p.xPct,
        y_pct: p.yPct,
        label: p.label
      })),
      parapetHeightFt: parseFloat(parapetHeightFt) || 3.0,
      widthFt,
      depthFt
    });
  };

  // Real-time Pen Tool Guide Line from last pin to mouse
  const getGuideLine = () => {
    if (activeStep !== 'draw' || pins.length === 0 || !mousePos) return null;
    const lastPin = pins[pins.length - 1];
    const snapped = computeTargetPoint(lastPin, mousePos);

    return {
      x1: lastPin.xPct,
      y1: lastPin.yPct,
      x2: snapped.xPct,
      y2: snapped.yPct
    };
  };

  const guideLine = getGuideLine();
  const isNearFirstPin =
    activeStep === 'draw' &&
    pins.length >= 3 &&
    mousePos &&
    Math.hypot(mousePos.xPct - pins[0].xPct, mousePos.yPct - pins[0].yPct) < 7;

  return (
    <div className="flex flex-col w-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Toolbar */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
        {/* Step Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveStep('draw')}
              className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeStep === 'draw' ? 'bg-[#6CBF3D] text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              <span>1. बाउंड्री बनाएं (Draw Boundary)</span>
              {pins.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900 text-[#6CBF3D]">
                  {pins.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                if (pins.length >= 3) {
                  finalizeSidesFromPins(pins);
                } else {
                  alert('कम से कम 3 कोने (corners) बनाएं ताकि छत बंद हो सके।');
                }
              }}
              className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeStep === 'dimensions'
                  ? 'bg-[#6CBF3D] text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">straighten</span>
              <span>2. साइड्स व मुंडेर ऊंचाई (Sides &amp; Parapet)</span>
              {sides.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900 text-[#6CBF3D]">
                  {sides.length} Sides
                </span>
              )}
            </button>
          </div>

          {/* Mode Switchers in Stage 1 */}
          {activeStep === 'draw' && (
            <div className="flex items-center gap-1.5">
              {/* Point-to-Point Angle Mode Toggle */}
              <button
                type="button"
                onClick={() => setIsOrthoSnap(!isOrthoSnap)}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
                  isOrthoSnap
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
                title="Toggle between Free Angle (Point-to-Point) and 90° Ortho Lock (or hold Shift key)"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isOrthoSnap ? 'square_foot' : 'timeline'}
                </span>
                <span>{isOrthoSnap ? '📐 90° Ortho Lock' : '⚡ Free Angle (Any Slant)'}</span>
              </button>

              {/* Pen Tool vs Freehand Drag */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setToolMode('pen')}
                  className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    toolMode === 'pen' ? 'bg-[#6CBF3D] text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Click to place corners"
                >
                  <span className="material-symbols-outlined text-[14px]">colorize</span>
                  <span>Pen Tool</span>
                </button>
                <button
                  type="button"
                  onClick={() => setToolMode('freehand')}
                  className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    toolMode === 'freehand' ? 'bg-[#6CBF3D] text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Freehand drag stroke"
                >
                  <span className="material-symbols-outlined text-[14px]">gesture</span>
                  <span>Drag</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {activeStep === 'draw' && (
            <>
              {/* Undo Button */}
              <button
                type="button"
                onClick={handleUndo}
                disabled={pins.length === 0}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-bold text-xs flex items-center gap-1 cursor-pointer"
                title="Undo last corner point (Ctrl+Z)"
              >
                <span className="material-symbols-outlined text-[16px]">undo</span>
                <span>Undo</span>
              </button>

              {/* Reset button */}
              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                <span>Reset</span>
              </button>

              {/* Done Drawing Button */}
              <button
                type="button"
                onClick={() => {
                  if (pins.length >= 3) {
                    finalizeSidesFromPins(pins);
                  } else {
                    alert('कम से कम 3 कोने (corners) बनाएं ताकि छत बंद हो सके।');
                  }
                }}
                disabled={pins.length < 3}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[#6CBF3D] hover:brightness-110 disabled:opacity-40 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer ml-1"
              >
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Finish Boundary $\rightarrow$ Enter Dimensions</span>
              </button>
            </>
          )}

          {activeStep === 'dimensions' && (
            <>
              {/* Back to Draw button */}
              <button
                type="button"
                onClick={() => setActiveStep('draw')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Redraw Boundary</span>
              </button>

              {/* Generate 2D CAD & 3D Model */}
              <button
                type="button"
                onClick={handleGenerateCADAnd3D}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6CBF3D] to-emerald-400 hover:brightness-110 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg cursor-pointer ml-auto"
              >
                <span className="material-symbols-outlined text-[18px]">view_in_ar</span>
                <span>Generate 2D CAD &amp; 3D Model</span>
              </button>
            </>
          )}

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 ml-1">
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.15))}
              className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-white cursor-pointer font-black text-xs"
            >
              -
            </button>
            <span className="text-[10px] font-mono text-slate-300 w-7 text-center">{Math.round(zoomLevel * 100)}%</span>
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.min(2.0, prev + 0.15))}
              className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-white cursor-pointer font-black text-xs"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Main Drawing Viewport & Overlay Canvas */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        className={`w-full relative min-h-[460px] max-h-[620px] overflow-auto flex items-center justify-center bg-[#070D18] p-4 select-none ${
          activeStep === 'draw' ? 'cursor-crosshair' : 'cursor-default'
        }`}
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
            className="max-h-[520px] max-w-[90vw] object-contain rounded-xl shadow-2xl pointer-events-none border border-slate-700 block"
          />

          {/* Live Freehand Wavy Stroke while dragging mouse */}
          {activeStep === 'draw' && toolMode === 'freehand' && isDrawingStroke && currentStroke.length > 1 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-30">
              <polyline
                points={currentStroke.map(p => `${p.xPct}%,${p.yPct}%`).join(' ')}
                fill="none"
                stroke="#F59E0B"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="4 2"
              />
            </svg>
          )}

          {/* SVG Lines Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-10">
            {/* Shaded Closed Polygon (once loop is closed) */}
            {(isLoopClosed || activeStep === 'dimensions') && pins.length >= 3 && (
              <polygon
                points={pins.map(p => `${p.xPct}%,${p.yPct}%`).join(' ')}
                fill="rgba(108, 191, 61, 0.22)"
                stroke="#6CBF3D"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
            )}

            {/* Connecting Wall Lines (Direct Straight Lines from Point to Point) */}
            {pins.map((p1, idx) => {
              const isLast = idx === pins.length - 1;
              if (!isLoopClosed && activeStep === 'draw' && isLast) return null;

              const p2 = pins[(idx + 1) % pins.length];
              const isSideHighlighted = highlightedSideIndex === idx;

              return (
                <line
                  key={`line_${idx}`}
                  x1={`${p1.xPct}%`}
                  y1={`${p1.yPct}%`}
                  x2={`${p2.xPct}%`}
                  y2={`${p2.yPct}%`}
                  stroke={isSideHighlighted ? '#FBBF24' : '#6CBF3D'}
                  strokeWidth={isSideHighlighted ? '5' : '3.5'}
                  strokeLinecap="round"
                  className="transition-all"
                />
              );
            })}

            {/* Photoshop Pen Tool: Live Rubber-Band Straight Guide Line from last placed pin to mouse cursor */}
            {activeStep === 'draw' && guideLine && !isLoopClosed && (
              <g>
                <line
                  x1={`${guideLine.x1}%`}
                  y1={`${guideLine.y1}%`}
                  x2={`${guideLine.x2}%`}
                  y2={`${guideLine.y2}%`}
                  stroke="#38BDF8"
                  strokeWidth="3"
                  strokeDasharray="5 3"
                  strokeLinecap="round"
                />
                <circle
                  cx={`${guideLine.x2}%`}
                  cy={`${guideLine.y2}%`}
                  r="5"
                  fill="#38BDF8"
                  stroke="#0F172A"
                  strokeWidth="2"
                />
              </g>
            )}
          </svg>

          {/* Sleek, Tiny CAD Corner Pinpoints (Non-blocking during draw!) */}
          {pins.map((pin, idx) => {
            const isFirst = idx === 0;
            const isStartHovered = isFirst && isNearFirstPin;

            return (
              <div
                key={pin.id}
                onMouseDown={e => {
                  if (activeStep === 'dimensions') {
                    e.stopPropagation();
                    setDraggingPinIndex(idx);
                  }
                }}
                style={{
                  left: `${pin.xPct}%`,
                  top: `${pin.yPct}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                className={`absolute z-20 flex items-center justify-center transition-all ${
                  activeStep === 'dimensions'
                    ? 'cursor-grab active:cursor-grabbing hover:scale-125'
                    : 'pointer-events-none'
                }`}
              >
                {/* Sleek Dot (Photoshop Pen Point Anchor) */}
                <div
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
                    isStartHovered
                      ? 'w-5 h-5 bg-amber-400 ring-4 ring-amber-400/60 shadow-lg animate-pulse'
                      : 'bg-[#6CBF3D] border-2 border-white shadow-md ring-2 ring-slate-950/80'
                  }`}
                />

                {/* Pin Number Label Tag */}
                <span className="absolute -top-5 text-[9px] font-black bg-slate-950/90 text-[#6CBF3D] px-1 py-0.2 rounded border border-[#6CBF3D]/40 pointer-events-none shadow-sm whitespace-nowrap">
                  P{idx + 1}
                </span>

                {/* Photoshop Close Path Indicator on hover near Point 1 */}
                {isStartHovered && (
                  <span className="absolute -bottom-6 text-[10px] font-extrabold bg-amber-400 text-slate-950 px-2 py-0.5 rounded shadow-lg whitespace-nowrap pointer-events-none flex items-center gap-1">
                    <span>○</span>
                    <span>Click P1 to Close Path</span>
                  </span>
                )}
              </div>
            );
          })}

          {/* Compact Side Badges on Photo (Visible in Stage 2) */}
          {activeStep === 'dimensions' &&
            pins.map((p1, idx) => {
              const p2 = pins[(idx + 1) % pins.length];
              const midX = (p1.xPct + p2.xPct) / 2;
              const midY = (p1.yPct + p2.yPct) / 2;
              const sideData = sides[idx];
              const isSideHighlighted = highlightedSideIndex === idx;

              return (
                <div
                  key={`side_badge_${idx}`}
                  style={{
                    left: `${midX}%`,
                    top: `${midY}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onMouseEnter={() => setHighlightedSideIndex(idx)}
                  onMouseLeave={() => setHighlightedSideIndex(null)}
                  className={`absolute z-30 font-mono font-bold text-[10px] px-2 py-0.5 rounded border shadow-lg transition-all cursor-pointer ${
                    isSideHighlighted
                      ? 'bg-amber-500 text-slate-950 border-amber-300 scale-110 ring-2 ring-amber-400/50'
                      : 'bg-slate-950/90 text-[#6CBF3D] border-[#6CBF3D]/60'
                  }`}
                >
                  Side {idx + 1}: <b>{sideData?.lengthFt || 10}&apos;</b>
                </div>
              );
            })}
        </div>
      </div>

      {/* STAGE 1 BOTTOM HELPER BAR */}
      {activeStep === 'draw' && (
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-amber-400 font-bold">
              <span className="material-symbols-outlined text-[18px]">
                {isOrthoSnap ? 'square_foot' : 'timeline'}
              </span>
              <span>{pins.length} Corners Placed</span>
            </span>
            <span>•</span>
            <span className="text-slate-400">
              {pins.length === 0 ? (
                <>
                  👉 नक़्शे के पहले कोने (Corner 1) पर <b>क्लिक</b> करें। <b>(Point-to-Point सीधी लाइन चालू है—कोई भी तिरछा या 90° कोना बना सकते हैं)</b>
                </>
              ) : pins.length < 3 ? (
                <>
                  👉 अगले कोने पर क्लिक करते जाएं—सीधी लाइन अपने-आप जुड़ती जाएगी (तिरछी या सीधी दोनों सम्भव)।
                </>
              ) : (
                <>
                  👉 कोने क्लिक करके <b>P1 पर क्लिक करें</b> (या &quot;Finish Boundary&quot; बटन दबाएं)।
                </>
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (pins.length >= 3) {
                finalizeSidesFromPins(pins);
              } else {
                alert('कम से कम 3 कोने (corners) बनाएं ताकि छत बंद हो सके।');
              }
            }}
            disabled={pins.length < 3}
            className="px-4 py-1.5 rounded-xl bg-[#6CBF3D] hover:bg-[#5ca633] disabled:opacity-40 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer ml-auto"
          >
            <span>Finish Boundary &amp; Set Dimensions</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      )}

      {/* STAGE 2: SIDES MEASUREMENT TABLE & PARAPET HEIGHT FORM */}
      {activeStep === 'dimensions' && (
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-3">
            <div>
              <h5 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-[20px]">straighten</span>
                <span>हर साइड का वास्तविक माप (Feet) व मुंडेर ऊंचाई</span>
              </h5>
              <p className="text-[11px] text-slate-400 mt-0.5">
                कागज पर लिखा सही माप (feet) भरें—<b>इससे फ़ोटो की खींची हुई लाइन नहीं बदलेगी</b>, बल्कि असली 2D CAD व 3D मॉडल बिल्कुल सही स्केल पर बनेगा।
              </p>
            </div>

            {/* Parapet Wall Height Configuration */}
            <div className="flex items-center gap-3 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-400 text-[18px]">fence</span>
                <span className="text-xs font-bold text-white">मुंडेर ऊंचाई (Parapet Height):</span>
              </div>
              <div className="flex items-center gap-1">
                {[2.5, 3.0, 3.5, 4.0].map(h => (
                  <button
                    key={`p_h_${h}`}
                    type="button"
                    onClick={() => setParapetHeightFt(h)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-all ${
                      parapetHeightFt === h
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {h} ft
                  </button>
                ))}
                <input
                  type="number"
                  step="0.5"
                  value={parapetHeightFt}
                  onChange={e => setParapetHeightFt(parseFloat(e.target.value) || 0)}
                  className="w-14 h-6 text-center bg-slate-900 text-white font-mono font-bold text-xs rounded border border-blue-500/40 ml-1 outline-none"
                />
                <span className="text-[11px] text-slate-400">ft</span>
              </div>
            </div>
          </div>

          {/* Sides Dimension Cards Grid (Supports 8-point compass directions!) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-56 overflow-y-auto p-1">
            {sides.map((side, idx) => {
              const isHighlighted = highlightedSideIndex === idx;

              return (
                <div
                  key={`side_card_${idx}`}
                  onMouseEnter={() => setHighlightedSideIndex(idx)}
                  onMouseLeave={() => setHighlightedSideIndex(null)}
                  className={`p-2 rounded-xl border transition-all flex flex-col gap-1.5 cursor-pointer ${
                    isHighlighted
                      ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/40'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-white">Side {side.side}</span>
                    <span className="text-[10px] text-amber-300 font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20">
                      {side.direction}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={side.lengthFt}
                      onChange={e => handleSideLengthChange(idx, e.target.value)}
                      className="w-full h-8 px-2 bg-slate-900 text-white font-mono font-black text-sm rounded-lg border border-slate-700 focus:border-[#6CBF3D] outline-none text-center"
                      placeholder="10"
                    />
                    <span className="text-xs font-bold text-slate-400">ft</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stage 2 Bottom Confirmation Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 flex-wrap gap-2">
            <span className="text-xs text-slate-400">
              ✓ सभी साइड्स ({sides.length} walls) और मुंडेर ({parapetHeightFt} ft) तैयार हैं। 2D CAD नक्शा और 3D मॉडल बनाएं:
            </span>

            <button
              type="button"
              onClick={handleGenerateCADAnd3D}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6CBF3D] to-emerald-400 hover:brightness-110 text-slate-950 font-black text-sm flex items-center gap-2 shadow-xl cursor-pointer ml-auto"
            >
              <span className="material-symbols-outlined text-[20px]">view_in_ar</span>
              <span>Generate 2D CAD &amp; 3D Model</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
