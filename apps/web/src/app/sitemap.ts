import type { MetadataRoute } from 'next';

import type { AppLocale } from '@/i18n/routing';
import { routing } from '@/i18n/routing';
import { absoluteUrl, localePath } from '@/shared/seo';
import { fetchAllProductSlugs } from '@/shared/seo/sitemap-data';

const STATIC_INDEXABLE_PATHS = ['/catalog', '/collections', '/contacts'] as const;

function buildStaticSitemapEntries(locale: AppLocale): MetadataRoute.Sitemap {
  return STATIC_INDEXABLE_PATHS.map((pathname) => ({
    url: absoluteUrl(localePath(locale, pathname)),
    changeFrequency: pathname === '/catalog' ? ('daily' as const) : ('weekly' as const),
    priority: pathname === '/catalog' ? 1 : 0.8,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const productSlugs = await fetchAllProductSlugs();

  return routing.locales.flatMap((locale) => [
    ...buildStaticSitemapEntries(locale),
    ...productSlugs.map((slug) => ({
      url: absoluteUrl(localePath(locale, `/product/${slug}`)),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ]);
}
