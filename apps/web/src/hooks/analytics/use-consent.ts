'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';

import type { AnalyticsConsentChoice } from '@/shared/analytics';
import {
  ANALYTICS_ENABLED,
  readStoredConsent,
  updateConsentMode,
  writeStoredConsent,
} from '@/shared/analytics';

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
