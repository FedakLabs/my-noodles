import 'server-only';
import { fetchCollections } from '@/api/collections';
import { fetchProductsList } from '@/api/products';
import { runWithAppLocale } from '@/i18n/app-locale/server';
import type { AppLocale } from '@/i18n/routing';
import { routing } from '@/i18n/routing';
import { DEFAULT_CATALOG_FILTER_PARAMS } from '@/screens/catalog/search-params';

const SITEMAP_PRODUCT_PAGE_SIZE = 100;

export async function fetchAllProductSlugs(locale: AppLocale = routing.defaultLocale): Promise<string[]> {
  return await runWithAppLocale(locale, async () => {
    const slugs: string[] = [];
    let page = 1;

    while (true) {
      const response = await fetchProductsList({
        ...DEFAULT_CATALOG_FILTER_PARAMS,
        page,
        limit: SITEMAP_PRODUCT_PAGE_SIZE,
      });

      slugs.push(...response.items.map((product) => product.slug));

      if (page * SITEMAP_PRODUCT_PAGE_SIZE >= response.meta.total) {
        break;
      }

      page += 1;
    }

    return slugs;
  });
}

export async function fetchAllCollectionSlugs(locale: AppLocale = routing.defaultLocale): Promise<string[]> {
  return await runWithAppLocale(locale, async () => {
    const collections = await fetchCollections();

    return collections.map((collection) => collection.slug);
  });
}
