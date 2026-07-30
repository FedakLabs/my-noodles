import { ANALYTICS_ENABLED } from '@/shared/env';

import type { AnalyticsConsentChoice } from './types';

export const CONSENT_STORAGE_KEY = 'my-noodles-analytics-consent';

export function readStoredConsent(): AnalyticsConsentChoice | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);

  if (stored === 'granted' || stored === 'denied') {
    return stored;
  }

  return null;
}

/** Gate for imperative GTM pushes in `track.ts` (not React). */
export function isAnalyticsAllowed(): boolean {
  return ANALYTICS_ENABLED && readStoredConsent() === 'granted';
}
