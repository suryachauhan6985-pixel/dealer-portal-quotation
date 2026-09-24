import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { calculateLegHeights, calculateGiPipeSections } from '../../utils/solarLayoutEngine';

export default function SolarStructure3DViewer({
  layout,
  moduleDims,
  initialFrontLegHeightFt = 2.5,
  tiltDegrees = 18
}) {
  const mountRef = useRef(null);
  const [frontLegFt, setFrontLegFt] = useState(initialFrontLegHeightFt || 2.5);
  const [viewPreset, setViewPreset] = useState('orbit'); // 'orbit', 'top', 'side', 'front'
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);

  // Calculate elevation and pipe cuts based on frontLegFt
  const elevation = useMemo(() => {
    return calculateLegHeights(layout, frontLegFt, tiltDegrees);
  }, [layout, frontLegFt, tiltDegrees]);

  const pipeSections = useMemo(() => {
    return calculateGiPipeSections(layout, frontLegFt, tiltDegrees);
  }, [layout, frontLegFt, tiltDegrees]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 420;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF1F5F9); // Light slate outdoor sky

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(6, 5, 8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Don't go below ground
    controls.minDistance = 2;
    controls.maxDistance = 25;
    controlsRef.current = controls;

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff8e7, 1.3);
    sunLight.position.set(5, 12, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 30;
    sunLight.shadow.camera.left = -10;
    sunLight.shadow.camera.right = 10;
    sunLight.shadow.camera.top = 10;
    sunLight.shadow.camera.bottom = -10;
    scene.add(sunLight);

    // Secondary fill light
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x94a3b8, 0.4);
    scene.add(hemiLight);

    // 4. Rooftop Concrete Terrace Floor
    const roofWidthM = Math.max(10, (layout.widthMm / 1000) + 4);
    const roofDepthM = Math.max(10, (layout.depthMm / 1000) + 4);

    const floorGeo = new THREE.BoxGeometry(roofWidthM, 0.3, roofDepthM);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xE2E8F0,
      roughness: 0.85,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.15;
    floor.receiveShadow = true;
    scene.add(floor);

    // Terrace Parapet Wall
    const parapetHeight = 0.9; // 3 ft parapet
    const parapetThickness = 0.2;
    const parapetMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, roughness: 0.9 });

    // North Parapet
    const pNorth = new THREE.Mesh(new THREE.BoxGeometry(roofWidthM, parapetHeight, parapetThickness), parapetMat);
    pNorth.position.set(0, parapetHeight / 2, -roofDepthM / 2 + parapetThickness / 2);
    pNorth.castShadow = true;
    scene.add(pNorth);

    // South Parapet
    const pSouth = new THREE.Mesh(new THREE.BoxGeometry(roofWidthM, parapetHeight, parapetThickness), parapetMat);
    pSouth.position.set(0, parapetHeight / 2, roofDepthM / 2 - parapetThickness / 2);
    pSouth.castShadow = true;
    scene.add(pSouth);

    // East Parapet
    const pEast = new THREE.Mesh(new THREE.BoxGeometry(parapetThickness, parapetHeight, roofDepthM), parapetMat);
    pEast.position.set(roofWidthM / 2 - parapetThickness / 2, parapetHeight / 2, 0);
    pEast.castShadow = true;
    scene.add(pEast);

    // West Parapet
    const pWest = new THREE.Mesh(new THREE.BoxGeometry(parapetThickness, parapetHeight, roofDepthM), parapetMat);
    pWest.position.set(-roofWidthM / 2 + parapetThickness / 2, parapetHeight / 2, 0);
    pWest.castShadow = true;
    scene.add(pWest);

    // 5. Structure Elements (GI Steel Materials)
    const giMat = new THREE.MeshStandardMaterial({
      color: 0xD8DFE7,
      metalness: 0.85,
      roughness: 0.25
    });

    const basePlateMat = new THREE.MeshStandardMaterial({
      color: 0x64748B,
      metalness: 0.9,
      roughness: 0.3
    });

    // Structure dimensions in meters
    const arrayWM = layout.widthMm / 1000;
    const arrayDM = layout.depthMm / 1000;
    const frontHM = elevation.frontLegHeightMm / 1000;
    const rearHM = elevation.rearLegHeightMm / 1000;
    const legPairs = layout.bom?.frontLegs || 2;
    const legSpacing = arrayWM / Math.max(1, legPairs - 1);

    const structureGroup = new THREE.Group();

    // 60x40 mm GI Columns (Legs) & 40x40 mm Base Plates
    const colWidth = 0.06;
    const colDepth = 0.04;
    const basePlateGeo = new THREE.BoxGeometry(0.18, 0.015, 0.18);

    const frontZ = arrayDM * 0.45; // South front
    const rearZ = -arrayDM * 0.45; // North rear

    for (let i = 0; i < legPairs; i++) {
      const x = -arrayWM / 2 + (i * legSpacing);

      // Front Leg Column
      const fLegGeo = new THREE.BoxGeometry(colWidth, frontHM, colDepth);
      const fLeg = new THREE.Mesh(fLegGeo, giMat);
      fLeg.position.set(x, frontHM / 2, frontZ);
      fLeg.castShadow = true;
      structureGroup.add(fLeg);

      // Front Base Plate
      const fPlate = new THREE.Mesh(basePlateGeo, basePlateMat);
      fPlate.position.set(x, 0.008, frontZ);
      fPlate.receiveShadow = true;
      structureGroup.add(fPlate);

      // Rear Leg Column
      const rLegGeo = new THREE.BoxGeometry(colWidth, rearHM, colDepth);
      const rLeg = new THREE.Mesh(rLegGeo, giMat);
      rLeg.position.set(x, rearHM / 2, rearZ);
      rLeg.castShadow = true;
      structureGroup.add(rLeg);

      // Rear Base Plate
      const rPlate = new THREE.Mesh(basePlateGeo, basePlateMat);
      rPlate.position.set(x, 0.008, rearZ);
      rPlate.receiveShadow = true;
      structureGroup.add(rPlate);

      // 40x40 mm Rafter connecting Front to Rear Leg at tilt slope
      const rafterLen = Math.sqrt(Math.pow(rearHM - frontHM, 2) + Math.pow(frontZ - rearZ, 2));
      const rafterAngle = Math.atan2(rearHM - frontHM, rearZ - frontZ); // negative tilt angle
      const rafterGeo = new THREE.BoxGeometry(0.04, 0.04, rafterLen);
      const rafter = new THREE.Mesh(rafterGeo, giMat);
      rafter.position.set(x, (frontHM + rearHM) / 2 + 0.02, (frontZ + rearZ) / 2);
      rafter.rotation.x = -rafterAngle - Math.PI;
      rafter.castShadow = true;
      structureGroup.add(rafter);
    }

    // 40x40 mm Purlins running across width
    const rowCount = layout.rows?.length || 1;
    const purlinGeo = new THREE.BoxGeometry(arrayWM + 0.1, 0.04, 0.04);
    for (let r = 0; r < rowCount; r++) {
      // 2 purlins per row of modules
      const rowFraction1 = (r * 2 + 0.4) / (rowCount * 2);
      const rowFraction2 = (r * 2 + 1.6) / (rowCount * 2);

      [rowFraction1, rowFraction2].forEach(frac => {
        const pz = frontZ - (frac * (frontZ - rearZ));
        const py = frontHM + (frac * (rearHM - frontHM)) + 0.04;

        const purlin = new THREE.Mesh(purlinGeo, giMat);
        purlin.position.set(0, py, pz);
        purlin.castShadow = true;
        structureGroup.add(purlin);
      });
    }

    // 6. Solar PV Modules (Deep Navy Blue Photovoltaic Glass + Aluminium Bezel)
    const pvGlassMat = new THREE.MeshStandardMaterial({
      color: 0x0B192C,
      roughness: 0.15,
      metalness: 0.95
    });

    const pvFrameMat = new THREE.MeshStandardMaterial({
      color: 0xCBD5E1,
      metalness: 0.85,
      roughness: 0.25
    });

    // Render individual modules in the layout
    const tiltAngle = Math.atan2(rearHM - frontHM, frontZ - rearZ);

    let currentZ = frontZ;
    (layout.rows || []).forEach((row) => {
      const rowPanels = Array.isArray(row) ? row : [];
      if (rowPanels.length === 0) return;

      const firstPanel = rowPanels[0];
      const panelH = firstPanel.heightMm / 1000;
      const totalRowW = rowPanels.reduce((acc, p) => acc + (p.widthMm / 1000), 0);
      let currentX = -totalRowW / 2;

      rowPanels.forEach(panel => {
        const pw = (panel.widthMm / 1000) - 0.02; // leave 20mm gap between panels
        const ph = (panel.heightMm / 1000) - 0.02;

        const panelGroup = new THREE.Group();

        // Aluminium Frame
        const frame = new THREE.Mesh(new THREE.BoxGeometry(pw, 0.03, ph), pvFrameMat);
        frame.castShadow = true;
        panelGroup.add(frame);

        // Blue PV Glass
        const glass = new THREE.Mesh(new THREE.BoxGeometry(pw - 0.02, 0.032, ph - 0.02), pvGlassMat);
        glass.castShadow = true;
        panelGroup.add(glass);

        // Position panel at tilt slope
        const centerFrac = Math.abs(currentZ - frontZ) / Math.abs(rearZ - frontZ);
        const py = frontHM + (centerFrac * (rearHM - frontHM)) + 0.06;

        panelGroup.position.set(currentX + pw / 2, py, currentZ - (ph / 2) * Math.cos(tiltAngle));
        panelGroup.rotation.x = tiltAngle;
        structureGroup.add(panelGroup);

        currentX += (panel.widthMm / 1000);
      });

      currentZ -= panelH * Math.cos(tiltAngle);
    });

    scene.add(structureGroup);

    // 7. True South Compass Arrow on Floor
    const compassGroup = new THREE.Group();
    const arrowDir = new THREE.Vector3(0, 0, 1); // Z-positive is South
    const arrowOrigin = new THREE.Vector3(0, 0.02, frontZ + 1.2);
    const arrowHelper = new THREE.ArrowHelper(arrowDir, arrowOrigin, 1.2, 0xEF4444, 0.35, 0.25);
    compassGroup.add(arrowHelper);
    scene.add(compassGroup);

    // 8. Animation Loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      controls.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [layout, elevation]);

  // Handle Camera Presets
  const setCameraPreset = (preset) => {
    setViewPreset(preset);
    const controls = controlsRef.current;
    const camera = cameraRef.current;
    if (!controls || !camera) return;

    if (preset === 'top') {
      camera.position.set(0, 10, 0.1);
      controls.target.set(0, 0, 0);
    } else if (preset === 'side') {
      camera.position.set(8, 2, 0);
      controls.target.set(0, 1.5, 0);
    } else if (preset === 'front') {
      camera.position.set(0, 2, 8);
      controls.target.set(0, 1.5, 0);
    } else {
      camera.position.set(6, 5, 8);
      controls.target.set(0, 1, 0);
    }
    controls.update();
  };

  return (
    <div className="flex flex-col w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
      {/* 3D Top Header Bar */}
      <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#6CBF3D] text-[20px]">view_in_ar</span>
          <span className="font-bold text-sm">Interactive 3D Solar Rooftop &amp; Structure Model</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-500/20 text-blue-400 border border-blue-500/40 uppercase">
            Three.js WebGL
          </span>
        </div>

        {/* Camera View Presets */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
          <span className="text-[11px] text-slate-400 font-semibold px-1.5">View:</span>
          {[
            { id: 'orbit', label: '3D Orbit', icon: '3d_rotation' },
            { id: 'top', label: 'Top (South)', icon: 'vertical_align_top' },
            { id: 'side', label: 'Side Slope', icon: 'straighten' },
            { id: 'front', label: 'Front', icon: 'crop_landscape' }
          ].map(btn => (
            <button
              key={btn.id}
              type="button"
              onClick={() => setCameraPreset(btn.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                viewPreset === btn.id
                  ? 'bg-[#6CBF3D] text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">{btn.icon}</span>
              <span>{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div className="relative w-full h-[400px] sm:h-[460px] bg-slate-900 cursor-grab active:cursor-grabbing">
        <div ref={mountRef} className="w-full h-full" />

        {/* Orbit Instructions Overlay */}
        <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2 pointer-events-none shadow-md">
          <span className="material-symbols-outlined text-[16px] text-[#6CBF3D]">touch_app</span>
          <span>Left-Click Drag: Rotate 360° • Scroll: Zoom • Right-Click: Pan</span>
        </div>

        {/* South Orientation Badge */}
        <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-rose-500/40 text-xs font-bold text-white flex items-center gap-1.5 shadow-md">
          <span className="material-symbols-outlined text-rose-500 text-[16px] animate-pulse">explore</span>
          <span>🧭 South Facing (180° Azimuth)</span>
        </div>

        {/* Live Elevation Info Overlay */}
        <div className="absolute top-3 right-3 bg-slate-950/85 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 text-xs text-white flex flex-col gap-1 shadow-md text-right">
          <div className="text-[11px] text-slate-400 font-semibold">Slope Profile:</div>
          <div>Front Leg Height: <b className="text-[#6CBF3D]">{elevation.frontLegHeightFt} ft</b> ({elevation.frontLegHeightMm} mm)</div>
          <div>Rear Leg Height: <b className="text-amber-400">{elevation.rearLegHeightFt} ft</b> ({elevation.rearLegHeightMm} mm)</div>
          <div>Tilt Angle: <b className="text-white">{elevation.tiltDegrees}° Gujarat Standard</b></div>
        </div>
      </div>

      {/* Interactive Height Adjuster & GI Pipe Cutting Summary */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col gap-4 text-white">
        {/* Front Leg Height Slider */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-[22px]">height</span>
            <div>
              <span className="text-xs font-bold block text-white">
                Customize Front Leg Height (आगे के पैर की ऊंचाई):
              </span>
              <span className="text-[11px] text-slate-400">
                Rear leg automatically adjusts to maintain optimal 18° South tilt angle.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1.5"
              max="6.0"
              step="0.1"
              value={frontLegFt}
              onChange={(e) => setFrontLegFt(parseFloat(e.target.value))}
              className="w-36 accent-[#6CBF3D] cursor-pointer"
            />
            <span className="w-16 text-center px-2 py-1 rounded bg-slate-800 border border-slate-700 font-black text-xs text-[#6CBF3D]">
              {frontLegFt} ft
            </span>
          </div>
        </div>

        {/* 20-Ft Standard GI Pipe Cutting Optimization Schedule */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 60x40 Pipe (Columns/Legs) */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                60mm × 40mm GI Pipe (Legs / Columns)
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {pipeSections.legs60x40.totalPipesCount} Pipes (20-ft Standard)
              </span>
            </div>
            <div className="text-[11px] text-slate-300">
              Total Required: <b>{pipeSections.legs60x40.totalLengthFt} ft</b> (From {pipeSections.legs60x40.totalPipesFeet} ft stock)
            </div>
            <div className="flex flex-col gap-1.5 mt-1">
              {pipeSections.legs60x40.pipes.map(p => (
                <div key={p.pipeIndex} className="p-2 rounded bg-slate-950/80 border border-slate-800/80 text-[11px] flex flex-col gap-1">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-bold text-white">Pipe #{p.pipeIndex} (20 ft):</span>
                    <span>Used: <b className="text-white">{p.usedFt} ft</b> | Scrap: <b className="text-amber-400">{p.remainingFt} ft</b></span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Cuts: {p.cuts.map(c => `${c.label} (${c.lengthFt} ft)`).join(' + ')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 40x40 Pipe (Rafters & Purlins) */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                40mm × 40mm GI Pipe (Rafters &amp; Purlins)
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {pipeSections.raftersPurlins40x40.totalPipesCount} Pipes (20-ft Standard)
              </span>
            </div>
            <div className="text-[11px] text-slate-300">
              Total Required: <b>{pipeSections.raftersPurlins40x40.totalLengthFt} ft</b> (From {pipeSections.raftersPurlins40x40.totalPipesFeet} ft stock)
            </div>
            <div className="flex flex-col gap-1.5 mt-1 max-h-[160px] overflow-y-auto pr-1">
              {pipeSections.raftersPurlins40x40.pipes.map(p => (
                <div key={p.pipeIndex} className="p-2 rounded bg-slate-950/80 border border-slate-800/80 text-[11px] flex flex-col gap-1">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-bold text-white">Pipe #{p.pipeIndex} (20 ft):</span>
                    <span>Used: <b className="text-white">{p.usedFt} ft</b> | Scrap: <b className="text-amber-400">{p.remainingFt} ft</b></span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    Cuts: {p.cuts.map(c => `${c.label} (${c.lengthFt} ft)`).join(' + ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
