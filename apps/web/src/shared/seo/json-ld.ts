import type { Product } from '@my-noodles/api-clients/storefront';
import { SUPPORTED_LOCALES } from '@my-noodles/locale';
import { minorToMajor } from '@my-noodles/utils';

import type { AppLocale } from '@/i18n/routing';
import { APP_ROUTES } from '@/shared/routes';

import { absoluteUrl, localePath } from './urls';

type JsonLdGraph = Record<string, unknown>;

export function buildOrganizationWebSiteJsonLd(siteName: string): JsonLdGraph {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: siteName,
        url: absoluteUrl('/'),
      },
      {
        '@type': 'WebSite',
        name: siteName,
        url: absoluteUrl('/'),
        inLanguage: [...SUPPORTED_LOCALES],
      },
    ],
  };
}

export function buildProductJsonLd(product: Product, locale: AppLocale): JsonLdGraph {
  const productUrl = absoluteUrl(localePath(locale, APP_ROUTES.product(product.slug)));
  const description = product.description ?? product.story ?? undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    ...(description ? { description } : {}),
    ...(product.images.length > 0 ? { image: product.images } : {}),
    sku: product.slug,
    url: productUrl,
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: product.currency,
      price: minorToMajor(product.priceMinor, product.currency),
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };
}
