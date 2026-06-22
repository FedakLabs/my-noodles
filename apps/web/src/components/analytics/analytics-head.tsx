import { GoogleTagManager } from '@next/third-parties/google';

import { CONSENT_DEFAULT_SCRIPT } from '@/shared/analytics';
import { GTM_ID } from '@/shared/env';

export function AnalyticsHead() {
  if (!GTM_ID) {
    return null;
  }

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULT_SCRIPT }} />
      <GoogleTagManager gtmId={GTM_ID} />
    </>
  );
}
