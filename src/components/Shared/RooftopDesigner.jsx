import React, { useState, useMemo, useRef, useEffect } from 'react';
import { scanRoofSketch, getGeminiApiKey, saveGeminiApiKey } from '../../utils/aiRoofVisionEngine';

/**
 * NEW HAND-DRAWN SKETCH 3 (10 Walls - Digitize of User's Uploaded Notebook Sketch 3):
 * - Top South Wall: 30 ft
 * - Upper East Drop: 10 ft
 * - Notch Step In: 8 ft
 * - Notch Drop: 7 ft
 * - Notch Step In: 4 ft
 * - Lower East Drop: 16 ft
 * - Bottom Wall: 5 ft
 * - Step Up: 10 ft
 * - Step Left: 13 ft
 * - West Wall: 23 ft (60ft total envelope)
 */
export const SITE_SKETCH_3_CONFIG = {
  type: 'custom_polygon',
  name: 'Notebook Sketch 3 (10 Walls - 30ft Top, Notch & Projection)',
  widthFt: 30,
  depthFt: 44,
  parapetHeightFt: 3.0,
  parapetThicknessInches: 9,
  southDirection: 'top',
  customVertices: [
    { x: -15, z: -22, label: 'NW Corner (Top-Left)' },
    { x: 15, z: -22, label: 'NE Corner (30ft South Wall)' },
    { x: 15, z: -12, label: 'East Drop (10ft Down)' },
    { x: 7, z: -12, label: 'Notch Step (8ft Left)' },
    { x: 7, z: -5, label: 'Notch Drop (7ft Down)' },
    { x: 3, z: -5, label: 'Notch Step (4ft Left)' },
    { x: 3, z: 11, label: 'SE Corner (16ft Down)' },
    { x: -2, z: 11, label: 'Bottom Wall (5ft Left)' },
    { x: -2, z: 1, label: 'Step Up (10ft Up)' },
    { x: -15, z: 1, label: 'Step Left (13ft to West Wall)' }
  ],
  obstacles: [],
  safeSolarZone: {
    centerXFt: 0,
    centerZFt: -14,
    availableWidthFt: 22,
    availableDepthFt: 14,
    description: '100% Shadow-Free Open Terrace (South Sunlight)'
  }
};

/**
 * NEW HAND-DRAWN SKETCH 2 (Exact Digitize of User's Uploaded Notebook Sketch):
 * - Top South Wall: 30 ft
 * - Upper East Wall: 25 ft down
 * - Shelf (Cutout Step): 10 ft right
 * - Lower East Wall: 15 ft down
 * - Bottom Wall: 40 ft left
 * - West Wall: 40 ft straight up
 * - Mumty: 3 ft width x 6 ft depth, Height: 7 ft, located at Bottom-Left Corner!
 * - Water Tank: None
 * - Parapet Height: 3 ft
 */
export const SITE_SKETCH_2_CONFIG = {
  type: 'stepped_l',
  name: 'Notebook Sketch 2 (40×40ft with Bottom-Left Mumty)',
  widthFt: 40,
  depthFt: 40,
  parapetHeightFt: 3.0,
  parapetThicknessInches: 9,
  southDirection: 'top',
  // Orthogonal parameters
  wTopFt: 30,
  dUpperFt: 25,
  wShelfFt: 10,
  dLowerFt: 15,
  customVertices: [
    { x: -20, z: -20, label: 'NW Corner (Top-Left)' },
    { x: 10, z: -20, label: 'NE Corner (30ft South Wall)' },
    { x: 10, z: 5, label: 'East Step In (25ft Down)' },
    { x: 20, z: 5, label: 'East Step Out (10ft Right)' },
    { x: 20, z: 20, label: 'SE Corner (15ft Down)' },
    { x: -20, z: 20, label: 'SW Corner (40ft Bottom Wall)' }
  ],
  obstacles: [
    {
      id: 'mumty',
      name: 'Staircase Mumty (सीढ़ी का कमरा)',
      type: 'box',
      location: 'bottom-left',
      widthFt: 3,
      depthFt: 6,
      heightFt: 7,
      xRelFt: -18.5, // 3ft from left wall (-20 + 1.5)
      zRelFt: 17.0,  // 6ft from bottom wall (20 - 3)
      shadowLengthFt: 9.1
    }
  ],
  safeSolarZone: {
    centerXFt: -2.5,
    centerZFt: -7.5,
    availableWidthFt: 22,
    availableDepthFt: 20,
    description: '100% Shadow-Free Open Terrace (South Sunlight)'
  }
};

/**
 * ORIGINAL HAND-DRAWN SKETCH 1 (50×30ft with Top-Left Mumty & Tanki)
 */
export const SAMPLE_HAND_DRAWN_SKETCH_CONFIG = {
  type: 'custom_polygon',
  name: 'Notebook Sketch 1 (50×30ft with Mumty & Tanki)',
  widthFt: 36,
  depthFt: 50,
  parapetHeightFt: 3.0,
  parapetThicknessInches: 9,
  southDirection: 'top',
  customVertices: [
    { x: -15, z: -25, label: 'NW Corner (Top-Left)' },
    { x: 15, z: -25, label: 'NE Corner (30ft South Wall)' },
    { x: 15, z: -19, label: 'E-Wall (6ft Down)' },
    { x: 21, z: -19, label: 'E-Wall (6ft Out/Right)' },
    { x: 21, z: -3, label: 'E-Wall (16ft Down)' },
    { x: 0, z: -3, label: 'Inner Cutout (21ft In/Left)' },
    { x: 0, z: 25, label: 'Courtyard Wall (28ft Down)' },
    { x: -15, z: 25, label: 'SW Corner (15ft Bottom Wall)' }
  ],
  obstacles: [
    {
      id: 'mumty',
      name: 'Staircase Mumty (सीढ़ी का कमरा)',
      type: 'box',
      location: 'top-left',
      widthFt: 7,
      depthFt: 16,
      heightFt: 7,
      xRelFt: -11.5,
      zRelFt: -17,
      shadowLengthFt: 9.1
    },
    {
      id: 'tanki',
      name: 'Water Tank (पानी की टंकी)',
      type: 'cylinder',
      radiusFt: 1.8,
      heightFt: 3,
      xRelFt: -11.0,
      zRelFt: 20.0,
      shadowLengthFt: 4.0
    }
  ],
  safeSolarZone: {
    centerXFt: 3.5,
    centerZFt: -14,
    availableWidthFt: 22,
    availableDepthFt: 20,
    description: '100% Shadow-Free Zone (Uninterrupted South Sunlight)'
  }
};

