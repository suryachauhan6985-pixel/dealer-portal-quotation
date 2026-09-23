// Standard EPC Bill of Materials (BOM) Master Data & Calculation Engine
// Based on real Gujarat Rooftop Solar EPC Field Specifications (3.3 kW / 6-panel baseline)

export const STANDARD_BOM_CATEGORIES = [
  { id: 'structure', name: 'Mounting Structure & Hardware', icon: 'foundation' },
  { id: 'electrical', name: 'Electrical Protection & Switchgear', icon: 'electric_meter' },
  { id: 'cables', name: 'Solar & Grid Cabling', icon: 'cable' },
  { id: 'conduits', name: 'Piping, Conduits & Accessories', icon: 'plumbing' }
];

export const STANDARD_BOM_CATALOG = [
  // 1. Structure & Fasteners
  {
    id: 'gi_pipe_60x40',
    category: 'structure',
    name: '60x40 GI Pipe (20 ft, 2mm thickness)',
    description: 'Hot-dip galvanized structural column / purlin pipe',
    unit: 'Nos',
    defaultRate: 1850
  },
  {
    id: 'gi_pipe_40x40',
    category: 'structure',
    name: '40x40 GI Pipe (20 ft, 2mm thickness)',
    description: 'Hot-dip galvanized bracing / rafter pipe',
    unit: 'Nos',
    defaultRate: 1450
  },
  {
    id: 'anchor_fastener',
    category: 'structure',
    name: 'Anchor Fastener Bolts (M10/M12)',
    description: 'RCC rooftop heavy-duty foundation anchor bolts',
    unit: 'Nos',
    defaultRate: 45
  },
  {
    id: 'la_patti',
    category: 'structure',
    name: 'L-A Patti (Galvanized Clamping Plates)',
    description: 'Structure joinery and angle bracket fittings',
    unit: 'Nos',
    defaultRate: 85
  },
  {
    id: 'stud',
    category: 'structure',
    name: 'Structural Threaded Stud',
    description: 'High-tensile zinc plated connection stud',
    unit: 'Nos',
    defaultRate: 65
  },
  {
    id: 'nut_bolts_washers',
    category: 'structure',
    name: 'SS/GI Nut & Washer Sets (Grade 8.8)',
    description: 'Nut + Spring Washer + Flat Washer set',
    unit: 'Sets',
    defaultRate: 15
  },
  {
    id: 'zinc_spray',
    category: 'structure',
    name: 'Cold Galvanizing Zinc Spray Can',
    description: 'Anti-rust protective weld & cut coating (400ml)',
    unit: 'Can',
    defaultRate: 450
  },

  // 2. Electrical Protection & Switchgear
  {
    id: 'acdb_dcdb_combo',
    category: 'electrical',
    name: 'ACDB + DCDB Combo Box (IP65)',
    description: 'Enclosure with Type-II SPD, MCB/MCCB, and fuse disconnectors',
    unit: 'Nos',
    defaultRate: 3600
  },
  {
    id: 'earthing_kit',
    category: 'electrical',
    name: 'Chemical Earthing Kit (Electrode + BFC Compound)',
    description: 'Maintenance-free copper-bonded electrode kit (2-3 meter)',
    unit: 'Set',
    defaultRate: 2200
  },
  {
    id: 'mc4_connectors',
    category: 'electrical',
    name: 'MC4 Solar Connectors (Pair M+F)',
    description: 'IP68 1000V/1500V UV-resistant solar module string connectors',
    unit: 'Pairs',
    defaultRate: 75
  },

  // 3. Cables & Wires
  {
    id: 'dc_wire_4sqmm',
    category: 'cables',
    name: 'DC Solar Cable 4 sq mm (Red + Black)',
    description: 'TUV / EN 50618 certified XLPO UV/Ozone resistant dual cable',
    unit: 'Meter',
    defaultRate: 48
  },
  {
    id: 'ac_wire_4sqmm',
    category: 'cables',
    name: 'AC Grid Copper Cable 4 sq mm (Red + Black)',
    description: 'FRLS ISI certified copper conductor cable for inverter to ACDB',
    unit: 'Meter',
    defaultRate: 62
  },
  {
    id: 'earthing_wire_4sqmm',
    category: 'cables',
    name: 'Earthing Wire 4 sq mm (Green)',
    description: 'Multi-strand flexible copper grounding conductor',
    unit: 'Meter',
    defaultRate: 32
  },
  {
    id: 'la_cable_16sqmm',
    category: 'cables',
    name: 'Lightning Arrester (LA) Cable 16 sq mm',
    description: 'High-current copper / GI down conductor for lightning protection',
    unit: 'Meter',
    defaultRate: 88
  },

  // 4. Conduits, Piping & Accessories
  {
    id: 'pvc_conduit_pipe',
    category: 'conduits',
    name: 'PVC Conduit Pipe (10 ft, 25mm Heavy)',
    description: 'UV-stabilized rigid PVC cable management conduits',
    unit: 'Nos',
    defaultRate: 95
  },
  {
    id: 'pvc_elbow',
    category: 'conduits',
    name: 'PVC Conduit Elbows (25mm)',
    description: '90-degree smooth curve conduit bends',
    unit: 'Nos',
    defaultRate: 15
  },
  {
    id: 'pvc_tee',
    category: 'conduits',
    name: 'PVC Conduit Tees (25mm)',
    description: '3-way inspection tee junction fittings',
    unit: 'Nos',
    defaultRate: 20
  },
  {
    id: 'cable_ties_pack',
    category: 'conduits',
    name: 'UV Resistant Cable Ties (Pack of 100)',
    description: '300mm heavy-duty nylon solar cable ties',
    unit: 'Pack',
    defaultRate: 140
  },
  {
    id: 'saddle_clips_pack',
    category: 'conduits',
    name: 'Saddle Pipe Clamps (Pack of 100)',
    description: 'GI/PVC conduit wall & rooftop mounting saddles with screws',
    unit: 'Pack',
    defaultRate: 160
  }
];

