/**
 * Solar Structure & 2D Panel Layout Engine
 * Generates all dynamic mounting combinations (Pure Portrait, Pure Landscape, Hybrid Khadi+Aadi, Dual Tables)
 * Computes exact array dimensions, J-Bolts, Clamps, Legs, and Foundation Hardware.
 */

export const DEFAULT_MODULE_DIMS = {
  lengthMm: 2278, // ~2.28m standard 550W-600W
  widthMm: 1134,  // ~1.13m standard 550W-600W
  thicknessMm: 30,
  weightKg: 28.5
};

export const mmToMeters = (valMm) => ((valMm || 0) / 1000).toFixed(2);
export const mmToFeet = (valMm) => ((valMm || 0) / 304.8).toFixed(1);
export const sqMmToSqFt = (valSqMm) => ((valSqMm || 0) / 92903.04).toFixed(1);

/**
 * Parses dimensions string like "2278 × 1134 × 30 mm" from hardware master
 */
export function parseModuleDimensions(dimStr) {
  if (!dimStr) return DEFAULT_MODULE_DIMS;
  const numbers = String(dimStr).match(/\d+(\.\d+)?/g);
  if (numbers && numbers.length >= 2) {
    const parsedA = parseFloat(numbers[0]) || DEFAULT_MODULE_DIMS.lengthMm;
    const parsedB = parseFloat(numbers[1]) || DEFAULT_MODULE_DIMS.widthMm;
    const parsedT = numbers.length >= 3 ? (parseFloat(numbers[2]) || 30) : 30;
    return {
      lengthMm: Math.max(parsedA, parsedB), // Length is always longer edge
      widthMm: Math.min(parsedA, parsedB),  // Width is shorter edge
      thicknessMm: parsedT,
      weightKg: 28.5
    };
  }
  return DEFAULT_MODULE_DIMS;
}

/**
 * Calculates Hardware BOM for a given layout
 */
export function calculateHardwareBOM(layout) {
  const totalPanels = layout.totalPanels || 6;
  
  // 1. J-Bolts: 4 per panel in standard C-channel / GI structures
  const jBoltsCount = totalPanels * 4;

  // 2. Aluminium Clamps
  let midClampsCount = 0;
  let endClampsCount = 0;

  if (layout.rows && layout.rows.length > 0) {
    layout.rows.forEach(row => {
      const panelCountInRow = Array.isArray(row) ? row.length : (row.panelsCount || 1);
      // Each row has 4 end clamps (2 on left edge, 2 on right edge)
      endClampsCount += 4;
      // Between each adjacent panel pair in a row, 2 mid-clamps
      if (panelCountInRow > 1) {
        midClampsCount += (panelCountInRow - 1) * 2;
      }
    });
  } else {
    // Fallback estimation
    endClampsCount = 4;
    midClampsCount = Math.max(0, (totalPanels - 1) * 2);
  }

  // 3. Structure Columns / Legs (Front Legs & Rear Legs)
  // Typically 1 leg pair every 2.5m - 3.2m of table width, with min 2 leg pairs (4 legs)
  const arrayWidthMeters = (layout.widthMm || 2278) / 1000;
  const legPairs = Math.max(2, Math.ceil(arrayWidthMeters / 2.8) + 1);
  const totalLegs = legPairs * 2; // Front + Rear

  // 4. Base Plates & Anchor Fasteners
  // 4 wedge anchor fasteners per civil foundation leg
  const basePlatesCount = totalLegs;
  const anchorFastenersCount = totalLegs * 4;
  const lAnglesCount = totalLegs * 2;

  // 5. Hardware fasteners (Hex bolt + nut + plain + spring washers)
  const fastenerSetsCount = (jBoltsCount + midClampsCount + endClampsCount + (totalLegs * 6));

  return {
    jBoltsCount,
    midClampsCount,
    endClampsCount,
    totalClamps: midClampsCount + endClampsCount,
    frontLegs: legPairs,
    rearLegs: legPairs,
    totalLegs,
    basePlatesCount,
    anchorFastenersCount,
    lAnglesCount,
    fastenerSetsCount,
    estimatedSteelWeightKg: Math.round(totalPanels * 22.5) // approx 22.5 kg structural steel per panel
  };
}

