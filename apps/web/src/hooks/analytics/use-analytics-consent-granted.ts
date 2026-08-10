'use client';

import { useConsent } from './use-consent';

/** True when the guest accepted analytics — safe gate for view/checkout effect hooks. */
export function useAnalyticsConsentGranted(): boolean {
  const { choice } = useConsent();
  return choice === 'granted';
}
