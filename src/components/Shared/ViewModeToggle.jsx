import React, { useState, useEffect } from 'react';

/**
 * Custom hook to manage responsive Table vs Card view mode with sessionStorage persistence.
 * Defaults to 'card' on mobile (<768px) and 'table' on desktop (>=768px).
 */
export function useTableViewMode(storageKey, defaultOnDesktop = 'table') {
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(`sunvine_view_${storageKey}`);
      if (saved === 'card' || saved === 'table') return saved;
      return window.innerWidth < 768 ? 'card' : defaultOnDesktop;
    }
    return defaultOnDesktop;
  });

  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`sunvine_view_${storageKey}`, mode);
    }
  };

  return [viewMode, handleSetViewMode];
}

/**
 * Reusable ViewModeToggle component providing accessible Card View vs Table View switching.
 */
export default function ViewModeToggle({ viewMode, onViewModeChange, className = '' }) {
  return (
    <div className={`inline-flex items-center p-0.5 bg-surface-container-low rounded-lg border border-surface-container-highest shrink-0 shadow-xs ${className}`}>
      <button
        type="button"
        onClick={() => onViewModeChange('card')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer select-none ${
          viewMode === 'card'
            ? 'bg-white text-primary shadow-xs font-bold border border-surface-container-high'
            : 'text-secondary hover:text-on-surface'
        }`}
        title="Switch to Card View"
        aria-label="Card View"
      >
        <span className="material-symbols-outlined text-[16px] leading-none">grid_view</span>
        <span>Cards</span>
      </button>
      <button
        type="button"
        onClick={() => onViewModeChange('table')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer select-none ${
          viewMode === 'table'
            ? 'bg-white text-primary shadow-xs font-bold border border-surface-container-high'
            : 'text-secondary hover:text-on-surface'
        }`}
        title="Switch to Table / List View"
        aria-label="Table View"
      >
        <span className="material-symbols-outlined text-[16px] leading-none">table_rows</span>
        <span>Table</span>
      </button>
    </div>
  );
}