// Baseline Sizing & Quantity Matrix per Standard Capacity (kW)
export const DEFAULT_CAPACITY_BOM = {
  '2.2': {
    capacityKW: 2.2,
    moduleCount: 4,
    structureHeight: '6/8 Standard',
    items: {
      gi_pipe_60x40: 2,
      gi_pipe_40x40: 2,
      anchor_fastener: 6,
      la_patti: 3,
      stud: 1,
      nut_bolts_washers: 8,
      zinc_spray: 1,
      acdb_dcdb_combo: 1,
      earthing_kit: 1,
      mc4_connectors: 2,
      dc_wire_4sqmm: 40,
      ac_wire_4sqmm: 10,
      earthing_wire_4sqmm: 25,
      la_cable_16sqmm: 25,
      pvc_conduit_pipe: 9,
      pvc_elbow: 10,
      pvc_tee: 4,
      cable_ties_pack: 1,
      saddle_clips_pack: 1
    }
  },
  '3.3': {
    // Exact specification from "bom calculaiton.docx"
    capacityKW: 3.3,
    moduleCount: 6,
    structureHeight: '6/8 Standard (6ft front, 8ft rear)',
    items: {
      gi_pipe_60x40: 3,
      gi_pipe_40x40: 3,
      anchor_fastener: 8,
      la_patti: 4,
      stud: 1,
      nut_bolts_washers: 10,
      zinc_spray: 1,
      acdb_dcdb_combo: 1,
      earthing_kit: 1,
      mc4_connectors: 2,
      dc_wire_4sqmm: 50,
      ac_wire_4sqmm: 10,
      earthing_wire_4sqmm: 35,
      la_cable_16sqmm: 30,
      pvc_conduit_pipe: 12,
      pvc_elbow: 15,
      pvc_tee: 5,
      cable_ties_pack: 1,
      saddle_clips_pack: 1
    }
  },
  '4.4': {
    capacityKW: 4.4,
    moduleCount: 8,
    structureHeight: '6/8 Standard',
    items: {
      gi_pipe_60x40: 4,
      gi_pipe_40x40: 4,
      anchor_fastener: 10,
      la_patti: 5,
      stud: 2,
      nut_bolts_washers: 14,
      zinc_spray: 1,
      acdb_dcdb_combo: 1,
      earthing_kit: 2,
      mc4_connectors: 2,
      dc_wire_4sqmm: 60,
      ac_wire_4sqmm: 15,
      earthing_wire_4sqmm: 40,
      la_cable_16sqmm: 35,
      pvc_conduit_pipe: 15,
      pvc_elbow: 18,
      pvc_tee: 6,
      cable_ties_pack: 2,
      saddle_clips_pack: 1
    }
  },
  '5.5': {
    capacityKW: 5.5,
    moduleCount: 10,
    structureHeight: '6/8 Standard',
    items: {
      gi_pipe_60x40: 5,
      gi_pipe_40x40: 5,
      anchor_fastener: 12,
      la_patti: 6,
      stud: 2,
      nut_bolts_washers: 18,
      zinc_spray: 2,
      acdb_dcdb_combo: 1,
      earthing_kit: 2,
      mc4_connectors: 4,
      dc_wire_4sqmm: 75,
      ac_wire_4sqmm: 20,
      earthing_wire_4sqmm: 45,
      la_cable_16sqmm: 35,
      pvc_conduit_pipe: 18,
      pvc_elbow: 22,
      pvc_tee: 8,
      cable_ties_pack: 2,
      saddle_clips_pack: 2
    }
  },
  '6.6': {
    capacityKW: 6.6,
    moduleCount: 12,
    structureHeight: '6/8 Standard',
    items: {
      gi_pipe_60x40: 6,
      gi_pipe_40x40: 6,
      anchor_fastener: 14,
      la_patti: 8,
      stud: 2,
      nut_bolts_washers: 22,
      zinc_spray: 2,
      acdb_dcdb_combo: 1,
      earthing_kit: 2,
      mc4_connectors: 4,
      dc_wire_4sqmm: 90,
      ac_wire_4sqmm: 25,
      earthing_wire_4sqmm: 50,
      la_cable_16sqmm: 40,
      pvc_conduit_pipe: 22,
      pvc_elbow: 25,
      pvc_tee: 10,
      cable_ties_pack: 2,
      saddle_clips_pack: 2
    }
  },
  '8.0': {
    capacityKW: 8.0,
    moduleCount: 15,
    structureHeight: '6/8 Standard',
    items: {
      gi_pipe_60x40: 8,
      gi_pipe_40x40: 8,
      anchor_fastener: 18,
      la_patti: 10,
      stud: 3,
      nut_bolts_washers: 28,
      zinc_spray: 2,
      acdb_dcdb_combo: 1,
      earthing_kit: 3,
      mc4_connectors: 4,
      dc_wire_4sqmm: 110,
      ac_wire_4sqmm: 30,
      earthing_wire_4sqmm: 60,
      la_cable_16sqmm: 45,
      pvc_conduit_pipe: 26,
      pvc_elbow: 30,
      pvc_tee: 12,
      cable_ties_pack: 3,
      saddle_clips_pack: 2
    }
  },
  '10.0': {
    capacityKW: 10.0,
    moduleCount: 18,
    structureHeight: '6/8 Standard',
    items: {
      gi_pipe_60x40: 10,
      gi_pipe_40x40: 10,
      anchor_fastener: 24,
      la_patti: 12,
      stud: 4,
      nut_bolts_washers: 36,
      zinc_spray: 3,
      acdb_dcdb_combo: 1,
      earthing_kit: 3,
      mc4_connectors: 6,
      dc_wire_4sqmm: 130,
      ac_wire_4sqmm: 35,
      earthing_wire_4sqmm: 70,
      la_cable_16sqmm: 50,
      pvc_conduit_pipe: 32,
      pvc_elbow: 36,
      pvc_tee: 15,
      cable_ties_pack: 3,
      saddle_clips_pack: 3
    }
  }
};

