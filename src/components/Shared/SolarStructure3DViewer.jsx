import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { calculateLegHeights, calculateGiPipeSections } from '../../utils/solarLayoutEngine';
import { getRoofPolygonVertices, getRoofWalls, DEFAULT_ROOF_CONFIG } from './RooftopDesigner';

export default function SolarStructure3DViewer({
  layout,
  moduleDims,
  initialFrontLegHeightFt = 2.5,
  tiltDegrees = 18,
  roofConfig = null,
  onOpenRoofDesigner = null
}) {
  const mountRef = useRef(null);
  const [frontLegFt, setFrontLegFt] = useState(initialFrontLegHeightFt || 2.5);
  const [viewPreset, setViewPreset] = useState('orbit'); // 'orbit', 'top', 'side', 'front'
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);

  // Active roof configuration fallback
  const activeRoof = useMemo(() => {
    return roofConfig || DEFAULT_ROOF_CONFIG;
  }, [roofConfig]);

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
    camera.position.set(7, 6, 9);
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
    controls.maxDistance = 35;
    controlsRef.current = controls;

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff8e7, 1.4);
    sunLight.position.set(6, 14, 11);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 40;
    sunLight.shadow.camera.left = -15;
    sunLight.shadow.camera.right = 15;
    sunLight.shadow.camera.top = 15;
    sunLight.shadow.camera.bottom = -15;
    scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x94a3b8, 0.45);
    scene.add(hemiLight);

    // 4. Rooftop Concrete Terrace Floor & Parapet Walls from roofConfig
    const parapetHeightM = ((activeRoof.parapetHeightFt !== undefined ? activeRoof.parapetHeightFt : 3.0) * 0.3048);
    const parapetThicknessM = 0.23; // 9 inch brick wall

    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xE2E8F0,
      roughness: 0.85,
      metalness: 0.05
    });

    const parapetMat = new THREE.MeshStandardMaterial({
      color: 0xCBD5E1,
      roughness: 0.9,
      metalness: 0.05
    });

    const copingMat = new THREE.MeshStandardMaterial({
      color: 0x94A3B8,
      roughness: 0.7,
      metalness: 0.1
    });

    // Check if custom polygon or L-shape or standard rectangle
    if (activeRoof.type === 'l_shape' || activeRoof.type === 'custom_polygon') {
      const polyVerts = getRoofPolygonVertices(activeRoof);
      const polyWalls = getRoofWalls(polyVerts);

      // Create 2D Shape in X-Z plane (Shape Y maps to -Z)
      const shape = new THREE.Shape();
      polyVerts.forEach((v, idx) => {
        const vx = v.x * 0.3048;
        const vz = v.z * 0.3048;
        if (idx === 0) shape.moveTo(vx, -vz);
        else shape.lineTo(vx, -vz);
      });
      shape.closePath();

      // Extrude concrete slab
      const extrudeSettings = { depth: 0.3, bevelEnabled: false };
      const slabGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      const slab = new THREE.Mesh(slabGeo, floorMat);
      slab.rotation.x = Math.PI / 2;
      slab.position.y = 0;
      slab.receiveShadow = true;
      scene.add(slab);

      // Parapet walls along every boundary side
      if (parapetHeightM > 0.05) {
        polyWalls.forEach((w) => {
          const x1 = w.p1.x * 0.3048;
          const z1 = w.p1.z * 0.3048;
          const x2 = w.p2.x * 0.3048;
          const z2 = w.p2.z * 0.3048;

          const dx = x2 - x1;
          const dz = z2 - z1;
          const segLen = Math.sqrt(dx * dx + dz * dz);
          const segAngle = Math.atan2(dz, dx);

          const midX = (x1 + x2) / 2;
          const midZ = (z1 + z2) / 2;

          const wallGeo = new THREE.BoxGeometry(segLen, parapetHeightM, parapetThicknessM);
          const wallMesh = new THREE.Mesh(wallGeo, parapetMat);
          wallMesh.position.set(midX, parapetHeightM / 2, midZ);
          wallMesh.rotation.y = -segAngle;
          wallMesh.castShadow = true;
          wallMesh.receiveShadow = true;
          scene.add(wallMesh);

          // Top coping stone
          const copingGeo = new THREE.BoxGeometry(segLen, 0.04, parapetThicknessM + 0.04);
          const copingMesh = new THREE.Mesh(copingGeo, copingMat);
          copingMesh.position.set(midX, parapetHeightM + 0.02, midZ);
          copingMesh.rotation.y = -segAngle;
          copingMesh.castShadow = true;
          scene.add(copingMesh);
        });
      }
    } else {
      // Standard Rectangle Roof
      const roofWidthM = (parseFloat(activeRoof.widthFt) || 36) * 0.3048;
      const roofDepthM = (parseFloat(activeRoof.depthFt) || 26) * 0.3048;

      const floorGeo = new THREE.BoxGeometry(roofWidthM, 0.3, roofDepthM);
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.position.y = -0.15;
      floor.receiveShadow = true;
      scene.add(floor);

      if (parapetHeightM > 0.05) {
        // North Parapet
        const pNorth = new THREE.Mesh(new THREE.BoxGeometry(roofWidthM, parapetHeightM, parapetThicknessM), parapetMat);
        pNorth.position.set(0, parapetHeightM / 2, -roofDepthM / 2 + parapetThicknessM / 2);
        pNorth.castShadow = true;
        scene.add(pNorth);

        // South Parapet
        const pSouth = new THREE.Mesh(new THREE.BoxGeometry(roofWidthM, parapetHeightM, parapetThicknessM), parapetMat);
        pSouth.position.set(0, parapetHeightM / 2, roofDepthM / 2 - parapetThicknessM / 2);
        pSouth.castShadow = true;
        scene.add(pSouth);

        // East Parapet
        const pEast = new THREE.Mesh(new THREE.BoxGeometry(parapetThicknessM, parapetHeightM, roofDepthM - parapetThicknessM * 2), parapetMat);
        pEast.position.set(roofWidthM / 2 - parapetThicknessM / 2, parapetHeightM / 2, 0);
        pEast.castShadow = true;
        scene.add(pEast);

        // West Parapet
        const pWest = new THREE.Mesh(new THREE.BoxGeometry(parapetThicknessM, parapetHeightM, roofDepthM - parapetThicknessM * 2), parapetMat);
        pWest.position.set(-roofWidthM / 2 + parapetThicknessM / 2, parapetHeightM / 2, 0);
        pWest.castShadow = true;
        scene.add(pWest);
      }
    }

    // 5. Structure Elements (GI Steel Materials & Hardware)
    const giMat = new THREE.MeshStandardMaterial({
      color: 0xD1D5DB,
      metalness: 0.85,
      roughness: 0.3
    });

    const clampMat = new THREE.MeshStandardMaterial({
      color: 0x94A3B8,
      metalness: 0.95,
      roughness: 0.2
    });

    const basePlateMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.9,
      roughness: 0.35
    });

    const boltMat = new THREE.MeshStandardMaterial({
      color: 0xF59E0B, // Gold / Yellow dichromate J-Bolt look
      metalness: 0.9,
      roughness: 0.3
    });

    // Structure dimensions in meters
    const arrayWM = (layout.widthMm || 2278) / 1000;
    const arrayDM = (layout.depthMm || 1134) / 1000;
    const frontHM = elevation.frontLegHeightMm / 1000;
    const rearHM = elevation.rearLegHeightMm / 1000;
    const legPairs = layout.bom?.frontLegs || 2;
    const legSpacing = arrayWM / Math.max(1, legPairs - 1);

    const structureGroup = new THREE.Group();

    // Leg Positions (South is +Z, North is -Z)
    const frontZ = arrayDM * 0.45; // South front leg
    const rearZ = -arrayDM * 0.45; // North rear leg
    const deltaZ = frontZ - rearZ; // positive
    const deltaY = rearHM - frontHM; // positive
    const tiltAngle = Math.atan2(deltaY, deltaZ); // ~18° in radians
    const slopeLength = Math.sqrt(deltaZ * deltaZ + deltaY * deltaY);

    // Columns / Legs (60x40 mm GI Pipe)
    const colWidth = 0.06; // 60mm
    const colDepth = 0.04; // 40mm
    const basePlateGeo = new THREE.BoxGeometry(0.18, 0.015, 0.18);

    for (let i = 0; i < legPairs; i++) {
      const x = -arrayWM / 2 + (i * legSpacing);

      // Front Leg Column (Ground Y=0 to frontHM)
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

      // Rear Leg Column (Ground Y=0 to rearHM)
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
    }

    // 6. Unified Hierarchical Tilted Plane Group
    // Pivoted exactly at the center of the structure table:
    const tableCenterY = (frontHM + rearHM) / 2;
    const tableCenterZ = (frontZ + rearZ) / 2;

    const tiltedPlaneGroup = new THREE.Group();
    tiltedPlaneGroup.position.set(0, tableCenterY, tableCenterZ);
    // In Three.js, positive rotation around X lowers +Z (South) and raises -Z (North):
    tiltedPlaneGroup.rotation.x = tiltAngle;

    // Inside tiltedPlaneGroup:
    // Local X: East-West (-arrayWM/2 to +arrayWM/2)
    // Local Z: Along slope (-slopeLength/2 is North/Top, +slopeLength/2 is South/Bottom)
    // Local Y: Normal to slope (pointing UPWARDS/OUTWARDS towards sky & sun)

    // Layer 1: Rafters (40mm x 40mm GI Pipe along slope)
    // Sits at local Y = 0.02 (bottom touches column tops at Y = 0)
    const rafterGeo = new THREE.BoxGeometry(0.04, 0.04, slopeLength);
    for (let i = 0; i < legPairs; i++) {
      const x = -arrayWM / 2 + (i * legSpacing);
      const rafter = new THREE.Mesh(rafterGeo, giMat);
      rafter.position.set(x, 0.02, 0);
      rafter.castShadow = true;
      tiltedPlaneGroup.add(rafter);
    }

    // Layer 2: Purlins (40mm x 40mm GI Pipe across width)
    // Sits directly ON TOP of rafters!
    // Bottom at Y = 0.04, center at Y = 0.06, top at Y = 0.08
    const rowCount = layout.rows?.length || 1;
    const purlinGeo = new THREE.BoxGeometry(arrayWM + 0.15, 0.04, 0.04);

    for (let r = 0; r < rowCount; r++) {
      const rowLen = slopeLength / rowCount;
      const rowCenterZ = -slopeLength / 2 + (r + 0.5) * rowLen;
      // 2 purlins per row of modules (at 25% and 75% of module length)
      const pz1 = rowCenterZ - rowLen * 0.25;
      const pz2 = rowCenterZ + rowLen * 0.25;

      [pz1, pz2].forEach(pz => {
        const purlin = new THREE.Mesh(purlinGeo, giMat);
        purlin.position.set(0, 0.06, pz);
        purlin.castShadow = true;
        tiltedPlaneGroup.add(purlin);
      });
    }

    // Layer 3: Solar PV Modules (35mm thickness)
    // Sits directly ON TOP of purlins!
    // Bottom at Y = 0.08, center at Y = 0.0975, top at Y = 0.115
    const pvFrameMat = new THREE.MeshStandardMaterial({
      color: 0xE2E8F0,
      metalness: 0.85,
      roughness: 0.25
    });

    const pvCellMat = new THREE.MeshStandardMaterial({
      color: 0x0B192C, // Deep monocrystalline dark navy blue
      roughness: 0.18,
      metalness: 0.85
    });

    const midClampGeo = new THREE.BoxGeometry(0.025, 0.04, 0.05);
    const endClampGeo = new THREE.BoxGeometry(0.025, 0.04, 0.05);
    const jBoltGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.05, 8);

    let startLocalZ = -slopeLength / 2;
    (layout.rows || []).forEach((row) => {
      const rowPanels = Array.isArray(row) ? row : [];
      if (rowPanels.length === 0) return;

      const firstPanel = rowPanels[0];
      const panelH = (firstPanel.heightMm / 1000);
      const totalRowW = rowPanels.reduce((acc, p) => acc + (p.widthMm / 1000), 0);
      let currentX = -totalRowW / 2;

      rowPanels.forEach((panel, pIdx) => {
        const pw = (panel.widthMm / 1000) - 0.015; // 15mm spacing for mid clamps
        const ph = (panel.heightMm / 1000) - 0.015;

        const pCenterX = currentX + (panel.widthMm / 1000) / 2;
        const pCenterZ = startLocalZ + panelH / 2;

        const panelGroup = new THREE.Group();
        panelGroup.position.set(pCenterX, 0.0975, pCenterZ);

        // 1. Aluminium Anodized Outer Frame (35mm deep)
        const frameMesh = new THREE.Mesh(new THREE.BoxGeometry(pw, 0.035, ph), pvFrameMat);
        frameMesh.castShadow = true;
        panelGroup.add(frameMesh);

        // 2. High-Efficiency Dark Navy Blue Silicon PV Glass on Top Face
        const waferMesh = new THREE.Mesh(new THREE.BoxGeometry(pw - 0.015, 0.006, ph - 0.015), pvCellMat);
        waferMesh.position.set(0, 0.016, 0); // on upper face
        waferMesh.castShadow = true;
        panelGroup.add(waferMesh);

        // 3. Fastener J-Bolts at corners of panel
        [
          [-pw / 2 + 0.03, -ph / 2 + 0.03],
          [pw / 2 - 0.03, -ph / 2 + 0.03],
          [-pw / 2 + 0.03, ph / 2 - 0.03],
          [pw / 2 - 0.03, ph / 2 - 0.03]
        ].forEach(([bx, bz]) => {
          const bolt = new THREE.Mesh(jBoltGeo, boltMat);
          bolt.position.set(bx, -0.015, bz);
          panelGroup.add(bolt);
        });

        // 4. Clamps clamping panels to purlins
        if (pIdx === 0) {
          // Left End Clamp
          const endClampL = new THREE.Mesh(endClampGeo, clampMat);
          endClampL.position.set(-pw / 2 - 0.01, 0.01, 0);
          panelGroup.add(endClampL);
        }
        if (pIdx === rowPanels.length - 1) {
          // Right End Clamp
          const endClampR = new THREE.Mesh(endClampGeo, clampMat);
          endClampR.position.set(pw / 2 + 0.01, 0.01, 0);
          panelGroup.add(endClampR);
        } else {
          // Mid Clamp between panels
          const midClamp = new THREE.Mesh(midClampGeo, clampMat);
          midClamp.position.set(pw / 2 + 0.008, 0.01, 0);
          panelGroup.add(midClamp);
        }

        tiltedPlaneGroup.add(panelGroup);
        currentX += (panel.widthMm / 1000);
      });

      startLocalZ += panelH;
    });

    structureGroup.add(tiltedPlaneGroup);
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
  }, [layout, elevation, activeRoof]);

  // Handle Camera Presets
  const setCameraPreset = (preset) => {
    setViewPreset(preset);
    const controls = controlsRef.current;
    const camera = cameraRef.current;
    if (!controls || !camera) return;

    if (preset === 'top') {
      camera.position.set(0, 12, 0.1);
      controls.target.set(0, 0, 0);
    } else if (preset === 'side') {
      camera.position.set(10, 3, 0);
      controls.target.set(0, 1.5, 0);
    } else if (preset === 'front') {
      camera.position.set(0, 3, 10);
      controls.target.set(0, 1.5, 0);
    } else {
      camera.position.set(7, 6, 9);
      controls.target.set(0, 1, 0);
    }
    controls.update();
  };

  return (
    <div className="flex flex-col w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
      {/* 3D Top Header Bar */}
      <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="material-symbols-outlined text-[#6CBF3D] text-[20px]">view_in_ar</span>
          <span className="font-bold text-sm">Interactive 3D Solar Rooftop &amp; Structure Model</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-500/20 text-blue-400 border border-blue-500/40 uppercase">
            Mounted On Metal Rails
          </span>
          {activeRoof.type !== 'rectangle' && (
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase">
              Custom Roof: {activeRoof.type.toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onOpenRoofDesigner && (
            <button
              type="button"
              onClick={onOpenRoofDesigner}
              className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer border border-white/10"
            >
              <span className="material-symbols-outlined text-[16px] text-amber-400">roofing</span>
              <span>Edit Roof Shape &amp; Sides</span>
            </button>
          )}

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
      </div>

      {/* 3D WebGL Canvas Container */}
      <div className="relative w-full h-[400px] sm:h-[480px] bg-slate-900 cursor-grab active:cursor-grabbing">
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
          <div className="text-[10px] text-slate-400 mt-0.5">Parapet Wall: <b className="text-white">{activeRoof.parapetHeightFt || 3} ft</b></div>
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
