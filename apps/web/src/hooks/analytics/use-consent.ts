'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';

import type { AnalyticsConsentChoice } from '@/shared/analytics';
import { CONSENT_STORAGE_KEY, readStoredConsent } from '@/shared/analytics/consent';
import { updateGtagConsent } from '@/shared/analytics/gtag-consent';
import { ANALYTICS_ENABLED } from '@/shared/env';

const consentListeners = new Set<() => void>();

function subscribeConsent(listener: () => void) {
  consentListeners.add(listener);
  return () => {
    consentListeners.delete(listener);
  };
}

function notifyConsentListeners() {
  consentListeners.forEach((listener) => listener());
}

function writeStoredConsent(choice: Exclude<AnalyticsConsentChoice, 'pending'>) {
  window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
}

function updateConsentMode(analyticsGranted: boolean) {
  if (!ANALYTICS_ENABLED) {
    return;
  }

  updateGtagConsent({
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: analyticsGranted ? 'granted' : 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
  });
}

function getConsentSnapshot(): AnalyticsConsentChoice {
  if (!ANALYTICS_ENABLED) {
    return 'denied';
  }

  return readStoredConsent() ?? 'pending';
}

function getConsentServerSnapshot(): AnalyticsConsentChoice {
  // Must match SSR HTML; real value lives in localStorage (client-only).
  return 'pending';
}

/** false on SSR / hydration; true after client subscribe — avoids banner flash. */
function subscribeIsClient() {
  return () => {};
}

function getIsClientSnapshot() {
  return true;
}

function getIsClientServerSnapshot() {
  return false;
}

export function useConsent() {
  const choice = useSyncExternalStore(subscribeConsent, getConsentSnapshot, getConsentServerSnapshot);
  const isClient = useSyncExternalStore(subscribeIsClient, getIsClientSnapshot, getIsClientServerSnapshot);

  useEffect(() => {
    if (!ANALYTICS_ENABLED) {
      return;
    }

    if (choice === 'granted') {
      updateConsentMode(true);
    } else if (choice === 'denied') {
      updateConsentMode(false);
    }
  }, [choice]);

  const accept = useCallback(() => {
    writeStoredConsent('granted');
    updateConsentMode(true);
    notifyConsentListeners();
  }, []);

  const reject = useCallback(() => {
    writeStoredConsent('denied');
    updateConsentMode(false);
    notifyConsentListeners();
  }, []);

  return {
    choice,
    // Wait for client before showing — SSR always looks "pending" and caused a flicker.
    showBanner: isClient && ANALYTICS_ENABLED && choice === 'pending',
    accept,
    reject,
  };
}