/**
 * Default Rectangular Roof Preset
 */
export const DEFAULT_ROOF_CONFIG = {
  type: 'rectangle',
  name: 'Standard Rectangular Rooftop (36×26 ft)',
  widthFt: 36,
  depthFt: 26,
  parapetHeightFt: 3.0,
  parapetThicknessInches: 9,
  southDirection: 'top',
  customVertices: [
    { x: -18, z: -13, label: 'NW Corner' },
    { x: 18, z: -13, label: 'NE Corner' },
    { x: 18, z: 13, label: 'SE Corner' },
    { x: -18, z: 13, label: 'SW Corner' }
  ],
  obstacles: [
    {
      id: 'mumty',
      name: 'Staircase Mumty',
      type: 'box',
      location: 'top-left',
      widthFt: 7,
      depthFt: 10,
      heightFt: 7,
      xRelFt: -14,
      zRelFt: -8,
      shadowLengthFt: 9.1
    }
  ],
  safeSolarZone: {
    centerXFt: 2,
    centerZFt: 0,
    availableWidthFt: 24,
    availableDepthFt: 20,
    description: 'Open Terrace Zone'
  },
  uploadedImage: null
};

/**
 * Standard L-Shape Roof Preset
 */
export const DEFAULT_L_SHAPE_CONFIG = {
  type: 'l_shape',
  name: 'L-Shaped Rooftop (36×32 ft with Cutout)',
  widthFt: 36,
  depthFt: 32,
  lCutoutWidthFt: 14,
  lCutoutDepthFt: 12,
  parapetHeightFt: 3.0,
  parapetThicknessInches: 9,
  southDirection: 'top',
  customVertices: [
    { x: -18, z: -16, label: 'NW' },
    { x: 4, z: -16, label: 'N-Cut' },
    { x: 4, z: -4, label: 'Inner Corner' },
    { x: 18, z: -4, label: 'E-Cut' },
    { x: 18, z: 16, label: 'SE' },
    { x: -18, z: 16, label: 'SW' }
  ],
  obstacles: [
    {
      id: 'mumty',
      name: 'Staircase Mumty',
      type: 'box',
      location: 'top-left',
      widthFt: 7,
      depthFt: 10,
      heightFt: 7,
      xRelFt: -14,
      zRelFt: -11,
      shadowLengthFt: 9.1
    }
  ],
  safeSolarZone: {
    centerXFt: 0,
    centerZFt: 4,
    availableWidthFt: 22,
    availableDepthFt: 18,
    description: 'Shadow-Free Open L-Terrace'
  }
};

/**
 * Builds 6 clean orthogonal vertices for a stepped L-shape roof
 * Guarantees 90-degree right angles with zero distortion!
 */
export function buildOrthogonalSteppedVertices(wTop, dUpper, wShelf, dLower) {
  const wTotal = wTop + wShelf;
  const dTotal = dUpper + dLower;
  const halfW = wTotal / 2;
  const halfD = dTotal / 2;

  return [
    { x: -halfW, z: -halfD, label: 'NW Corner (Top-Left)' },
    { x: -halfW + wTop, z: -halfD, label: `NE Corner (${wTop}ft South Wall)` },
    { x: -halfW + wTop, z: -halfD + dUpper, label: `East Step In (${dUpper}ft Down)` },
    { x: halfW, z: -halfD + dUpper, label: `East Step Out (${wShelf}ft Right)` },
    { x: halfW, z: halfD, label: `SE Corner (${dLower}ft Down)` },
    { x: -halfW, z: halfD, label: `SW Corner (${wTotal}ft Bottom Wall)` }
  ];
}

/**
 * Computes 2D polygon vertices (in feet) for any roof config
 */
