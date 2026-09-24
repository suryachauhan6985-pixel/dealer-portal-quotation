import React from 'react';
import { resolveCapacityBom } from '../../data/standardBomData';

// Format Indian Rupee currency with commas
const formatINR = (val) => {
  if (val === undefined || val === null || isNaN(val)) return '0';
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(val);
};

export default function PDFTemplate({ quotation, activePage = 'all' }) {
  if (!quotation) return null;

  const {
    id = 'SV-2026-Q801',
    date = '17-08-2026',
    customerName = 'MIRANA TECHNOCAST PVT.LTD.',
    systemCapacityKW = 280.20,
    solarModule = '600 WP',
    moduleCount = 467,
    pvModuleSize = '4 * 8',
    inverterCapacity = '125 KW',
    inverterCount = '2 NOS',
    inverterType = '',
    baseRatePerKW = 24000,
    dealerMarginPerKW = 0,
    discomMeterCharge = 'Extra',
    gedaRegistrationCharge = 'Including',
    meterTestingCharge = 'CUSTOMER SCOPE',
    gstPercentage = 8.9,
    grandTotalCustomer = 6724800,
    multiBrandComparison = false,
    multiBrandPackages = null,
    selectedModuleMake = '',
    selectedInverterMake = '',
  } = quotation;

  // Resolve standard engineering BOM for this kW
  const resolvedBom = resolveCapacityBom(systemCapacityKW);
  const bomQtyMap = (resolvedBom?.items || []).reduce((acc, i) => {
    acc[i.id] = i.quantity;
    return acc;
  }, {});

  const effectiveModuleMake = selectedModuleMake || (solarModule ? solarModule.split(' ')[0] : 'WAAREE');
  const effectiveInverterMake = selectedInverterMake || (inverterType ? inverterType.split(' ')[0] : 'SOLARYAAN');

  // Calculate customer-facing rate (Dealer margin is strictly merged into rate or kept confidential)
  const customerRatePerKW = baseRatePerKW + (dealerMarginPerKW || 0);
  const calculatedGrandTotal = grandTotalCustomer || Math.round(customerRatePerKW * systemCapacityKW);

  return (
    <div className="pdf-document font-sans text-[#1B1F23] bg-white print:bg-white select-none">
      {/* ========================================================
          PAGE 1: DYNAMIC SUNVINE PROPOSAL COVER PAGE (SR-34)
          ======================================================== */}
      <div className={`pdf-page pdf-page-cover relative w-[210mm] h-[297mm] max-h-[297mm] mx-auto bg-white border border-gray-300 shadow-xl print:!border-none print:!shadow-none print:!m-0 print:!mb-0 print:!p-0 print:!h-[295mm] print:!max-h-[295mm] mb-8 overflow-hidden items-center justify-center box-border ${activePage === 'all' || activePage === 1 ? 'flex' : 'hidden print:flex'}`}>
        <img
          src="/mirana_page1_original.jpg"
          alt="Sunvine Quotation Cover"
          className="w-full h-full object-cover block select-none"
        />
      </div>


      {/* ========================================================
          PAGE 2: SYSTEM DETAILS & PRICE SUMMARY (EXACT MIRANA PDF)
          ======================================================== */}
      <div className={`pdf-page pdf-page-content relative w-[210mm] h-[297mm] max-h-[297mm] mx-auto p-10 flex-col justify-between bg-white border border-gray-300 shadow-xl print:!border-none print:!shadow-none print:!m-0 print:!mb-0 print:!h-[295mm] print:!max-h-[295mm] mb-8 overflow-hidden box-border ${activePage === 'all' || activePage === 2 ? 'flex' : 'hidden print:flex'}`}>
        <div>
          {/* Top Right Logo */}
          <div className="flex justify-end pb-3">
            <img src="/sunvine_logo_transparent.png" alt="Sunvine" className="h-10 object-contain" />
          </div>

          {/* Heading */}
          <div className="text-center my-2">
            <h2 className="text-2xl font-black text-[#2E7D32] tracking-wide uppercase">
              SYSTEM DETAILS
            </h2>
            <p className="text-xs italic text-gray-700 font-serif mt-0.5">
              Empowering The Future with Solar Energy
            </p>
          </div>

          {/* TABLE 1: SPECIFICATION & SYSTEM DETAILS */}
          <div className="mt-3 mb-4 overflow-hidden border border-[#406c70]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#58979c] text-[#0B2545]">
                <tr>
                  <th className="py-2 px-4 font-black uppercase tracking-wider w-1/2 border-r border-[#406c70]">
                    SPECIFICATION
                  </th>
                  <th className="py-2 px-4 font-black uppercase tracking-wider w-1/2">
                    SYSTEM DETAILS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#406c70] text-gray-900 font-medium">
                <tr className="bg-white">
                  <td className="py-2 px-4 font-bold border-r border-[#406c70]">CUSTOMER NAME</td>
                  <td className="py-2 px-4 font-bold uppercase">{customerName}</td>
                </tr>
                <tr className="bg-white">
                  <td className="py-2 px-4 font-bold border-r border-[#406c70]">DATE</td>
                  <td className="py-2 px-4">{date}</td>
                </tr>
                <tr className="bg-white">
                  <td className="py-2 px-4 font-bold border-r border-[#406c70]">SOLAR MODULE</td>
                  <td className="py-2 px-4">{solarModule}</td>
                </tr>
                <tr className="bg-white">
                  <td className="py-2 px-4 font-bold border-r border-[#406c70]">SYSTEM TOTAL CAPACITY</td>
                  <td className="py-2 px-4 font-semibold">{systemCapacityKW} KW On Grid Solar</td>
                </tr>
                <tr className="bg-white">
                  <td className="py-2 px-4 font-bold border-r border-[#406c70]">PV MODULE SIZE</td>
                  <td className="py-2 px-4">{pvModuleSize}</td>
                </tr>
                <tr className="bg-white">
                  <td className="py-2 px-4 font-bold border-r border-[#406c70]">INVERTER CAPACITY</td>
                  <td className="py-2 px-4">{inverterCapacity}</td>
                </tr>
                <tr className="bg-white">
                  <td className="py-2 px-4 font-bold border-r border-[#406c70]">NUMBER OF INVERTER</td>
                  <td className="py-2 px-4">{inverterCount}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3 Guarantees with green tick */}
          <div className="space-y-1 text-xs text-gray-900 font-semibold my-4 pl-2">
            <div className="flex items-center gap-2">
              <span className="text-[#2E7D32] font-bold">✔</span>
              <span>30 Years Solar Panel Performance Warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#2E7D32] font-bold">✔</span>
              <span>Premium Installation Quality</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#2E7D32] font-bold">✔</span>
              <span>Smart Savings on Electricity Bills</span>
            </div>
          </div>

          {/* Heading: PRICE SUMMARY */}
          <div className="text-center my-3">
            <h2 className="text-2xl font-black text-[#2E7D32] tracking-wide uppercase">
              PRICE SUMMARY
            </h2>
          </div>

          {/* Project Type Rooftop Tag */}
          <div className="flex items-center gap-1.5 text-xs font-black text-gray-900 uppercase my-2">
            <span className="w-1.5 h-4 bg-[#B4C400] inline-block"></span>
            <span>{quotation.projectType === 'Commercial' || (typeof quotation.type === 'string' && quotation.type.includes('Commercial')) ? 'COMMERCIAL / INDUSTRIAL ROOFTOP :' : 'RESIDENTIAL ROOFTOP :'}</span>
          </div>

          {/* TABLE 2: PROJECT COST SUMMARY */}
          <div className="overflow-hidden border border-[#406c70] mb-4">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#58979c] text-[#0B2545]">
                <tr>
                  <th className="py-2 px-4 font-black uppercase tracking-wider border-r border-[#406c70]">
                    PROJECT COST SUMMARY
                  </th>
                  {multiBrandComparison && multiBrandPackages && multiBrandPackages.length > 0 ? (
                    multiBrandPackages.map((pkg, pIdx) => (
                      <th key={pIdx} className="py-2 px-3 font-black uppercase tracking-wider text-center border-r last:border-r-0 border-[#406c70]">
                        {pkg.brand}
                      </th>
                    ))
                  ) : (
                    <th className="py-2 px-4 font-black uppercase tracking-wider text-center w-1/3">
                      {effectiveModuleMake}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#406c70] text-gray-900">
                <tr className="bg-white">
                  <td className="py-2 px-4 font-bold border-r border-[#406c70]">PRODUCT DESCRIPTION</td>
                  {multiBrandComparison && multiBrandPackages && multiBrandPackages.length > 0 ? (
                    multiBrandPackages.map((pkg, pIdx) => (
                      <td key={pIdx} className="py-2 px-3 text-center font-medium border-r last:border-r-0 border-[#406c70] text-[11px]">
                        {pkg.wattage} WP : ({systemCapacityKW} KW)
                      </td>
                    ))
                  ) : (
                    <td className="py-2 px-4 text-center font-medium">{solarModule} : ({systemCapacityKW} KW)</td>
                  )}
                </tr>
                <tr className="bg-white">
                  <td className="py-2 px-4 font-bold border-r border-[#406c70]">TOTAL NUMBER OF MODULES</td>
                  {multiBrandComparison && multiBrandPackages && multiBrandPackages.length > 0 ? (
                    multiBrandPackages.map((pkg, pIdx) => (
                      <td key={pIdx} className="py-2 px-3 text-center font-medium border-r last:border-r-0 border-[#406c70]">
                        {pkg.moduleCount}
                      </td>
                    ))
                  ) : (
                    <td className="py-2 px-4 text-center font-medium">{moduleCount}</td>
                  )}
                </tr>
                <tr className="bg-white">
                  <td className="py-2 px-4 font-bold border-r border-[#406c70]">RATE PER KW</td>
                  {multiBrandComparison && multiBrandPackages && multiBrandPackages.length > 0 ? (
                    multiBrandPackages.map((pkg, pIdx) => (
                      <td key={pIdx} className="py-2 px-3 text-center font-mono font-bold border-r last:border-r-0 border-[#406c70]">
                        ₹ {formatINR(pkg.ratePerKw)}
                      </td>
                    ))
                  ) : (
                    <td className="py-2 px-4 text-center font-mono font-bold">₹ {formatINR(customerRatePerKW)}</td>
                  )}
                </tr>
                <tr className="bg-white">
                  <td className="py-2 px-4 font-bold border-r border-[#406c70]">
                    DISCOM Meter Charge ( Extra as actual if more from PGVCL)
                  </td>
                  <td colSpan={multiBrandComparison && multiBrandPackages && multiBrandPackages.length > 0 ? multiBrandPackages.length : 1} className="py-2 px-4 text-center text-gray-700">
                    {discomMeterCharge}
                  </td>
                </tr>
                <tr className="bg-white">
                  <td className="py-2 px-4 font-bold border-r border-[#406c70]">GEDA Registration Charge</td>
                  <td colSpan={multiBrandComparison && multiBrandPackages && multiBrandPackages.length > 0 ? multiBrandPackages.length : 1} className="py-2 px-4 text-center text-gray-700">
                    {gedaRegistrationCharge}
                  </td>
                </tr>
                <tr className="bg-white">
                  <td className="py-2 px-4 font-bold border-r border-[#406c70]">
                    METER , METER BOX , CT-PT SET , METER TESTING CHARGE
                  </td>
                  <td colSpan={multiBrandComparison && multiBrandPackages && multiBrandPackages.length > 0 ? multiBrandPackages.length : 1} className="py-2 px-4 text-center text-gray-700">
                    {meterTestingCharge}
                  </td>
                </tr>
                <tr className="bg-white">
                  <td className="py-2 px-4 font-bold border-r border-[#406c70]">GST {gstPercentage}%</td>
                  <td colSpan={multiBrandComparison && multiBrandPackages && multiBrandPackages.length > 0 ? multiBrandPackages.length : 1} className="py-2 px-4 text-center text-gray-700">
                    Extra (As Applicable)
                  </td>
                </tr>
                {/* GRAND TOTAL ROW */}
                <tr className="bg-[#58979c] text-[#0B2545] font-black text-sm">
                  <td className="py-2.5 px-4 uppercase tracking-wider text-right pr-6 border-r border-[#406c70]">
                    GRAND TOTAL
                  </td>
                  {multiBrandComparison && multiBrandPackages && multiBrandPackages.length > 0 ? (
                    multiBrandPackages.map((pkg, pIdx) => (
                      <td key={pIdx} className="py-2.5 px-3 text-center font-mono text-sm font-black text-[#0B2545] border-r last:border-r-0 border-[#406c70]">
                        ₹ {formatINR(pkg.totalCost)}
                      </td>
                    ))
                  ) : (
                    <td className="py-2.5 px-4 text-center font-mono text-base font-black text-[#0B2545]">
                      ₹ {formatINR(calculatedGrandTotal)}
                    </td>
                  )}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section: BANK DETAILS */}
          <div className="flex items-center gap-1.5 text-xs font-black text-gray-900 uppercase my-2">
            <span className="w-1.5 h-4 bg-[#B4C400] inline-block"></span>
            <span>BANK DETAILS</span>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-gray-900 pt-1 font-medium">
            <div>
              <span className="font-bold">FIRM NAME : </span> <strong>SUNVINE RENEWABLE</strong>
            </div>
            <div>
              <span className="font-bold">A/C NO. : </span> <strong className="font-mono">99998000050580</strong>
            </div>
            <div>
              <span className="font-bold">BANK NAME : </span> <strong>HDFC BANK LTD.</strong>
            </div>
            <div>
              <span className="font-bold">IFSC : </span> <strong className="font-mono">HDFC0002012</strong>
            </div>
            <div>
              <span className="font-bold">Gmail : </span> <span>sunvinerenewable@gmail.com</span>
            </div>
            <div>
              <span className="font-bold">BRANCH : </span> <strong>METODA BRANCH</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          PAGE 3: BILL OF MATERIAL : SOLAR ON GRID SYSTEM (EXACT MIRANA PDF)
          ======================================================== */}
      <div className={`pdf-page pdf-page-content relative w-[210mm] h-[297mm] max-h-[297mm] mx-auto p-10 flex-col justify-between bg-white border border-gray-300 shadow-xl print:!border-none print:!shadow-none print:!m-0 print:!mb-0 print:!h-[295mm] print:!max-h-[295mm] mb-8 overflow-hidden box-border ${activePage === 'all' || activePage === 3 ? 'flex' : 'hidden print:flex'}`}>
        <div>
          {/* Top Right Logo */}
          <div className="flex justify-end pb-3">
            <img src="/sunvine_logo_transparent.png" alt="Sunvine" className="h-10 object-contain" />
          </div>

          {/* Section Title */}
          <div className="flex items-center gap-1.5 text-sm font-black text-gray-900 uppercase mb-3">
            <span className="w-1.5 h-4 bg-[#B4C400] inline-block"></span>
            <span>BILL OF MATERIAL : SOLAR ON GRID SYSTEM</span>
          </div>

          {/* EXACT BOM TABLE */}
          <div className="overflow-hidden border border-[#4d7594]">
            <table className="w-full text-[11px] text-left">
              <thead className="bg-[#6b95b5] text-gray-900">
                <tr>
                  <th className="py-1.5 px-3 font-bold border-r border-[#4d7594] text-center w-12">SR. NO.</th>
                  <th className="py-1.5 px-4 font-bold border-r border-[#4d7594]">ITEM</th>
                  <th className="py-1.5 px-3 font-bold border-r border-[#4d7594] text-center w-28">QTY.</th>
                  <th className="py-1.5 px-3 font-bold text-center w-48">MAKE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#4d7594] text-gray-900">
                {/* 1. SOLAR MODULES */}
                <tr className="bg-gray-100 font-bold">
                  <td className="py-1 px-3 text-center border-r border-[#4d7594]">1</td>
                  <td className="py-1 px-4 border-r border-[#4d7594]">SOLAR MODULES</td>
                  <td className="py-1 px-3 border-r border-[#4d7594]"></td>
                  <td className="py-1 px-3"></td>
                </tr>
                <tr>
                  <td className="py-1 px-3 text-center border-r border-[#4d7594]">1.1</td>
                  <td className="py-1 px-4 border-r border-[#4d7594]">PV MODULE, {solarModule || 'TOPCON MONO BIFACIAL Panel'}</td>
                  <td className="py-1 px-3 text-center border-r border-[#4d7594] font-semibold">{moduleCount}</td>
                  <td className="py-1 px-3 text-center font-semibold">{effectiveModuleMake}</td>
                </tr>

                {/* 2. INVERTER DETAILS */}
                <tr className="bg-gray-100 font-bold">
                  <td className="py-1 px-3 text-center border-r border-[#4d7594]">2</td>
                  <td className="py-1 px-4 border-r border-[#4d7594]">INVERTER DETAILS</td>
                  <td className="py-1 px-3 border-r border-[#4d7594]"></td>
                  <td className="py-1 px-3"></td>
                </tr>
                <tr>
                  <td className="py-1 px-3 text-center border-r border-[#4d7594]">2.1</td>
                  <td className="py-1 px-4 border-r border-[#4d7594]">String type On-Grid Solar Inverter ({inverterCapacity || `${systemCapacityKW} kW`})</td>
                  <td className="py-1 px-3 text-center border-r border-[#4d7594] font-semibold">1 NOS</td>
                  <td className="py-1 px-3 text-center text-[10px] leading-tight font-semibold">
                    {effectiveInverterMake}<br />Any Reputed
                  </td>
                </tr>

                {/* 3. MODULE MOUNTING STRUCTURE */}
                <tr className="bg-gray-100 font-bold">
                  <td className="py-1 px-3 text-center border-r border-[#4d7594]">3</td>
                  <td className="py-1 px-4 border-r border-[#4d7594]">MODULE MOUNTING STRUCTURE</td>
                  <td className="py-1 px-3 border-r border-[#4d7594]"></td>
                  <td className="py-1 px-3"></td>
                </tr>
                <tr>
                  <td className="py-1 px-3 text-center border-r border-[#4d7594]">3.1</td>
                  <td className="py-1 px-4 border-r border-[#4d7594]">ALUMINIUM CHANNEL (MONO RAIL &amp; CLAMPS)</td>
                  <td className="py-1 px-3 text-center border-r border-[#4d7594] font-semibold">{moduleCount * 2 + 4} Sets</td>
                  <td className="py-1 px-3 text-center font-semibold">STANDARD</td>
                </tr>
                <tr>
                  <td className="py-1 px-3 text-center border-r border-[#4d7594]">3.2</td>
                  <td className="py-1 px-4 border-r border-[#4d7594]">
                    Hot Dip Galvanized Pipe<br />
                    (60,80 Micron - 2MM thickness)
                  </td>
                  <td className="py-1 px-3 text-center border-r border-[#4d7594] font-semibold text-[10px] leading-tight">
                    {bomQtyMap['gi_pipe_60x40'] || 3} Nos (60x40)<br />+ {bomQtyMap['gi_pipe_40x40'] || 3} Nos (40x40)
                  </td>
                  <td className="py-1 px-3 text-center text-[10px] leading-tight">
                    FORTUNE / HINDUSTAR SIZE : 60X40 / 40X40<br />Any Reputed
                  </td>
                </tr>

                {/* 4. DC CABLES */}
                <tr className="bg-gray-100 font-bold">
                  <td className="py-1 px-3 text-center border-r border-[#4d7594]">4</td>
                  <td className="py-1 px-4 border-r border-[#4d7594]">DC CABLES</td>
                  <td className="py-1 px-3 border-r border-[#4d7594]"></td>
                  <td className="py-1 px-3"></td>
                </tr>
                <tr>
                  <td className="py-1 px-3 text-center border-r border-[#4d7594]">4.1</td>
                  <td className="py-1 px-4 border-r border-[#4d7594]">
                    1C X 4 sq.mm (Red) Type-1, (Black) Type-1,<br />
                    UV Resistant Solar DC Cable
                  </td>
                  <td className="py-1 px-3 text-center border-r border-[#4d7594] font-semibold">{bomQtyMap['dc_wire_4sqmm'] || 50} Meter</td>
                  <td className="py-1 px-3 text-center font-semibold">
                    POLYCAB / RR KABEL<br />Any Reputed
                  </td>
                </tr>

                {/* 5. AC CABLES */}
                <tr className="bg-gray-100 font-bold">
                  <td className="py-1 px-3 text-center border-r border-[#4d7594]">5</td>
                  <td className="py-1 px-4 border-r border-[#4d7594]">AC CABLES</td>
                  <td className="py-1 px-3 border-r border-[#4d7594]"></td>
                  <td className="py-1 px-3"></td>
                </tr>
                <tr>
                  <td className="py-1 px-3 text-center border-r border-[#4d7594]">5.1</td>
                  <td className="py-1 px-4 border-r border-[#4d7594]">
                    AC Grid Copper Cable 4 sq mm (Red/Black)<br />
                    + Flexible Grounding Conductor
                  </td>
                  <td className="py-1 px-3 text-center border-r border-[#4d7594] font-semibold">{bomQtyMap['ac_wire_4sqmm'] || 10} Meter</td>
                  <td className="py-1 px-3 text-center font-semibold">
                    POLYCAB / RR KABEL<br />Any Reputed
                  </td>
                </tr>

                {/* 6. ACDB + DCDB */}
                <tr>
                  <td className="py-1 px-3 text-center font-bold border-r border-[#4d7594]">6</td>
                  <td className="py-1 px-4 font-bold border-r border-[#4d7594]">ACDB + DCDB COMBO BOX</td>
                  <td className="py-1 px-3 text-center border-r border-[#4d7594] font-semibold">1 Combo Unit</td>
                  <td className="py-1 px-3 text-center text-[10px] leading-tight font-semibold">
                    L&amp;T (L&amp;K) / HAVELLS<br />/ SCHNEIDER<br />Any Reputed
                  </td>
                </tr>

                {/* 7. LA CABLE */}
                <tr>
                  <td className="py-1 px-3 text-center font-bold border-r border-[#4d7594]">7</td>
                  <td className="py-1 px-4 font-bold border-r border-[#4d7594]">LA CABLE 1C X 16 sq.mm (Down Conductor)</td>
                  <td className="py-1 px-3 text-center border-r border-[#4d7594] font-semibold">{bomQtyMap['la_cable_16sqmm'] || 30} Meter</td>
                  <td className="py-1 px-3 text-center font-semibold">
                    POLYCAB / RR KABEL<br />Any Reputed
                  </td>
                </tr>

                {/* 8. EARTHING & ACCESSORIES */}
                <tr className="bg-gray-100 font-bold">
                  <td className="py-1 px-3 text-center border-r border-[#4d7594]">8</td>
                  <td className="py-1 px-4 border-r border-[#4d7594]">EARTHING &amp; ACCESSORIES</td>
                  <td className="py-1 px-3 border-r border-[#4d7594]"></td>
                  <td className="py-1 px-3"></td>
                </tr>
                <tr>
                  <td className="py-1 px-3 text-center border-r border-[#4d7594]">8.1</td>
                  <td className="py-1 px-4 border-r border-[#4d7594]">Chemical Earthing Kit (Electrode + BFC Compound)</td>
                  <td className="py-1 px-3 text-center border-r border-[#4d7594] font-semibold text-[10px] leading-tight">
                    {bomQtyMap['earthing_kit'] || 1} Kit<br />({bomQtyMap['earthing_wire_4sqmm'] || 35}m Wire)
                  </td>
                  <td className="py-1 px-3 text-center text-[10px] font-semibold">
                    VASUNDHARA<br />ISI STANDARD
                  </td>
                </tr>
                <tr>
                  <td className="py-1 px-3 text-center border-r border-[#4d7594]">8.2</td>
                  <td className="py-1 px-4 border-r border-[#4d7594]">Lightning Arrestor (Pure Copper LA + Base)</td>
                  <td className="py-1 px-3 text-center border-r border-[#4d7594] font-semibold">1 Set</td>
                  <td className="py-1 px-3 text-center text-[10px] font-semibold">
                    VASUNDHARA<br />ISI STANDARD
                  </td>
                </tr>

                {/* 9. OTHER ACCESSORIES */}
                <tr className="bg-gray-100 font-bold">
                  <td className="py-1 px-3 text-center border-r border-[#4d7594]">9</td>
                  <td className="py-1 px-4 border-r border-[#4d7594]">OTHER HARDWARE &amp; CONDUITS</td>
                  <td className="py-1 px-3 border-r border-[#4d7594]"></td>
                  <td className="py-1 px-3"></td>
                </tr>
                <tr>
                  <td className="py-1 px-3 text-center border-r border-[#4d7594]">9.1</td>
                  <td className="py-1 px-4 border-r border-[#4d7594]">Structural Studs, Nut &amp; Washers, Anchor Fasteners</td>
                  <td className="py-1 px-3 text-center border-r border-[#4d7594] font-semibold text-[10px] leading-tight">
                    {bomQtyMap['anchor_fastener'] || 8} Fasteners,<br />{bomQtyMap['nut_bolts_washers'] || 10} Sets Nut/Wash
                  </td>
                  <td className="py-1 px-3 text-center font-semibold">STANDARD SS/GI</td>
                </tr>
                <tr>
                  <td className="py-1 px-3 text-center border-r border-[#4d7594]">9.2</td>
                  <td className="py-1 px-4 border-r border-[#4d7594]">Cable Ties, MC4 Connectors, PVC Conduit Elbows</td>
                  <td className="py-1 px-3 text-center border-r border-[#4d7594] font-semibold text-[10px] leading-tight">
                    {bomQtyMap['mc4_connectors'] || 2} Prs MC4, {bomQtyMap['pvc_elbow'] || 15} Elbows,<br />{bomQtyMap['cable_ties_pack'] || 1} Pk Ties
                  </td>
                  <td className="py-1 px-3 text-center font-semibold">STANDARD</td>
                </tr>
                <tr>
                  <td className="py-1 px-3 text-center border-r border-[#4d7594]">9.3</td>
                  <td className="py-1 px-4 border-r border-[#4d7594]">Saddle Clips, Rigid PVC Conduit Pipes &amp; Fittings</td>
                  <td className="py-1 px-3 text-center border-r border-[#4d7594] font-semibold text-[10px] leading-tight">
                    {bomQtyMap['pvc_conduit_pipe'] || 12} Nos (10ft),<br />{bomQtyMap['saddle_clips_pack'] || 1} Pk Clips
                  </td>
                  <td className="py-1 px-3 text-center font-semibold">STANDARD</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bottom Engineering & Material Substitution Note */}
          <div className="mt-3 text-[10px] text-gray-800 leading-normal border-t border-[#4d7594]/30 pt-2 font-medium">
            <p><strong>* Note:</strong> The above BOM quantities are standard engineered baseline estimates (Ground + 1st floor). Actual required quantities may vary based on specific site roof structure, elevation heights, and ACDB-to-meter routing path.</p>
            <p className="mt-1 text-gray-700"><strong>Material Substitution:</strong> If any specific material brand listed above is temporarily unavailable at time of dispatch, Sunvine reserves the right to supply equivalent or superior Tier-1 MNRE/BIS approved material without prior notice.</p>
          </div>
        </div>
      </div>

      {/* ========================================================
          PAGE 4: TERMS & CONDITIONS (EXACT MIRANA PDF)
          ======================================================== */}
      <div className={`pdf-page pdf-page-content relative w-[210mm] h-[297mm] max-h-[297mm] mx-auto p-10 flex-col justify-between bg-white border border-gray-300 shadow-xl print:!border-none print:!shadow-none print:!m-0 print:!mb-0 print:!h-[295mm] print:!max-h-[295mm] mb-8 overflow-hidden box-border ${activePage === 'all' || activePage === 4 ? 'flex' : 'hidden print:flex'}`}>
        <div>
          {/* Top Right Logo */}
          <div className="flex justify-end pb-2">
            <img src="/sunvine_logo_transparent.png" alt="Sunvine" className="h-10 object-contain" />
          </div>

          {/* Title */}
          <h2 className="text-center text-xl font-black text-gray-900 uppercase mb-2">
            TERMS &amp; CONDITIONS
          </h2>

          <div className="space-y-1.5 text-[10px] text-gray-900 leading-normal">
            <div>
              <strong className="block font-bold">Guarantee &amp; Warranty of The Plant</strong>
              <strong className="block font-bold mt-0.5">Module Warranty:</strong>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>The 30-year limited warranty covers the module as follows:</li>
                <li>10 years against manufacturing defects.</li>
                <li>90% power output for the first 10 years, and 80% for the next 15 years. (Terms subject to the module's manufacturing conditions.)</li>
                <li>From the date of commissioning and handover of the solar power system (Day One), the responsibility for cleaning and maintaining the solar panels shall be solely borne by the customer.</li>
              </ul>
            </div>

            <div>
              <strong className="block font-bold">Inverter Warranty:</strong>
              <ul className="list-disc pl-4">
                <li>The solar inverter comes with a 8-year warranty against manufacturing defects (Terms subject to the inverter's manufacturing conditions and based on inverter make).</li>
              </ul>
            </div>

            <div>
              <strong className="block font-bold">Other Equipment Warranty:</strong>
              <ul className="list-disc pl-4">
                <li>Up to 5 years from installation.</li>
              </ul>
            </div>

            <div className="pt-0.5">
              <strong className="block font-bold">Warranty Exclusions: (This warranty shall not apply to damages, failures, or defects resulting from) :</strong>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Switch Gears (L&amp;T): 12-month manufacturing defect warranty from the invoice date (No burning conditions covered).</li>
                <li>SPD: No coverage for burning or failure.</li>
                <li>DCDB/ACDB (Residential Projects): No warranty.</li>
                <li>No Returns: Goods once sold will not be accepted back.</li>
                <li>Natural disasters including but not limited to flood, cyclone, lightning, earthquake, storm, fire, or other force majeure events.</li>
                <li>Improper use, negligence, misuse, vandalism, theft, accidental damage, or unauthorized modifications.</li>
                <li>Repairs, alterations, relocation, or servicing performed by any person or organization not authorized by the Company.</li>
                <li>Voltage fluctuations, power surges, grid abnormalities, or electrical faults originating from the utility supply.</li>
                <li>Structural defects, water leakage, corrosion, or issues related to the customer's premises.</li>
                <li>Failure to follow recommended operating and maintenance procedures.</li>
              </ul>
            </div>

            <div className="pt-0.5">
              <strong className="block font-bold">Terms of Payment:</strong>
              <ul className="list-disc pl-4">
                <li>10% advance with purchase order.</li>
                <li>90% before material dispatch.</li>
              </ul>
            </div>

            <div>
              <strong className="block font-bold">Delivery:</strong>
              <ul className="list-disc pl-4">
                <li>Typically, 30 days from the PO date, subject to legal and government approvals.</li>
              </ul>
            </div>

            <div>
              <strong className="block font-bold">Insurance:</strong>
              <ul className="list-disc pl-4">
                <li>After commissioning, the plant will be handed over to the client, who must arrange appropriate asset insurance for the PV system.</li>
              </ul>
            </div>

            <div>
              <strong className="block font-bold">Validity:</strong>
              <ul className="list-disc pl-4">
                <li>Our offer is valid for 15 days from the date of this offer</li>
              </ul>
            </div>

            <div className="font-bold pt-0.5">
              Note: Breakage of panels or other equipment is not covered under warranty.
            </div>
          </div>

          {/* Large Centered Green Banner */}
          <div className="text-center my-3">
            <h3 className="text-base font-black text-[#2E7D32] tracking-wide uppercase">
              THANK YOU FOR CHOOSING SUNVINE RENEWABLE
            </h3>
          </div>

          {/* Bottom Metoda Rajkot Address & Contacts */}
          <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-gray-200">
            <div>
              <strong className="block text-gray-900 font-bold">SUNVINE RENEWABLE:</strong>
              <p className="text-gray-800 leading-snug">
                G-705, Second Gate, Metoda GIDC,<br />
                Rajkot - 360021. (Guj.) India
              </p>
            </div>
            <div className="text-right">
              <strong className="block font-bold text-gray-900">+91 95865 33750</strong>
              <a href="mailto:sunvinerenewable@gmail.com" className="text-blue-700 underline block font-medium">
                sunvinerenewable@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
