import { ANALYTICS_ENABLED } from './config';
import type { AnalyticsConsentChoice } from './types';

export const CONSENT_STORAGE_KEY = 'my-noodles-analytics-consent';

export const CONSENT_DEFAULT_SCRIPT = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'denied',
  personalization_storage: 'denied',
  security_storage: 'granted',
  wait_for_update: 500
});
`.trim();

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

export function writeStoredConsent(choice: Exclude<AnalyticsConsentChoice, 'pending'>) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
}

export function updateConsentMode(analyticsGranted: boolean) {
  if (typeof window === 'undefined' || !ANALYTICS_ENABLED) {
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

export function isAnalyticsAllowed(): boolean {
  return ANALYTICS_ENABLED && readStoredConsent() === 'granted';
}
