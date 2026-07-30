'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';

import type { AnalyticsConsentChoice } from '@/shared/analytics';
import { CONSENT_STORAGE_KEY, readStoredConsent } from '@/shared/analytics/consent';
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

  window.dataLayer = window.dataLayer ?? [];

  const gtag = (...args: unknown[]) => {
    window.dataLayer?.push(args);
  };

  gtag('consent', 'update', {
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
  return 'pending';
}

export function useConsent() {
  const choice = useSyncExternalStore(subscribeConsent, getConsentSnapshot, getConsentServerSnapshot);

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
    showBanner: ANALYTICS_ENABLED && choice === 'pending',
    accept,
    reject,
  };
}
