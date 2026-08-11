import type { GtagConsentParams } from '@/shared/analytics/gtag-consent';

export {};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (command: 'consent', action: 'default' | 'update', params: GtagConsentParams) => void;
  }
}
