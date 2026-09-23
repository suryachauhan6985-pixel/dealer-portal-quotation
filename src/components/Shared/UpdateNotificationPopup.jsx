import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';

const AUTO_DISMISS_MS = 6000;

export default function UpdateNotificationPopup() {
  const {
    notifications,
    markNotificationAsRead,
    setActiveTab,
    dismissedPopupIds,
    dismissPopupNotification,
    setNotificationsOpen
  } = useApp();

  const [sessionDismissedIds, setSessionDismissedIds] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  // Strictly show only the single latest notification (index 0)
  const activeNotif = notifications && notifications.length > 0 ? notifications[0] : null;
  const isEligible = Boolean(
    activeNotif &&
    !activeNotif.read &&
    !dismissedPopupIds?.includes(activeNotif.id) &&
    !sessionDismissedIds.includes(activeNotif.id)
  );
  const currentNotif = isEligible ? activeNotif : null;

  const currentNotifRef = useRef(activeNotif);
  currentNotifRef.current = activeNotif;

  const remainingMsRef = useRef(AUTO_DISMISS_MS);
  const lastTickRef = useRef(null);
  const rafRef = useRef(null);

  // ── Animate out helper ──────────────────────────────────────────────────────
  const animateOut = useCallback((afterClose) => {
    cancelAnimationFrame(rafRef.current);
    setLeaving(true);
    setTimeout(() => {
      setMounted(false);
      setLeaving(false);
      afterClose?.();
    }, 350);
  }, []);

  // ── Sync mount state when active notification changes ──────────────────────
  useEffect(() => {
    if (currentNotif) {
      setLeaving(false);
      setProgress(100);
      remainingMsRef.current = AUTO_DISMISS_MS;
      lastTickRef.current = performance.now();
      setMounted(true);
    } else if (mounted && !leaving) {
      animateOut();
    }
  }, [currentNotif?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Progress & auto-dismiss loop with pause-on-hover ────────────────────────
  useEffect(() => {
    if (!mounted || leaving || !activeNotif) return;

    lastTickRef.current = performance.now();

    const tick = (now) => {
      if (!isPaused) {
        const delta = now - (lastTickRef.current || now);
        remainingMsRef.current = Math.max(0, remainingMsRef.current - delta);
        const pct = (remainingMsRef.current / AUTO_DISMISS_MS) * 100;
        setProgress(pct);

        if (remainingMsRef.current <= 0) {
          const targetId = currentNotifRef.current?.id;
          animateOut(() => {
            if (targetId) {
              dismissPopupNotification(targetId);
              setSessionDismissedIds(prev => [...prev, targetId]);
            }
          });
          return;
        }
      }
      lastTickRef.current = now;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [mounted, leaving, isPaused, activeNotif?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted || !activeNotif) return null;

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleClose = (e) => {
    e?.stopPropagation?.();
    const targetId = activeNotif.id;
    animateOut(() => {
      dismissPopupNotification(targetId);
      setSessionDismissedIds(prev => [...prev, targetId]);
    });
  };

  const handleAction = (e) => {
    e?.stopPropagation?.();
    const targetId = activeNotif.id;
    const tab = activeNotif.targetTab;
    if (tab) setActiveTab(tab);
    setTimeout(() => {
      if (setNotificationsOpen) setNotificationsOpen(true);
    }, 50);
    animateOut(() => {
      markNotificationAsRead(targetId);
      dismissPopupNotification(targetId);
      setSessionDismissedIds(prev => [...prev, targetId]);
    });
  };

  // ── Type styling ────────────────────────────────────────────────────────────
  const getIconInfo = (type) => {
    switch (type) {
      case 'success':
        return {
          icon: 'check_circle',
          badgeBg: 'bg-emerald-500/15',
          textClass: 'text-emerald-700 dark:text-emerald-400',
          borderClass: 'border-emerald-500/30',
          barClass: 'bg-emerald-500',
          tag: 'Update'
        };
      case 'warning':
        return {
          icon: 'shield',
          badgeBg: 'bg-amber-500/15',
          textClass: 'text-amber-700 dark:text-amber-400',
          borderClass: 'border-amber-500/30',
          barClass: 'bg-amber-500',
          tag: 'Notice'
        };
      case 'alert':
        return {
          icon: 'notifications_active',
          badgeBg: 'bg-rose-500/15',
          textClass: 'text-rose-700 dark:text-rose-400',
          borderClass: 'border-rose-500/30',
          barClass: 'bg-rose-500',
          tag: 'Alert'
        };
      case 'info':
      default:
        return {
          icon: 'bolt',
          badgeBg: 'bg-sky-500/15',
          textClass: 'text-sky-700 dark:text-sky-400',
          borderClass: 'border-sky-500/30',
          barClass: 'bg-[#6CBF3D]',
          tag: 'System Update'
        };
    }
  };

  const s = getIconInfo(activeNotif.type);

  const wrapperStyle = {
    transition: 'opacity 350ms cubic-bezier(0.4, 0, 0.2, 1), transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    opacity: leaving ? 0 : 1,
    transform: leaving
      ? 'translateX(calc(100% + 2rem)) scale(0.92)'
      : 'translateX(0) scale(1)',
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      style={wrapperStyle}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        lastTickRef.current = performance.now();
        setIsPaused(false);
      }}
      onClick={handleAction}
      className="no-print fixed top-20 right-3 sm:right-6 z-[60] max-w-sm sm:max-w-md w-[calc(100vw-1.5rem)] bg-surface-container-lowest/95 backdrop-blur-xl border border-primary/25 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.16)] overflow-hidden select-none animate-in slide-in-from-top-4 sm:slide-in-from-right-8 fade-in duration-300 cursor-pointer"
    >
      {/* Auto-dismiss progress countdown bar */}
      <div className="h-[3px] w-full bg-surface-container-high/60">
        <div
          className={`h-full ${s.barClass} transition-none`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-4 flex items-start justify-between gap-3">
        {/* Pulsing Icon */}
        <div className={`w-10 h-10 rounded-xl ${s.badgeBg} ${s.textClass} flex items-center justify-center shrink-0 border ${s.borderClass} shadow-xs`}>
          <span className="material-symbols-outlined text-[22px]">
            {activeNotif.icon || s.icon}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              {s.tag}
            </span>
            <span className="text-[11px] text-secondary font-medium">
              {activeNotif.timestamp || 'Just now'}
            </span>
          </div>

          <h4 className="font-headline-sm text-sm font-bold text-on-surface leading-snug line-clamp-2">
            {activeNotif.title}
          </h4>
          <p className="text-xs text-secondary mt-1 line-clamp-2 leading-relaxed">
            {activeNotif.description}
          </p>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-surface-container-high/60">
            <button
              type="button"
              onClick={handleAction}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6CBF3D] hover:bg-[#4F9A2C] text-white font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <span>{activeNotif.targetTab ? 'View Details' : 'View Update'}</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-secondary hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>

        {/* Close Icon button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Dismiss notification popup"
          className="w-7 h-7 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container-high flex items-center justify-center transition-colors shrink-0 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  );
}
