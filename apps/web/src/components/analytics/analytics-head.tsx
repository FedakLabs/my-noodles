import { GoogleTagManager } from '@next/third-parties/google';

import { CONSENT_DEFAULT_SCRIPT } from '@/shared/analytics';
import { env } from '@/shared/env';

export function AnalyticsHead() {
  if (!env.NEXT_PUBLIC_GTM_ID) {
    return null;
  }

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULT_SCRIPT }} />
      <GoogleTagManager gtmId={env.NEXT_PUBLIC_GTM_ID} />
    </>
  );
}