/**
 * Generates all dynamic 2D mounting layout combinations for a given panel count N
 */
export function generateDynamicLayouts(panelCount, customDims = DEFAULT_MODULE_DIMS) {
  const n = parseInt(panelCount, 10);
  if (isNaN(n) || n <= 0) return [];

  const panelL = customDims?.lengthMm || DEFAULT_MODULE_DIMS.lengthMm;
  const panelW = customDims?.widthMm || DEFAULT_MODULE_DIMS.widthMm;
  const layouts = [];

  // ==========================================
  // 1. PURE PORTRAIT COMBINATIONS (खड़ी)
  // ==========================================
  for (let r = 1; r <= n; r++) {
    if (n % r === 0) {
      const c = n / r;
      // Skip extreme vertical towers like 1 col x 12 rows unless total panels <= 4
      if (r > 6 && c === 1) continue;

      const calcWidthMm = c * panelW;
      const calcDepthMm = r * panelL;
      
      const rows = [];
      let panelIndex = 1;
      for (let rowIdx = 0; rowIdx < r; rowIdx++) {
        const rowPanels = [];
        for (let colIdx = 0; colIdx < c; colIdx++) {
          rowPanels.push({
            id: panelIndex,
            label: `P${panelIndex}`,
            fullLabel: `Panel ${panelIndex}`,
            orientation: 'portrait',
            widthMm: panelW,
            heightMm: panelL,
            row: rowIdx + 1,
            col: colIdx + 1
          });
          panelIndex++;
        }
        rows.push(rowPanels);
      }

      // Check if matches Excel presets for 6 panels
      let excelTag = null;
      let isRecommended = false;
      if (n === 6) {
        if (r === 2 && c === 3) {
          excelTag = 'Excel Design 1';
          isRecommended = true;
        } else if (r === 1 && c === 6) {
          excelTag = 'Excel Design 2';
          isRecommended = true;
        } else if (r === 3 && c === 2) {
          isRecommended = true;
        }
      } else if (r <= 3 && c <= 6) {
        isRecommended = true;
      }

      const layout = {
        id: `portrait_${r}x${c}`,
        type: 'portrait',
        category: 'Pure Portrait (खड़ी)',
        name: r === 1 ? `1 Row × ${c} Panels (Single Line)` : `${r} Rows × ${c} Panels (${r}×${c} Grid)`,
        shortCode: `${r}R × ${c}C Khadi`,
        rowsCount: r,
        colsCount: c,
        totalPanels: n,
        widthMm: calcWidthMm,
        depthMm: calcDepthMm,
        areaSqM: (calcWidthMm * calcDepthMm) / 1000000,
        excelTag,
        isRecommended,
        rows
      };
      layout.bom = calculateHardwareBOM(layout);
      layouts.push(layout);
    }
  }

  // ==========================================
  // 2. PURE LANDSCAPE COMBINATIONS (आड़ी)
  // ==========================================
  for (let r = 1; r <= n; r++) {
    if (n % r === 0) {
      const c = n / r;
      if (r > 6 && c === 1) continue;

      const calcWidthMm = c * panelL;
      const calcDepthMm = r * panelW;

      const rows = [];
      let panelIndex = 1;
      for (let rowIdx = 0; rowIdx < r; rowIdx++) {
        const rowPanels = [];
        for (let colIdx = 0; colIdx < c; colIdx++) {
          rowPanels.push({
            id: panelIndex,
            label: `P${panelIndex}`,
            fullLabel: `Panel ${panelIndex}`,
            orientation: 'landscape',
            widthMm: panelL,
            heightMm: panelW,
            row: rowIdx + 1,
            col: colIdx + 1
          });
          panelIndex++;
        }
        rows.push(rowPanels);
      }

      const isRecommended = (r <= 3 && c <= 5) || (r === 2 && c === 3);

      const layout = {
        id: `landscape_${r}x${c}`,
        type: 'landscape',
        category: 'Pure Landscape (आड़ी)',
        name: r === 1 ? `1 Row × ${c} Panels Landscape (एक आड़ी पंक्ति)` : `${r} Rows × ${c} Panels Landscape (${r}×${c} आड़ी ग्रिड)`,
        shortCode: `${r}R × ${c}C Aadi`,
        rowsCount: r,
        colsCount: c,
        totalPanels: n,
        widthMm: calcWidthMm,
        depthMm: calcDepthMm,
        areaSqM: (calcWidthMm * calcDepthMm) / 1000000,
        isRecommended,
        rows
      };
      layout.bom = calculateHardwareBOM(layout);
      layouts.push(layout);
    }
  }

  // ==========================================
  // 3. HYBRID COMBINATIONS (खड़ी + आड़ी / 2:1 Symmetry)
  // 2 Portrait panels = 1 Landscape panel in width (2 x 1134mm = 2268mm ~= 2278mm)
  // ==========================================
  for (let k = 1; k < n; k++) {
    const p = n - k;
    if (p % 2 === 0) {
      // Case A: 1 row of p portrait, and 1 row of k landscape, where p = 2 * k
      if (p === 2 * k) {
        const colsP = p;
        const colsL = k;
        const calcWidthMm = Math.max(colsP * panelW, colsL * panelL);
        const calcDepthMm = panelL + panelW;

        // Config 1: Portrait on Top (North), Landscape at Bottom (South)
        let idx1 = 1;
        const row1P = [];
        for (let i = 0; i < colsP; i++) {
          row1P.push({ id: idx1, label: `P${idx1}`, fullLabel: `Panel ${idx1}`, orientation: 'portrait', widthMm: panelW, heightMm: panelL });
          idx1++;
        }
        const row1L = [];
        for (let i = 0; i < colsL; i++) {
          row1L.push({ id: idx1, label: `P${idx1}`, fullLabel: `Panel ${idx1}`, orientation: 'landscape', widthMm: panelL, heightMm: panelW });
          idx1++;
        }

        const isExcel3 = (n === 6 && p === 4 && k === 2);

        const hybrid1 = {
          id: `hybrid_${p}P_${k}L_top`,
          type: 'hybrid',
          category: 'Hybrid (खड़ी + आड़ी)',
          name: `Hybrid: ${p} Khadi (Top) + ${k} Aadi (Bottom)`,
          shortCode: `${p} Khadi + ${k} Aadi`,
          totalPanels: n,
          widthMm: calcWidthMm,
          depthMm: calcDepthMm,
          areaSqM: (calcWidthMm * calcDepthMm) / 1000000,
          excelTag: isExcel3 ? 'Excel Design 3' : null,
          isRecommended: true,
          rows: [row1P, row1L]
        };
        hybrid1.bom = calculateHardwareBOM(hybrid1);
        layouts.push(hybrid1);

        // Config 2: Landscape on Top (North), Portrait at Bottom (South)
        let idx2 = 1;
        const row2L = [];
        for (let i = 0; i < colsL; i++) {
          row2L.push({ id: idx2, label: `P${idx2}`, fullLabel: `Panel ${idx2}`, orientation: 'landscape', widthMm: panelL, heightMm: panelW });
          idx2++;
        }
        const row2P = [];
        for (let i = 0; i < colsP; i++) {
          row2P.push({ id: idx2, label: `P${idx2}`, fullLabel: `Panel ${idx2}`, orientation: 'portrait', widthMm: panelW, heightMm: panelL });
          idx2++;
        }

        const hybrid2 = {
          id: `hybrid_${k}L_${p}P_bottom`,
          type: 'hybrid',
          category: 'Hybrid (खड़ी + आड़ी)',
          name: `Hybrid: ${k} Aadi (Top) + ${p} Khadi (Bottom)`,
          shortCode: `${k} Aadi + ${p} Khadi`,
          totalPanels: n,
          widthMm: calcWidthMm,
          depthMm: calcDepthMm,
          areaSqM: (calcWidthMm * calcDepthMm) / 1000000,
          isRecommended: false,
          rows: [row2L, row2P]
        };
        hybrid2.bom = calculateHardwareBOM(hybrid2);
        layouts.push(hybrid2);
      }

      // Case B: 2 rows of portrait (2 x (p/2)) and 1 row of landscape (k)
      // e.g. p = 8 (2 rows of 4), k = 2 (1 row of 2 landscape) -> width = 4 x 1134 = 4.54m!
      const halfP = p / 2;
      if (halfP > 0 && halfP === 2 * k) {
        const calcWidthMm = Math.max(halfP * panelW, k * panelL);
        const calcDepthMm = (2 * panelL) + panelW;
        let idx3 = 1;
        const r1 = [];
        for (let i = 0; i < halfP; i++) {
          r1.push({ id: idx3, label: `P${idx3}`, fullLabel: `Panel ${idx3}`, orientation: 'portrait', widthMm: panelW, heightMm: panelL });
          idx3++;
        }
        const r2 = [];
        for (let i = 0; i < halfP; i++) {
          r2.push({ id: idx3, label: `P${idx3}`, fullLabel: `Panel ${idx3}`, orientation: 'portrait', widthMm: panelW, heightMm: panelL });
          idx3++;
        }
        const r3 = [];
        for (let i = 0; i < k; i++) {
          r3.push({ id: idx3, label: `P${idx3}`, fullLabel: `Panel ${idx3}`, orientation: 'landscape', widthMm: panelL, heightMm: panelW });
          idx3++;
        }

        const hybridMulti = {
          id: `hybrid_2x${halfP}P_${k}L`,
          type: 'hybrid',
          category: 'Hybrid (खड़ी + आड़ी)',
          name: `Hybrid: 2 Rows of ${halfP} Khadi + 1 Row of ${k} Aadi`,
          shortCode: `2x${halfP} Khadi + ${k} Aadi`,
          totalPanels: n,
          widthMm: calcWidthMm,
          depthMm: calcDepthMm,
          areaSqM: (calcWidthMm * calcDepthMm) / 1000000,
          isRecommended: true,
          rows: [r1, r2, r3]
        };
        hybridMulti.bom = calculateHardwareBOM(hybridMulti);
        layouts.push(hybridMulti);
      }
    }
  }

  // ==========================================
  // 4. DUAL / SPLIT ARRAYS (2 Separate Tables)
  // For rooftops with obstacles (water tank, mumty, skylight)
  // ==========================================
  if (n >= 4 && n % 2 === 0) {
    const half = n / 2;
    // Table A & B in portrait
    const tableWidthMm = half * panelW;
    const tableDepthMm = panelL;

    let pIdx = 1;
    const tableA = [];
    for (let i = 0; i < half; i++) {
      tableA.push({ id: pIdx, label: `P${pIdx}`, fullLabel: `Panel ${pIdx}`, orientation: 'portrait', widthMm: panelW, heightMm: panelL });
      pIdx++;
    }
    const tableB = [];
    for (let i = 0; i < half; i++) {
      tableB.push({ id: pIdx, label: `P${pIdx}`, fullLabel: `Panel ${pIdx}`, orientation: 'portrait', widthMm: panelW, heightMm: panelL });
      pIdx++;
    }

    const splitLayout = {
      id: `split_2tables_${half}`,
      type: 'split',
      category: 'Dual Table (2 अलग टेबल)',
      name: `Dual Split Tables: 2 Separate Tables of ${half} Panels Each`,
      shortCode: `2 Tables × ${half} Panels`,
      totalPanels: n,
      widthMm: (tableWidthMm * 2) + 1200, // including 1.2m walkway clearance
      depthMm: tableDepthMm,
      areaSqM: ((tableWidthMm * tableDepthMm) * 2) / 1000000,
      isSplit: true,
      isRecommended: n >= 8,
      tables: [
        { name: 'Table A (West/North)', panels: tableA, widthMm: tableWidthMm, depthMm: tableDepthMm },
        { name: 'Table B (East/South)', panels: tableB, widthMm: tableWidthMm, depthMm: tableDepthMm }
      ],
      rows: [tableA, tableB]
    };
    splitLayout.bom = calculateHardwareBOM(splitLayout);
    layouts.push(splitLayout);
  }

  return layouts;
}
