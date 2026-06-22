import type { MetadataRoute } from 'next';

import { routing } from '@/i18n/routing';
import { SITE_URL } from '@/shared/env';
import { absoluteUrl, localePath } from '@/shared/seo';

const NON_INDEXABLE_PATHS = ['/cart', '/checkout', '/checkout/success'] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: routing.locales.flatMap((locale) =>
        NON_INDEXABLE_PATHS.map((pathname) => localePath(locale, pathname)),
      ),
    },
    sitemap: absoluteUrl('/sitemap.xml'),
    host: SITE_URL,
  };
}
