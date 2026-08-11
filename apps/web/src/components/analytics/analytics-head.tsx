import { GoogleTagManager } from '@next/third-parties/google';

import { ANALYTICS_ENABLED, env } from '@/shared/env';

/** Must run before GTM so Consent Mode defaults to denied. */
const CONSENT_DEFAULT_SCRIPT = `
window.dataLayer = window.dataLayer || [];
window.gtag = function gtag(){dataLayer.push(arguments);};
window.gtag('consent', 'default', {
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

export function AnalyticsHead() {
  if (!ANALYTICS_ENABLED) {
    return null;
  }

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULT_SCRIPT }} />
      <GoogleTagManager gtmId={env.NEXT_PUBLIC_GTM_ID!} />
    </>
  );
}