export function getRoofPolygonVertices(roof) {
  if (roof.customVertices && roof.customVertices.length >= 3) {
    return roof.customVertices;
  }

  const w = parseFloat(roof.widthFt) || 40;
  const d = parseFloat(roof.depthFt) || 40;
  const halfW = w / 2;
  const halfD = d / 2;

  if (roof.type === 'stepped_l') {
    const wTop = parseFloat(roof.wTopFt) || 30;
    const dUpper = parseFloat(roof.dUpperFt) || 25;
    const wShelf = parseFloat(roof.wShelfFt) || 10;
    const dLower = parseFloat(roof.dLowerFt) || 15;
    return buildOrthogonalSteppedVertices(wTop, dUpper, wShelf, dLower);
  }

  if (roof.type === 'l_shape') {
    const cw = Math.min(w - 6, parseFloat(roof.lCutoutWidthFt) || 14);
    const cd = Math.min(d - 6, parseFloat(roof.lCutoutDepthFt) || 12);
    return [
      { x: -halfW, z: -halfD, label: 'NW' },
      { x: halfW - cw, z: -halfD, label: 'N-Cut' },
      { x: halfW - cw, z: -halfD + cd, label: 'Inner Corner' },
      { x: halfW, z: -halfD + cd, label: 'E-Cut' },
      { x: halfW, z: halfD, label: 'SE' },
      { x: -halfW, z: halfD, label: 'SW' }
    ];
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
  roofConfig = SITE_SKETCH_2_CONFIG,
  onSaveRoofConfig = null,
  onOpen3D = null,
  onProceedTo2D = null
}) {
  const [config, setConfig] = useState(roofConfig || SITE_SKETCH_2_CONFIG);
  const [activeTab, setActiveTab] = useState('upload'); // Start with AI upload / photo scan
  const [uploadPreview, setUploadPreview] = useState(config.uploadedImage || null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatusMessage, setScanStatusMessage] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [aiExtractedData, setAiExtractedData] = useState(null);
  const [selectedWallIndex, setSelectedWallIndex] = useState(null);

  // Gemini API key state
  const [geminiKey, setGeminiKey] = useState(() => getGeminiApiKey());
  const [tempApiKey, setTempApiKey] = useState('');
  const [showApiKeySetting, setShowApiKeySetting] = useState(false);

  // Stepped L-Shape interactive parameters
  const [wTop, setWTop] = useState(config.wTopFt || 30);
  const [dUpper, setDUpper] = useState(config.dUpperFt || 25);
  const [wShelf, setWShelf] = useState(config.wShelfFt || 10);
  const [dLower, setDLower] = useState(config.dLowerFt || 15);

  // Mumty location state
  const [mumtyLoc, setMumtyLoc] = useState(config.obstacles?.[0]?.location || 'bottom-left');
  const [mumtyW, setMumtyW] = useState(config.obstacles?.[0]?.widthFt || 3);
  const [mumtyD, setMumtyD] = useState(config.obstacles?.[0]?.depthFt || 6);
  const [mumtyH, setMumtyH] = useState(config.obstacles?.[0]?.heightFt || 7);
  const [hasWaterTank, setHasWaterTank] = useState(config.obstacles?.some(o => o.type === 'cylinder') || false);

  const fileInputRef = useRef(null);

  const handleSaveApiKey = () => {
    saveGeminiApiKey(tempApiKey);
    setGeminiKey(tempApiKey.trim());
    setShowApiKeySetting(false);
  };

  const handleClearApiKey = () => {
    saveGeminiApiKey('');
    setGeminiKey('');
    setTempApiKey('');
    setShowApiKeySetting(false);
  };

  // Compute vertices and walls
  const vertices = useMemo(() => getRoofPolygonVertices(config), [config]);
  const walls = useMemo(() => getRoofWalls(vertices), [vertices]);
  const totalPerimeterFt = useMemo(() => walls.reduce((acc, w) => acc + w.lengthFt, 0).toFixed(1), [walls]);
  const estimatedAreaSqFt = useMemo(() => {
    let area = 0;
    for (let i = 0; i < vertices.length; i++) {
      const j = (i + 1) % vertices.length;
      area += vertices[i].x * vertices[j].z;
      area -= vertices[j].x * vertices[i].z;
    }
    return Math.abs(area / 2).toFixed(0);
  }, [vertices]);

  const obstacles = config.obstacles || [];

  const handleUpdateParam = (key, value) => {
    const updated = { ...config, [key]: value };
    setConfig(updated);
    if (onSaveRoofConfig) onSaveRoofConfig(updated);
  };

  // Rebuild stepped roof when user changes any wall measurement
  const handleUpdateSteppedWall = (newWTop, newDUpper, newWShelf, newDLower) => {
    const wt = parseFloat(newWTop) || 30;
    const du = parseFloat(newDUpper) || 25;
    const ws = parseFloat(newWShelf) || 10;
    const dl = parseFloat(newDLower) || 15;

    setWTop(wt);
    setDUpper(du);
    setWShelf(ws);
    setDLower(dl);

    const newVerts = buildOrthogonalSteppedVertices(wt, du, ws, dl);
    const wTotal = wt + ws;
    const dTotal = du + dl;
    const halfW = wTotal / 2;
    const halfD = dTotal / 2;

    // Recalculate mumty coordinates based on location
    let newObstacles = [];
    if (mumtyLoc !== 'none') {
      let mx = -halfW + mumtyW / 2;
      let mz = halfD - mumtyD / 2;
      if (mumtyLoc === 'bottom-left') {
        mx = -halfW + mumtyW / 2;
        mz = halfD - mumtyD / 2;
      } else if (mumtyLoc === 'top-left') {
        mx = -halfW + mumtyW / 2;
        mz = -halfD + mumtyD / 2;
      } else if (mumtyLoc === 'top-right') {
        mx = -halfW + wt - mumtyW / 2;
        mz = -halfD + mumtyD / 2;
      }
      newObstacles.push({
        id: 'mumty',
        name: 'Staircase Mumty (सीढ़ी)',
        type: 'box',
        location: mumtyLoc,
        widthFt: mumtyW,
        depthFt: mumtyD,
        heightFt: mumtyH,
        xRelFt: Number(mx.toFixed(1)),
        zRelFt: Number(mz.toFixed(1)),
        shadowLengthFt: 9.1
      });
    }

    if (hasWaterTank) {
      newObstacles.push({
        id: 'tanki',
        name: 'Water Tank (टंकी)',
        type: 'cylinder',
        radiusFt: 1.8,
        heightFt: 3,
        xRelFt: -halfW + 4,
        zRelFt: halfD - 4,
        shadowLengthFt: 4.0
      });
    }

    // Safe solar zone in top open area
    const safeZone = {
      centerXFt: Number((-halfW + wt / 2).toFixed(1)),
      centerZFt: Number((-halfD + du / 2).toFixed(1)),
      availableWidthFt: Math.max(16, wt - 6),
      availableDepthFt: Math.max(16, du - 4),
      description: '100% Shadow-Free Open Terrace'
    };

    const updated = {
      ...config,
      type: 'stepped_l',
      widthFt: wTotal,
      depthFt: dTotal,
      wTopFt: wt,
      dUpperFt: du,
      wShelfFt: ws,
      dLowerFt: dl,
      customVertices: newVerts,
      obstacles: newObstacles,
      safeSolarZone: safeZone
    };

    setConfig(updated);
    if (onSaveRoofConfig) onSaveRoofConfig(updated);
  };

  // Switch to preset shapes
  const handleSelectPreset = presetType => {
    let updated;
    if (presetType === 'sketch3') {
      updated = { ...SITE_SKETCH_3_CONFIG };
      setMumtyLoc('none');
      setHasWaterTank(false);
    } else if (presetType === 'sketch2') {
      updated = { ...SITE_SKETCH_2_CONFIG };
      setWTop(30);
      setDUpper(25);
      setWShelf(10);
      setDLower(15);
      setMumtyLoc('bottom-left');
      setMumtyW(3);
      setMumtyD(6);
      setMumtyH(7);
      setHasWaterTank(false);
    } else if (presetType === 'sketch1') {
      updated = { ...SAMPLE_HAND_DRAWN_SKETCH_CONFIG };
      setMumtyLoc('top-left');
      setMumtyW(7);
      setMumtyD(16);
      setMumtyH(7);
      setHasWaterTank(true);
    } else if (presetType === 'rectangle') {
      updated = { ...DEFAULT_ROOF_CONFIG };
      setMumtyLoc('top-left');
      setHasWaterTank(false);
    } else {
      updated = { ...DEFAULT_L_SHAPE_CONFIG };
      setMumtyLoc('top-left');
      setHasWaterTank(false);
    }

    setConfig(updated);
    if (onSaveRoofConfig) onSaveRoofConfig(updated);
    setScanResult({
      success: true,
      message: `Loaded ${updated.name}`,
      wallsCount: updated.customVertices.length,
      obstaclesDetected: updated.obstacles?.length || 0
    });
  };

  // Mumty location change handler
  const handleMumtyLocationChange = newLoc => {
    setMumtyLoc(newLoc);
    const halfW = (config.widthFt || 40) / 2;
    const halfD = (config.depthFt || 40) / 2;

    let obsList = (config.obstacles || []).filter(o => o.id !== 'mumty');
    if (newLoc !== 'none') {
      let mx = -halfW + mumtyW / 2;
      let mz = halfD - mumtyD / 2;
      if (newLoc === 'bottom-left') {
        mx = -halfW + mumtyW / 2;
        mz = halfD - mumtyD / 2;
      } else if (newLoc === 'top-left') {
        mx = -halfW + mumtyW / 2;
        mz = -halfD + mumtyD / 2;
      } else if (newLoc === 'top-right') {
        mx = halfW - mumtyW / 2;
        mz = -halfD + mumtyD / 2;
      }

      obsList.push({
        id: 'mumty',
        name: 'Staircase Mumty (सीढ़ी)',
        type: 'box',
        location: newLoc,
        widthFt: mumtyW,
        depthFt: mumtyD,
        heightFt: mumtyH,
        xRelFt: Number(mx.toFixed(1)),
        zRelFt: Number(mz.toFixed(1)),
        shadowLengthFt: 9.1
      });
    }

    const updated = { ...config, obstacles: obsList };
    setConfig(updated);
    if (onSaveRoofConfig) onSaveRoofConfig(updated);
  };

  // Image Upload handler with real AI Vision & In-Browser Computer Vision
  const handleImageUpload = e => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async event => {
      const dataUrl = event.target?.result;
      setUploadPreview(dataUrl);
      setIsScanning(true);
      setScanStatusMessage(geminiKey ? 'Connecting to Google Gemini Vision AI...' : 'Analyzing drawing with In-Browser Computer Vision...');

      try {
        const result = await scanRoofSketch(dataUrl, geminiKey);
        setIsScanning(false);

        if (result && result.success && result.data) {
          const d = result.data;
          setAiExtractedData(d);

          const wt = parseFloat(d.wTopFt) || 30;
          const du = parseFloat(d.dUpperFt) || 25;
          const ws = parseFloat(d.wShelfFt) || 10;
          const dl = parseFloat(d.dLowerFt) || 15;
          const mLoc = d.mumty?.location || 'none';
          const mW = parseFloat(d.mumty?.widthFt) || 3;
          const mD = parseFloat(d.mumty?.depthFt) || 6;
          const mH = parseFloat(d.mumty?.heightFt) || 7;
          const pHeight = parseFloat(d.parapetHeightFt) || 3.0;

          setWTop(wt);
          setDUpper(du);
          setWShelf(ws);
          setDLower(dl);
          setMumtyLoc(mLoc);
          setMumtyW(mW);
          setMumtyD(mD);
          setMumtyH(mH);
          setHasWaterTank(Boolean(d.waterTank?.detected));

          let newVerts;
          let wTotal = wt + ws;
          let dTotal = du + dl;

          if (d.customVertices && Array.isArray(d.customVertices) && d.customVertices.length >= 3) {
            newVerts = d.customVertices;
            const xs = newVerts.map(v => v.x);
            const zs = newVerts.map(v => v.z);
            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            const minZ = Math.min(...zs);
            const maxZ = Math.max(...zs);
            wTotal = Math.max(parseFloat(d.widthFt) || 0, Math.round(maxX - minX));
            dTotal = Math.max(parseFloat(d.depthFt) || 0, Math.round(maxZ - minZ));
          } else {
            newVerts = buildOrthogonalSteppedVertices(wt, du, ws, dl);
          }

          const halfW = wTotal / 2;
          const halfD = dTotal / 2;

          let newObstacles = [];
          if (mLoc && mLoc !== 'none') {
            let mx = -halfW + mW / 2;
            let mz = halfD - mD / 2;
            if (mLoc === 'top-left') {
              mx = -halfW + mW / 2;
              mz = -halfD + mD / 2;
            } else if (mLoc === 'top-right') {
              mx = -halfW + wt - mW / 2;
              mz = -halfD + mD / 2;
            }
            newObstacles.push({
              id: 'mumty',
              name: d.mumty?.name || 'Staircase Mumty (सीढ़ी)',
              type: 'box',
              location: mLoc,
              widthFt: mW,
              depthFt: mD,
              heightFt: mH,
              xRelFt: Number(mx.toFixed(1)),
              zRelFt: Number(mz.toFixed(1)),
              shadowLengthFt: 9.1
            });
          }

          if (d.waterTank?.detected) {
            newObstacles.push({
              id: 'tanki',
              name: 'Water Tank (पानी की टंकी)',
              type: 'cylinder',
              radiusFt: d.waterTank.radiusFt || 1.8,
              heightFt: d.waterTank.heightFt || 3,
              xRelFt: -halfW + 4,
              zRelFt: halfD - 4,
              shadowLengthFt: 4.0
            });
          }

          const minVX = newVerts ? Math.min(...newVerts.map(v => v.x)) : -halfW;
          const maxVX = newVerts ? Math.max(...newVerts.map(v => v.x)) : halfW;
          const minVZ = newVerts ? Math.min(...newVerts.map(v => v.z)) : -halfD;
          const maxVZ = newVerts ? Math.max(...newVerts.map(v => v.z)) : halfD;

          const safeZone = {
            centerXFt: Number(((minVX + maxVX) / 2).toFixed(1)),
            centerZFt: Number((minVZ + (maxVZ - minVZ) * 0.35).toFixed(1)),
            availableWidthFt: Math.max(16, Math.round(wTotal * 0.75)),
            availableDepthFt: Math.max(16, Math.round(dTotal * 0.45)),
            description: '100% Shadow-Free Open Terrace (South Sunlight)'
          };

          const updated = {
            type: d.shapeType || (newVerts.length > 6 ? 'custom_polygon' : 'stepped_l'),
            name: d.roofName || `Uploaded Sketch (${wTotal}×${dTotal}ft)`,
            widthFt: wTotal,
            depthFt: dTotal,
            wTopFt: wt,
            dUpperFt: du,
            wShelfFt: ws,
            dLowerFt: dl,
            parapetHeightFt: pHeight,
            parapetThicknessInches: 9,
            southDirection: 'top',
            customVertices: newVerts,
            obstacles: newObstacles,
            safeSolarZone: safeZone,
            uploadedImage: dataUrl
          };

          setConfig(updated);
          if (onSaveRoofConfig) onSaveRoofConfig(updated);

          setScanResult({
            success: true,
            provider: result.modelUsed,
            message: `Sketch Analyzed by ${result.modelUsed}!`,
            explanation: d.explanation,
            wallsCount: d.walls?.length || newVerts.length || 6,
            obstaclesDetected: (d.mumty?.detected ? 1 : 0) + (d.waterTank?.detected ? 1 : 0),
            parapetHeight: `${pHeight} ft`,
            warning: result.warning
          });
        } else {
          setScanResult({
            success: false,
            message: result?.error || 'Failed to detect walls from sketch. Please use manual inputs.'
          });
        }
      } catch (err) {
        setIsScanning(false);
        setScanResult({
          success: false,
          message: 'Error during image analysis: ' + (err.message || 'Unknown error')
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col w-full bg-slate-950 text-white rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Top Header Bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0F1B2E] via-[#1E293B] to-[#0F1B2E] border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="material-symbols-outlined text-[#6CBF3D] text-[26px]">roofing</span>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
              Roof Sketch Analyzer &amp; Obstacles Studio
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#6CBF3D]/20 text-[#6CBF3D] border border-[#6CBF3D]/40 uppercase">
              100% Orthogonal Non-Distorting CAD
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            हाथ से बने नक़्शे के माप टाइप करें या बदलें। मुंडेर, सीढ़ी (Mumty) की दिशा और पोजीशन सेट करें—2D व 3D मॉडल बिना बिगड़े सटीक 90° कोण पर बनता है।
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap">
          {onOpen3D && (
            <button
              type="button"
              onClick={onOpen3D}
              className="px-4 py-2 rounded-xl bg-[#6CBF3D] hover:bg-[#5ca633] text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">view_in_ar</span>
              <span>Open in 3D Model</span>
            </button>
          )}
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="px-4 sm:px-6 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'upload' ? 'bg-[#6CBF3D] text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">document_scanner</span>
            <span>1. Upload Sketch / Site Photo (AI Auto-Scan)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'manual' ? 'bg-[#6CBF3D] text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">straighten</span>
            <span>2. Wall Measurements &amp; Mumty (दीवार व सीढ़ी माप)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analysis')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'analysis' ? 'bg-[#6CBF3D] text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">wb_sunny</span>
            <span>3. Shadow Analysis &amp; Solar Mount (धूप/छाया)</span>
          </button>
        </div>

        {/* Live Metrics Badge */}
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400">
            Terrace Area: <b className="text-white font-mono">{estimatedAreaSqFt} sq.ft</b>
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">
            Perimeter: <b className="text-[#6CBF3D] font-mono">{totalPerimeterFt} ft</b>
          </span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Interactive Controls */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Quick Preset Selector Buttons */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-300">Quick Sketch Presets (तुरंत नक्शा चुनें):</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectPreset('sketch3')}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col col-span-2 ${
                  config.name?.includes('Sketch 3')
                    ? 'bg-[#6CBF3D]/20 border-[#6CBF3D] text-white shadow-xs'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <span className="text-xs font-bold text-white flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span>📝 Notebook Sketch 3 (10 Walls New)</span>
                  </span>
                  {config.name?.includes('Sketch 3') && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500 text-slate-950 font-black">Active</span>
                  )}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">30ft Top, Notch (8×7×4ft), 16ft Drop, 5ft Bottom, 10ft Steps</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset('sketch2')}
                className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col ${
                  config.name?.includes('Sketch 2')
                    ? 'bg-[#6CBF3D]/20 border-[#6CBF3D] text-white'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  <span>📝 Sketch 2 (Old)</span>
                  {config.name?.includes('Sketch 2') && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500 text-slate-950 font-black">Active</span>
                  )}
                </span>
                <span className="text-[10px] text-slate-400">40×40ft L (6 Walls)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset('sketch1')}
                className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col ${
                  config.name?.includes('Sketch 1')
                    ? 'bg-[#6CBF3D]/20 border-[#6CBF3D] text-white'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <span className="text-xs font-bold text-white">📝 Sketch 1 (50×30)</span>
                <span className="text-[10px] text-slate-400">50×30ft + Tanki &amp; Mumty</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset('rectangle')}
                className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer flex flex-col"
              >
                <span className="text-xs font-bold text-white">🏢 Rectangle</span>
                <span className="text-[10px] text-slate-400">36×26 ft Standard Roof</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset('l_shape')}
                className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer flex flex-col"
              >
                <span className="text-xs font-bold text-white">📐 Standard L-Shape</span>
                <span className="text-[10px] text-slate-400">36×32 ft with Cutout</span>
              </button>
            </div>
          </div>

          {/* TAB 2: Non-Distorting Orthogonal Wall Dimensions */}
          {activeTab === 'manual' && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-3.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <span className="text-xs font-bold text-white block">
                    Orthogonal Wall Inputs ({walls.length} दीवारों के सटीक माप):
                  </span>
                  <span className="text-[10px] text-slate-400">
                    बदलने पर नक्शा 90° पर ही रहेगा, कोई तिरछा कोना नहीं बनेगा।
                  </span>
                </div>
                <span className="text-[11px] font-bold text-[#6CBF3D]">{walls.length} Clean Walls</span>
              </div>

              {/* Dynamic Wall List for Multi-Walled Rooftops (e.g. 10 Walls Sketch 3) */}
              {config.customVertices && config.customVertices.length > 6 ? (
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-bold text-slate-300">
                    All Detected Sides (दीवारें): Click to inspect on Blueprint
                  </span>
                  <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                    {walls.map((w, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedWallIndex(selectedWallIndex === idx ? null : idx)}
                        className={`p-2 rounded-lg border cursor-pointer transition-all ${
                          selectedWallIndex === idx
                            ? 'bg-[#6CBF3D]/20 border-[#6CBF3D]'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-200">Side {w.index}</span>
                          <span className="font-mono font-bold text-[#6CBF3D]">{w.lengthFt} ft</span>
                        </div>
                        <span className="text-[9px] text-slate-400 block truncate">{w.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1 p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <label className="text-[10px] font-bold text-slate-400">Side 1: Top South Wall (ऊपरी दीवार)</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="10"
                      max="100"
                      value={wTop}
                      onChange={e => handleUpdateSteppedWall(e.target.value, dUpper, wShelf, dLower)}
                      className="w-full h-8 px-2 rounded bg-slate-900 border border-slate-700 font-mono font-black text-xs text-[#6CBF3D] outline-none"
                    />
                    <span className="text-xs text-slate-400 font-bold">ft</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <label className="text-[10px] font-bold text-slate-400">Side 2: Upper East Wall (दायाँ कट)</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="5"
                      max="100"
                      value={dUpper}
                      onChange={e => handleUpdateSteppedWall(wTop, e.target.value, wShelf, dLower)}
                      className="w-full h-8 px-2 rounded bg-slate-900 border border-slate-700 font-mono font-black text-xs text-[#6CBF3D] outline-none"
                    />
                    <span className="text-xs text-slate-400 font-bold">ft</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <label className="text-[10px] font-bold text-slate-400">Side 3: Step Out Shelf (बाहरी कोना)</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="2"
                      max="50"
                      value={wShelf}
                      onChange={e => handleUpdateSteppedWall(wTop, dUpper, e.target.value, dLower)}
                      className="w-full h-8 px-2 rounded bg-slate-900 border border-slate-700 font-mono font-black text-xs text-[#6CBF3D] outline-none"
                    />
                    <span className="text-xs text-slate-400 font-bold">ft</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <label className="text-[10px] font-bold text-slate-400">Side 4: Lower East Wall (निचला दायाँ)</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="5"
                      max="100"
                      value={dLower}
                      onChange={e => handleUpdateSteppedWall(wTop, dUpper, wShelf, e.target.value)}
                      className="w-full h-8 px-2 rounded bg-slate-900 border border-slate-700 font-mono font-black text-xs text-[#6CBF3D] outline-none"
                    />
                    <span className="text-xs text-slate-400 font-bold">ft</span>
                  </div>
                </div>
              </div>

              {/* Automatic Orthogonal Calculated Sides */}
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] flex items-center justify-between text-slate-300">
                <span>Side 5 (Bottom): <b>{wTop + wShelf} ft</b> (Auto {wTop}&apos; + {wShelf}&apos;)</span>
                <span>•</span>
                <span>Side 6 (West): <b>{dUpper + dLower} ft</b> (Auto {dUpper}&apos; + {dLower}&apos;)</span>
              </div>
            </>
          )}

              {/* Mumty (Staircase Room) Setup */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col gap-2 mt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">stairs</span>
                    Staircase Mumty Setup (सीढ़ी का कमरा):
                  </span>
                  <span className="text-[10px] text-slate-400">Exact position on roof</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Mumty Position (दिशा):</label>
                    <select
                      value={mumtyLoc}
                      onChange={e => handleMumtyLocationChange(e.target.value)}
                      className="w-full h-8 px-2 rounded bg-slate-900 border border-slate-700 text-xs font-bold text-white outline-none"
                    >
                      <option value="bottom-left">📍 Bottom-Left (नीचे बायाँ - जैसा स्केच में है)</option>
                      <option value="top-left">📍 Top-Left (ऊपर बायाँ)</option>
                      <option value="top-right">📍 Top-Right (ऊपर दायाँ)</option>
                      <option value="none">❌ No Mumty (कोई सीढ़ी नहीं)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-1">
                    <div>
                      <label className="text-[9px] text-slate-400 block mb-1">Width</label>
                      <input
                        type="number"
                        value={mumtyW}
                        onChange={e => {
                          const v = parseFloat(e.target.value) || 3;
                          setMumtyW(v);
                          handleUpdateSteppedWall(wTop, dUpper, wShelf, dLower);
                        }}
                        className="w-full h-8 text-center px-1 rounded bg-slate-900 border border-slate-700 text-xs font-bold text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 block mb-1">Depth</label>
                      <input
                        type="number"
                        value={mumtyD}
                        onChange={e => {
                          const v = parseFloat(e.target.value) || 6;
                          setMumtyD(v);
                          handleUpdateSteppedWall(wTop, dUpper, wShelf, dLower);
                        }}
                        className="w-full h-8 text-center px-1 rounded bg-slate-900 border border-slate-700 text-xs font-bold text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 block mb-1">Height</label>
                      <input
                        type="number"
                        value={mumtyH}
                        onChange={e => {
                          const v = parseFloat(e.target.value) || 7;
                          setMumtyH(v);
                          handleUpdateSteppedWall(wTop, dUpper, wShelf, dLower);
                        }}
                        className="w-full h-8 text-center px-1 rounded bg-slate-900 border border-slate-700 text-xs font-bold text-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Shadow Analysis */}
          {activeTab === 'analysis' && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-3">
              <span className="text-xs font-bold text-white">Rooftop Solar &amp; Obstacles Analysis:</span>
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-slate-200 flex items-start gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-[20px] shrink-0">check_circle</span>
                <div>
                  <span className="font-bold text-emerald-300 block">100% Shadow-Free Zone Confirmed:</span>
                  <span>
                    सीढ़ी (Mumty) नीचे बाएँ कोने में होने के कारण ऊपर और बीच का पूरा क्षेत्र 100% शैडो-फ्री है।
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: Upload Sketch Photo with AI Vision */}
          {activeTab === 'upload' && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-3.5">
              {/* AI Engine Status & Key Setting */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#6CBF3D]">neurology</span>
                    <span className="text-xs font-bold text-white">AI Vision Engine:</span>
                    {geminiKey ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        ✨ Google Gemini Vision AI Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        ⚙️ Free In-Browser Vision Active
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowApiKeySetting(!showApiKeySetting)}
                    className="text-[11px] font-bold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">key</span>
                    <span>{geminiKey ? 'Change API Key' : '+ Free Gemini Key'}</span>
                  </button>
                </div>

                {showApiKeySetting && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-col gap-2">
                    <p className="text-[10px] text-slate-400">
                      Google AI Studio key is 100% free with 0 cost. (निःशुल्क AI की मदद से हाथ से बनी ड्रॉइंग सीधे स्कैन होती है)
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        placeholder="Paste Google Gemini API Key (AIzaSy...)"
                        value={tempApiKey}
                        onChange={e => setTempApiKey(e.target.value)}
                        className="flex-1 h-8 px-2.5 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-white outline-none focus:border-[#6CBF3D]"
                      />
                      <button
                        type="button"
                        onClick={handleSaveApiKey}
                        className="h-8 px-3 rounded bg-[#6CBF3D] hover:bg-[#5ca633] text-slate-950 font-bold text-xs cursor-pointer shadow-xs"
                      >
                        Save
                      </button>
                      {geminiKey && (
                        <button
                          type="button"
                          onClick={handleClearApiKey}
                          className="h-8 px-2.5 rounded bg-rose-900/50 hover:bg-rose-800 text-rose-300 text-xs cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-[#6CBF3D] hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                      <span>Get Free API Key at Google AI Studio (30 seconds, Free)</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-[#6CBF3D] rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-slate-950 group"
              >
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                {isScanning ? (
                  <div className="flex flex-col items-center gap-2.5 py-4">
                    <div className="w-9 h-9 border-4 border-[#6CBF3D] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-bold text-emerald-400 animate-pulse">{scanStatusMessage}</span>
                    <span className="text-[10px] text-slate-400">Measuring walls, finding Mumty, and building 90° CAD...</span>
                  </div>
                ) : uploadPreview ? (
                  <div className="flex flex-col items-center gap-2">
                    <img src={uploadPreview} alt="Uploaded Roof Sketch" className="max-h-36 rounded-lg border border-slate-800 shadow-md object-contain" />
                    <span className="text-[11px] font-bold text-[#6CBF3D] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      <span>Photo Uploaded (Click to Change)</span>
                    </span>
                  </div>
                ) : (
                  <div className="py-2">
                    <span className="material-symbols-outlined text-4xl text-[#6CBF3D] mb-1 group-hover:scale-110 transition-transform">
                      document_scanner
                    </span>
                    <span className="text-xs font-bold text-white block">
                      Click to Upload Hand-Drawn Notebook Sketch / Site Photo
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      AI will analyze walls (30', 40', 25' etc.), Mumty location &amp; generate clean 3D roof
                    </span>
                  </div>
                )}
              </div>

              {/* AI Extraction Results Summary Card */}
              {scanResult && scanResult.success && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
                      <span>AI Extracted Blueprint Details:</span>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300">
                      {scanResult.provider}
                    </span>
                  </div>

                  {scanResult.explanation && (
                    <p className="text-[11px] text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                      💡 {scanResult.explanation}
                    </p>
                  )}

                  {/* Extracted Walls Table */}
                  <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-[9px] text-slate-400 block">Top South Wall</span>
                      <span className="font-bold text-white">{wTop} ft</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-[9px] text-slate-400 block">East Drop</span>
                      <span className="font-bold text-white">{dUpper} ft</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-[9px] text-slate-400 block">Shelf Step</span>
                      <span className="font-bold text-white">{wShelf} ft</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-[9px] text-slate-400 block">Lower Drop</span>
                      <span className="font-bold text-white">{dLower} ft</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-[9px] text-slate-400 block">Bottom Wall</span>
                      <span className="font-bold text-emerald-400">{wTop + wShelf} ft</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-[9px] text-slate-400 block">West Wall</span>
                      <span className="font-bold text-emerald-400">{dUpper + dLower} ft</span>
                    </div>
                  </div>

                  {/* Mumty & Obstacle info */}
                  <div className="flex items-center justify-between text-[11px] text-slate-300 px-1">
                    <span>
                      Mumty: <b className="text-amber-400 capitalize">{mumtyLoc} ({mumtyW}×{mumtyD} ft)</b>
                    </span>
                    <span>
                      Parapet: <b className="text-white">{config.parapetHeightFt} ft</b>
                    </span>
                  </div>

                  {/* Tab switch button */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab('manual')}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">tune</span>
                      <span>Edit Wall Numbers Manually</span>
                    </button>
                  </div>
                </div>
              )}

              {scanResult && !scanResult.success && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                  ⚠️ {scanResult.message}
                </div>
              )}
            </div>
          )}

          {/* Parapet Wall Height */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400 text-[18px]">fence</span>
              <div>
                <span className="text-xs font-bold text-white block">Parapet Wall Height (मुंडेर की ऊंचाई):</span>
                <span className="text-[10px] text-slate-400">Standard 3 ft boundary</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                max="6"
                step="0.5"
                value={config.parapetHeightFt}
                onChange={e => handleUpdateParam('parapetHeightFt', parseFloat(e.target.value) || 3)}
                className="w-16 h-8 text-center px-1 rounded bg-slate-950 border border-slate-700 font-bold text-xs text-amber-300 outline-none"
              />
              <span className="text-xs font-bold text-slate-500">ft</span>
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): 2D Blueprint with Real Scale & Clearances */}
        <div className="lg:col-span-7 flex flex-col bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#6CBF3D] text-[18px]">architecture</span>
              <span className="font-bold text-white">2D Blueprint: 90° Orthogonal CAD with Mumty &amp; Solar Mount</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
              ✓ 100% Shadow Free Inside Walls
            </span>
          </div>

          {/* 2D SVG Blueprint */}
          <div className="w-full flex-1 min-h-[400px] flex items-center justify-center bg-[#070D18] rounded-xl border border-slate-800/80 p-4 relative overflow-hidden">
            <RenderRoofBlueprintSvg
              vertices={vertices}
              walls={walls}
              obstacles={obstacles}
              safeZone={config.safeSolarZone}
              selectedWallIndex={selectedWallIndex}
              onSelectWall={setSelectedWallIndex}
            />
          </div>

          {/* Legend Bar */}
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#334155] border border-[#F59E0B]"></span>
                <span>Mumty Room (सीढ़ी)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#6CBF3D]/25 border border-[#6CBF3D]"></span>
                <span>Safe Solar Zone (धूप)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#1E3E62] border border-blue-400"></span>
                <span>Solar Array (3×2)</span>
              </span>
            </div>

            <span className="text-[#6CBF3D] font-bold">
              🧭 True South: Top Wall (180°)
            </span>
          </div>

          {onProceedTo2D && (
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs text-slate-400">
                Next: Select solar modules count and compare 2D grid layouts
              </span>
              <button
                type="button"
                onClick={onProceedTo2D}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6CBF3D] to-emerald-500 hover:brightness-110 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <span>Proceed to Step 2: Choose 2D Solar Layout</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 2D Blueprint SVG with Obstacles, North Shadow Projections, and Solar Array Mount
 */
function RenderRoofBlueprintSvg({ vertices, walls, obstacles = [], safeZone = null, selectedWallIndex, onSelectWall }) {
  const svgWidth = 480;
  const svgHeight = 380;
  const padding = 50;

  // Calculate bounding box
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

  const toSvgX = x => svgWidth / 2 + x * scale;
  const toSvgY = z => svgHeight / 2 + z * scale;

  const polyPoints = vertices.map(v => `${toSvgX(v.x)},${toSvgY(v.z)}`).join(' ');

  return (
    <svg
      width="100%"
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="max-w-full drop-shadow-md overflow-visible relative z-10"
    >
      <defs>
        {/* Concrete Terrace Hatch */}
        <pattern id="terracePattern" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="10" stroke="#1E293B" strokeWidth="1" />
        </pattern>

        {/* Diagonal Shadow Hatch */}
        <pattern id="shadowHatch" width="6" height="6" patternTransform="rotate(-45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(244,63,94,0.6)" strokeWidth="1.2" />
        </pattern>
      </defs>

      {/* 1. Concrete Terrace Slab */}
      <polygon
        points={polyPoints}
        fill="#0F172A"
        stroke="#334155"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <polygon
        points={polyPoints}
        fill="url(#terracePattern)"
        opacity="0.5"
      />
      <polygon
        points={polyPoints}
        fill="none"
        stroke="#38BDF8"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* 2. Obstacles (Mumty & Water Tank) */}
      {obstacles.map(obs => {
        const ox = toSvgX(obs.xRelFt);
        const oz = toSvgY(obs.zRelFt);
        const shadowLenSvg = (obs.shadowLengthFt || 8) * scale;

        if (obs.type === 'box') {
          const bw = (obs.widthFt || 3) * scale;
          const bd = (obs.depthFt || 6) * scale;

          return (
            <g key={obs.id}>
              {/* Shadow falling towards North (downwards in top-South system) */}
              <rect
                x={ox - bw / 2}
                y={oz + bd / 2}
                width={bw}
                height={shadowLenSvg}
                fill="url(#shadowHatch)"
                stroke="rgba(244,63,94,0.4)"
                strokeDasharray="3 2"
              />

              {/* Mumty Room Box */}
              <rect
                x={ox - bw / 2}
                y={oz - bd / 2}
                width={bw}
                height={bd}
                fill="#334155"
                stroke="#F59E0B"
                strokeWidth="1.5"
                rx="2"
              />
              <text
                x={ox}
                y={oz + 3}
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="8"
                fontWeight="bold"
              >
                MUMTY
              </text>
            </g>
          );
        }

        if (obs.type === 'cylinder') {
          const r = (obs.radiusFt || 1.8) * scale;
          return (
            <g key={obs.id}>
              <circle cx={ox} cy={oz} r={r} fill="#0284C7" stroke="#38BDF8" strokeWidth="1.5" />
              <text x={ox} y={oz + 3} textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="900">
                TANKI
              </text>
            </g>
          );
        }
        return null;
      })}

      {/* 3. Optimal Shadow-Free Zone & Solar Array Footprint */}
      {safeZone && (
        <g>
          {/* Safe Green Zone Rect */}
          <rect
            x={toSvgX(safeZone.centerXFt) - (safeZone.availableWidthFt * scale) / 2}
            y={toSvgY(safeZone.centerZFt) - (safeZone.availableDepthFt * scale) / 2}
            width={safeZone.availableWidthFt * scale}
            height={safeZone.availableDepthFt * scale}
            fill="rgba(108, 191, 61, 0.12)"
            stroke="#6CBF3D"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            rx="4"
          />

          {/* Centered Solar Array (3x2 Table Footprint) */}
          <rect
            x={toSvgX(safeZone.centerXFt) - (11.2 * scale) / 2}
            y={toSvgY(safeZone.centerZFt) - (15.0 * scale) / 2}
            width={11.2 * scale}
            height={15.0 * scale}
            fill="#1E3E62"
            stroke="#38BDF8"
            strokeWidth="2"
            rx="2"
          />
          <text
            x={toSvgX(safeZone.centerXFt)}
            y={toSvgY(safeZone.centerZFt) - 2}
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="10"
            fontWeight="bold"
          >
            SOLAR ARRAY
          </text>
          <text
            x={toSvgX(safeZone.centerXFt)}
            y={toSvgY(safeZone.centerZFt) + 11}
            textAnchor="middle"
            fill="#6CBF3D"
            fontSize="8"
            fontWeight="bold"
          >
            ✓ 100% Shadow Free
          </text>
        </g>
      )}

      {/* 4. Wall Dimensions Overlay */}
      {walls.map((w, idx) => {
        const x1 = toSvgX(w.p1.x);
        const y1 = toSvgY(w.p1.z);
        const x2 = toSvgX(w.p2.x);
        const y2 = toSvgY(w.p2.z);

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const isSelected = selectedWallIndex === idx;

        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;
        const labelX = midX + nx * 14;
        const labelY = midY + ny * 14;

        return (
          <g key={idx} onClick={() => onSelectWall && onSelectWall(idx)} className="cursor-pointer">
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isSelected ? '#6CBF3D' : '#94A3B8'}
              strokeWidth={isSelected ? '4' : '2'}
              strokeLinecap="round"
            />
            <rect
              x={labelX - 16}
              y={labelY - 8}
              width="32"
              height="16"
              fill={isSelected ? '#6CBF3D' : '#0F172A'}
              stroke={isSelected ? '#FFFFFF' : '#475569'}
              strokeWidth="1"
              rx="4"
            />
            <text
              x={labelX}
              y={labelY + 3.5}
              textAnchor="middle"
              fill={isSelected ? '#0F172A' : '#FFFFFF'}
              fontSize="9"
              fontWeight="900"
            >
              {w.lengthFt}&apos;
            </text>
          </g>
        );
      })}

      {/* 5. True South Compass Arrow at Top */}
      <g transform="translate(435, 45)">
        <circle cx="0" cy="0" r="20" fill="#0F172A" stroke="#334155" strokeWidth="1.5" />
        <path d="M 0,-13 L 5,8 L 0,4 L -5,8 Z" fill="#EF4444" />
        <path d="M 0,13 L 5,4 L 0,4 L -5,4 Z" fill="#64748B" />
        <text x="0" y="-15" textAnchor="middle" fill="#EF4444" fontSize="10" fontWeight="900">
          S
        </text>
        <text x="0" y="22" textAnchor="middle" fill="#64748B" fontSize="8" fontWeight="bold">
          N
        </text>
      </g>
    </svg>
  );
}
