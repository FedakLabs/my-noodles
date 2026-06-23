import 'server-only';

import type { Locale } from '@my-noodles/api-clients/storefront';

import { fetchCollections } from '@/api/collections';
import { fetchProductsList } from '@/api/products';
import { DEFAULT_CATALOG_FILTER_PARAMS } from '@/screens/catalog/search-params';

const SITEMAP_PRODUCT_PAGE_SIZE = 100;

export async function fetchAllProductSlugs(locale: Locale = 'uk'): Promise<string[]> {
  const slugs: string[] = [];
  let page = 1;

  while (true) {
    const response = await fetchProductsList(
      {
        ...DEFAULT_CATALOG_FILTER_PARAMS,
        page,
        limit: SITEMAP_PRODUCT_PAGE_SIZE,
      },
      locale,
    );

    slugs.push(...response.items.map((product) => product.slug));

    if (page * SITEMAP_PRODUCT_PAGE_SIZE >= response.meta.total) {
      break;
    }

    page += 1;
  }

  return slugs;
}

export async function fetchAllCollectionSlugs(locale: Locale = 'uk'): Promise<string[]> {
  const collections = await fetchCollections(locale);

  return collections.map((collection) => collection.slug);
}
