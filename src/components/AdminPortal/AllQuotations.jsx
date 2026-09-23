import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function AllQuotations() {
  const { quotations, setPreviewQuotation, setActiveTab, dealers } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTabFilter, setActiveTabFilter] = useState('all');
  const [marginProfileFilter, setMarginProfileFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const handleViewPdf = (quoteData) => {
    if (setPreviewQuotation) {
      setPreviewQuotation(quoteData);
      setActiveTab('preview_quote');
    }
  };

  const allQuotes = quotations && quotations.length > 0 ? quotations : [];

  // Metrics
  const totalProposalsCount = allQuotes.length;
  const totalValue = allQuotes.reduce((acc, q) => acc + (q.grandTotalCustomer || q.totalAmount || 0), 0);
  const totalCapacityKW = allQuotes.reduce((acc, q) => acc + (parseFloat(q.systemCapacityKW || q.capacity || 0)), 0);
  const totalCapacityMW = (totalCapacityKW / 1000).toFixed(2);
  const avgValue = totalProposalsCount > 0 ? Math.round(totalValue / totalProposalsCount) : 0;
  const totalDealersCount = dealers?.length || 550;

  // Filter quotes
  const filteredQuotes = allQuotes.filter(q => {
    const term = searchTerm.toLowerCase();
    const matchSearch = (q.quoteNumber && q.quoteNumber.toLowerCase().includes(term)) ||
                        (q.id && q.id.toLowerCase().includes(term)) ||
                        (q.customerName && q.customerName.toLowerCase().includes(term)) ||
                        (q.dealerName && q.dealerName.toLowerCase().includes(term)) ||
                        (q.dealerId && q.dealerId.toLowerCase().includes(term)) ||
                        (q.city && q.city.toLowerCase().includes(term));

    if (!matchSearch) return false;

    const statusLower = (q.status || '').toLowerCase();
    if (activeTabFilter === 'approved' && !statusLower.includes('approved') && !statusLower.includes('active') && !statusLower.includes('sent')) return false;
    if (activeTabFilter === 'discom' && !statusLower.includes('discom') && !statusLower.includes('sanctioned') && !statusLower.includes('review') && !statusLower.includes('pending')) return false;
    if (activeTabFilter === 'draft' && !statusLower.includes('draft') && !statusLower.includes('stale')) return false;

    const marginPerKw = q.dealerMarginPerKW || (q.dealerTotalMargin && q.systemCapacityKW ? Math.round(q.dealerTotalMargin / q.systemCapacityKW) : 0);
    if (marginProfileFilter === 'high' && marginPerKw <= 4500) return false;
    if (marginProfileFilter === 'flagged' && marginPerKw <= 5500) return false;
    if (marginProfileFilter === 'compliant' && marginPerKw > 5500) return false;

    return true;
  });

  const totalPages = Math.ceil(filteredQuotes.length / pageSize) || 1;
  const paginatedQuotes = filteredQuotes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="flex flex-col w-full pb-16">
      {/* 1. Breadcrumbs & Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-surface-container-highest">
        <div>
          <nav className="flex items-center gap-1.5 text-xs font-label-xs text-secondary mb-1">
            <span>Admin Console</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span>Gujarat Ledger</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-on-surface font-medium">All Quotations Master</span>
          </nav>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
            Gujarat Quotation Master Directory
          </h1>
          <p className="font-body-md text-body-md text-secondary mt-1">
            Centralized oversight of customer quotations issued across all {totalDealersCount} registered Gujarat dealers, margin audits, and conversion stages.
          </p>
        </div>
        {/* Action Controls Row */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button className="bg-white border border-[#E4E7EB] hover:bg-[#F6F8F7] text-on-surface font-label-md py-2 px-3.5 rounded-lg flex items-center gap-2 text-xs shadow-sm transition-colors">
            <span className="material-symbols-outlined text-secondary">calendar_today</span>
            <span>Date Range: Current Fiscal (2025-26)</span>
          </button>
          <button className="bg-white border border-[#E4E7EB] hover:bg-[#F6F8F7] text-on-surface font-label-md py-2 px-3.5 rounded-lg flex items-center gap-2 text-xs shadow-sm transition-colors">
            <span className="material-symbols-outlined text-secondary">storefront</span>
            <span>Dealers: {totalDealersCount} (100% Gujarat)</span>
          </button>
          <button className="bg-white border border-[#E4E7EB] hover:bg-[#F6F8F7] text-on-surface font-label-md py-2 px-3.5 rounded-lg flex items-center gap-2 text-xs shadow-sm transition-colors">
            <span className="material-symbols-outlined text-secondary">electric_meter</span>
            <span>DISCOMs: PGVCL, DGVCL, MGVCL, UGVCL</span>
          </button>
          <button
            onClick={() => window.print()}
            className="bg-[#0F1B2E] hover:bg-[#182a45] text-white font-label-md py-2 px-4 rounded-lg flex items-center gap-2 text-xs shadow-sm transition-colors border border-[#0F1B2E]"
          >
            <span className="material-symbols-outlined text-[#6CBF3D]">file_download</span>
            <span>Export Gujarat Proposals (Excel)</span>
          </button>
        </div>
      </div>

      {/* 2. Overview Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 my-6">
        {/* Card 1 */}
        <div className="kpi-card bg-white p-5 rounded-xl border border-[#E4E7EB] shadow-sm flex flex-col justify-between group">
          <div className="flex items-center justify-between text-secondary">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-xs group-hover:text-primary transition-colors">Total Proposals Issued</span>
            <span className="p-1.5 rounded-lg bg-surface-container-low text-secondary group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <span className="material-symbols-outlined">request_quote</span>
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="font-headline-lg text-headline-xl text-[#0F1B2E] font-bold">{totalProposalsCount}</span>
              <span className="text-xs font-label-xs text-[#2E7D32] bg-[rgba(108,191,61,0.15)] px-2 py-0.5 rounded-full font-semibold">Live Feed</span>
            </div>
            <p className="font-body-sm text-body-sm text-secondary mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-[#6CBF3D]">currency_rupee</span>
              <span className="font-semibold text-on-surface">₹ {(totalValue / 10000000).toFixed(2)} Cr</span> total value
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="kpi-card bg-white p-5 rounded-xl border border-[#E4E7EB] shadow-sm flex flex-col justify-between group">
          <div className="flex items-center justify-between text-secondary">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-xs group-hover:text-primary transition-colors">Average Quotation Value</span>
            <span className="p-1.5 rounded-lg bg-surface-container-low text-secondary group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <span className="material-symbols-outlined">calculate</span>
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="font-headline-lg text-headline-xl text-[#0F1B2E] font-bold">₹ {(avgValue / 100000).toFixed(2)} Lakhs</span>
            </div>
            <p className="font-body-sm text-body-sm text-secondary mt-1">
              Across Residential &amp; C&amp;I projects in Gujarat
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="kpi-card bg-white p-5 rounded-xl border border-[#E4E7EB] shadow-sm flex flex-col justify-between group">
          <div className="flex items-center justify-between text-secondary">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-xs group-hover:text-primary transition-colors">Total Capacity Quoted</span>
            <span className="p-1.5 rounded-lg bg-surface-container-low text-secondary group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <span className="material-symbols-outlined">solar_power</span>
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="font-headline-lg text-headline-xl text-[#0F1B2E] font-bold">{totalCapacityMW} MW</span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden flex">
                <div className="bg-[#6CBF3D] h-full w-[85%]" title="Rooftop"></div>
                <div className="bg-[#256676] h-full w-[15%]" title="C&I"></div>
              </div>
              <span className="text-[11px] font-label-xs text-secondary whitespace-nowrap">Gujarat Territory</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="kpi-card bg-white p-5 rounded-xl border border-[#E4E7EB] shadow-sm flex flex-col justify-between group">
          <div className="flex items-center justify-between text-secondary">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-xs group-hover:text-primary transition-colors">Average Dealer Margin</span>
            <span className="p-1.5 rounded-lg bg-surface-container-low text-secondary group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <span className="material-symbols-outlined">verified_user</span>
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="font-headline-lg text-headline-xl text-[#0F1B2E] font-bold">₹ 3,250 <span className="text-sm font-normal text-secondary">/ kW</span></span>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-[#2E7D32]">
                <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Audit Compliant
              </span>
              <span className="text-[11px] text-secondary font-label-xs">Within Gujarat EPC Caps</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Master Directory Table Section */}
      <div className="bg-white rounded-xl border border-[#E4E7EB] shadow-[0px_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
        {/* Filter Tabs & Table Controls Bar */}
        <div className="p-4 border-b border-[#E4E7EB] flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white">
          <div className="flex flex-wrap items-center gap-1.5 bg-[#F6F8F7] p-1 rounded-lg border border-[#E4E7EB]">
            <button
              onClick={() => { setActiveTabFilter('all'); setCurrentPage(1); }}
              className={`px-3.5 py-1.5 rounded-md font-label-sm text-xs font-semibold shadow-sm flex items-center gap-2 transition-colors ${
                activeTabFilter === 'all' ? 'bg-[#0F1B2E] text-white' : 'text-secondary hover:text-on-surface'
              }`}
            >
              <span>All Proposals</span>
              <span className="bg-white/20 px-1.5 py-0.2 rounded text-[10px]">{allQuotes.length}</span>
            </button>
            <button
              onClick={() => { setActiveTabFilter('approved'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-md font-label-sm text-xs transition-colors flex items-center gap-2 ${
                activeTabFilter === 'approved' ? 'bg-[#0F1B2E] text-white' : 'text-secondary hover:text-on-surface'
              }`}
            >
              <span>Approved &amp; In-Progress</span>
            </button>
            <button
              onClick={() => { setActiveTabFilter('discom'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-md font-label-sm text-xs transition-colors flex items-center gap-2 ${
                activeTabFilter === 'discom' ? 'bg-[#0F1B2E] text-white' : 'text-secondary hover:text-on-surface'
              }`}
            >
              <span>Under DISCOM Review</span>
            </button>
            <button
              onClick={() => { setActiveTabFilter('draft'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-md font-label-sm text-xs transition-colors flex items-center gap-2 ${
                activeTabFilter === 'draft' ? 'bg-[#0F1B2E] text-white' : 'text-secondary hover:text-on-surface'
              }`}
            >
              <span>Draft / Stale</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-72 sm:w-80">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-sm">search</span>
              <input
                className="w-full bg-[#FFFFFF] border border-[#E4E7EB] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#1B1F23] placeholder-gray-400 focus:outline-none focus:border-[#6CBF3D] focus:ring-2 focus:ring-[#6CBF3D]/20 transition-all font-body-sm"
                placeholder="Search Quote #, Customer, Dealer, City..."
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <select
              value={marginProfileFilter}
              onChange={(e) => { setMarginProfileFilter(e.target.value); setCurrentPage(1); }}
              className="bg-white border border-[#E4E7EB] rounded-lg text-xs py-1.5 px-3 font-label-sm text-on-surface focus:outline-none focus:border-[#6CBF3D]"
            >
              <option value="all">All Margin Profiles</option>
              <option value="high">Margin &gt; ₹4,500/kW</option>
              <option value="flagged">🚨 Flagged for Executive Audit</option>
              <option value="compliant">Compliant Margins (≤ ₹5,500/kW)</option>
            </select>
          </div>
        </div>

        {/* 4. Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1300px]">
            <thead>
              <tr className="bg-[#0F1B2E] text-white font-label-sm text-xs">
                <th className="py-3.5 px-4 font-semibold tracking-wider uppercase text-[11px]">Quote Ref</th>
                <th className="py-3.5 px-4 font-semibold tracking-wider uppercase text-[11px]">Date</th>
                <th className="py-3.5 px-4 font-semibold tracking-wider uppercase text-[11px]">Issuing Dealer / Firm</th>
                <th className="py-3.5 px-4 font-semibold tracking-wider uppercase text-[11px]">Customer / Enterprise</th>
                <th className="py-3.5 px-4 font-semibold tracking-wider uppercase text-[11px]">System Size &amp; Type</th>
                <th className="py-3.5 px-4 font-semibold tracking-wider uppercase text-[11px] text-right">Base Price</th>
                <th className="py-3.5 px-4 font-semibold tracking-wider uppercase text-[11px] text-center">Dealer Margin</th>
                <th className="py-3.5 px-4 font-semibold tracking-wider uppercase text-[11px] text-right">Total Quoted</th>
                <th className="py-3.5 px-4 font-semibold tracking-wider uppercase text-[11px] text-center">Lifecycle Stage</th>
                <th className="py-3.5 px-4 font-semibold tracking-wider uppercase text-[11px] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EB] font-body-sm text-xs">
              {paginatedQuotes.map((q, idx) => {
                const quoteRef = q.quoteNumber || q.id || `#SV-2025-Q${idx + 100}`;
                const marginPerKw = q.dealerMarginPerKW || (q.dealerTotalMargin && q.systemCapacityKW ? Math.round(q.dealerTotalMargin / q.systemCapacityKW) : 3200);
                const isFlagged = marginPerKw > 6000;
                const totalAmt = q.grandTotalCustomer || q.totalAmount || 0;
                const baseCost = q.baseCost || (totalAmt - (q.dealerTotalMargin || (marginPerKw * (q.systemCapacityKW || 5))));

                return (
                  <tr key={q.id || idx} className="bg-white hover:bg-[#F0F4F2] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-on-surface">
                      <button
                        onClick={() => handleViewPdf(q)}
                        className="text-[#256676] hover:underline flex items-center gap-1 font-bold"
                      >
                        {quoteRef}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-secondary whitespace-nowrap">
                      {q.date || '24 Oct 2025'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-on-surface">{q.dealerName || 'Gujarat Solar Tech'}</div>
                      <div className="text-[11px] text-secondary font-mono flex items-center gap-1">
                        <span>{q.dealerId || '#SV-DLR-0842'}</span> • <span>{q.city || 'Rajkot'}, GJ</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-on-surface">{q.customerName}</div>
                      <div className="text-[11px] text-secondary">{q.city || 'Gujarat'} • {q.discom || 'PGVCL'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-on-surface">{q.systemCapacityKW || q.capacity || '5.0'} kW</div>
                      <div className="text-[11px] text-secondary">{q.projectType || q.type || 'Rooftop Solar'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-secondary">
                      ₹ {baseCost.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isFlagged
                            ? 'bg-red-100 text-red-700 border border-red-300'
                            : 'bg-[rgba(108,191,61,0.15)] text-[#2E7D32]'
                        }`}>
                          <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {isFlagged ? 'warning' : 'check_circle'}
                          </span>
                          ₹ {(q.dealerTotalMargin || (marginPerKw * (q.systemCapacityKW || 5))).toLocaleString('en-IN')}
                          <span className="font-normal font-mono">(₹{marginPerKw}/kW)</span>
                        </span>
                        {isFlagged && <span className="text-[10px] text-red-600 font-bold mt-0.5">Flagged for Audit</span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-[#0F1B2E] text-sm">
                      ₹ {totalAmt.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        (q.status || '').toLowerCase().includes('approved')
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : (q.status || '').toLowerCase().includes('sanction')
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {q.status || 'Active / Sent'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleViewPdf(q)}
                          className="p-1.5 hover:bg-surface-container-high rounded text-secondary hover:text-on-surface"
                          title="View Customer PDF"
                        >
                          <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                        </button>
                        <button className="p-1.5 hover:bg-surface-container-high rounded text-secondary hover:text-[#256676]" title="Margin Audit Sheet">
                          <span className="material-symbols-outlined text-sm">shield</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer pagination */}
        <div className="p-4 border-t border-[#E4E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-secondary font-label-sm text-label-sm">
          <span>
            Showing <span className="font-semibold text-on-surface">{filteredQuotes.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredQuotes.length)}</span> of <span className="font-semibold text-on-surface">{filteredQuotes.length}</span> proposals
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-[#E4E7EB] text-secondary hover:bg-surface-container transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-1 rounded font-semibold transition-colors ${
                  currentPage === pageNum ? 'bg-[#0F1B2E] text-white' : 'hover:bg-surface-container text-on-surface'
                }`}
              >
                {pageNum}
              </button>
            ))}
            {totalPages > 5 && <span className="px-1 text-secondary">...</span>}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-[#E4E7EB] text-secondary hover:bg-surface-container transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



