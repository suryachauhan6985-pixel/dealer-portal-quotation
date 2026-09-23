import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { APP_VERSION, RELEASE_DATE, CURRENT_RELEASE_CHANGELOG } from '../../config/version';

export const CURRENT_APP_VERSION = `v${APP_VERSION}`;

// Stable ID for the current release — changes with every version bump
const RELEASE_NOTIF_ID = `release-${APP_VERSION}`;

export default function AppUpdateModal() {
  const { addNotification, notifications, dismissedNotifIds } = useApp();

  useEffect(() => {
    if (!addNotification) return;

    // Do not re-seed if user has explicitly dismissed this notification (SR-46)
    if (dismissedNotifIds?.includes(RELEASE_NOTIF_ID)) return;

    // Always ensure the current-version notification exists in the list.
    // Using a stable ID means addNotification can safely de-duplicate.
    const alreadySeeded = notifications?.some(n => n.id === RELEASE_NOTIF_ID);
    if (!alreadySeeded) {
      addNotification({
        id: RELEASE_NOTIF_ID, // stable, version-keyed ID
        title: `System Updated to ${CURRENT_APP_VERSION}`,
        description: `${CURRENT_RELEASE_CHANGELOG?.title || 'System Update'} (${RELEASE_DATE}). Highlights: ${(CURRENT_RELEASE_CHANGELOG?.highlights ?? CURRENT_RELEASE_CHANGELOG?.categories?.features ?? []).join(' | ')}`,
        type: 'success',
        icon: 'system_update',
        audience: 'all'
      });
    }

    // Track installed version for other consumers
    localStorage.setItem('sunvine_installed_version', CURRENT_APP_VERSION);

    // Auto-update Service Worker in background
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                installingWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          }
        });
      }).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addNotification]);

  return null;
}