/**
 * Resolves the BOM item list and total costing for any arbitrary capacity (kW).
 * If exact capacity exists in matrix, uses explicit preset.
 * Otherwise interpolates/extrapolates based on kW scaling.
 */
export function resolveCapacityBom(capacityKW, customMatrix = DEFAULT_CAPACITY_BOM, customRates = {}) {
  const kw = parseFloat(capacityKW) || 3.3;
  const kwKey = kw.toFixed(1);
  const preset = customMatrix[kwKey] || customMatrix['3.3'];

  // Ratio scaling if custom capacity
  const ratio = kw / (preset?.capacityKW || 3.3);

  const resolvedItems = STANDARD_BOM_CATALOG.map((catItem) => {
    const baseQty = preset?.items?.[catItem.id] ?? 0;
    const finalQty = customMatrix[kwKey]
      ? baseQty
      : Math.max(1, Math.round(baseQty * ratio));
    const unitRate = customRates[catItem.id] ?? catItem.defaultRate;
    const totalAmount = finalQty * unitRate;

    return {
      ...catItem,
      quantity: finalQty,
      unitRate,
      totalAmount
    };
  });

  const categoryTotals = STANDARD_BOM_CATEGORIES.map((cat) => {
    const items = resolvedItems.filter((i) => i.category === cat.id);
    const sum = items.reduce((acc, i) => acc + i.totalAmount, 0);
    return {
      ...cat,
      items,
      total: sum
    };
  });

  const totalBoSCost = resolvedItems.reduce((acc, i) => acc + i.totalAmount, 0);

  return {
    capacityKW: kw,
    structureHeight: preset?.structureHeight || '6/8 Standard',
    items: resolvedItems,
    categoryTotals,
    totalBoSCost
  };
}
