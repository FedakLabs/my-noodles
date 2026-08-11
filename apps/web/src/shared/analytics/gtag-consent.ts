export type GtagConsentState = 'granted' | 'denied';

/** Consent Mode params for `gtag('consent', …)`. */
export type GtagConsentParams = {
  ad_storage?: GtagConsentState;
  ad_user_data?: GtagConsentState;
  ad_personalization?: GtagConsentState;
  analytics_storage?: GtagConsentState;
  functionality_storage?: GtagConsentState;
  personalization_storage?: GtagConsentState;
  security_storage?: GtagConsentState;
  wait_for_update?: number;
};

type GtagConsentFn = (command: 'consent', action: 'default' | 'update', params: GtagConsentParams) => void;

/**
 * GTM Consent Mode only recognizes `dataLayer.push(arguments)`, not a plain array.
 * Keep that quirk here so call sites stay typed.
 */
function ensureGtag(): GtagConsentFn {
  if (typeof window.gtag === 'function') {
    return window.gtag;
  }

  window.dataLayer ??= [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params -- GTM requires the Arguments object
    window.dataLayer!.push(arguments);
  };

  return window.gtag;
}

export function updateGtagConsent(params: GtagConsentParams): void {
  ensureGtag()('consent', 'update', params);
}
