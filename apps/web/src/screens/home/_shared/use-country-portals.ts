'use client';

import { useMemo } from 'react';

import { useProductFacets } from '@/api/products';

import { LANDING_FACETS_PARAMS } from '../landing-query-params';
import { useLandingHeroProducts } from './use-landing-hero-products';

export type CountryPortal = {
  /** Catalog `?country=` filter value — API facets key countries by slug, not ISO code. */
  slug: string;
  label: string;
  count: number;
  flagEmoji: string;
};

export function useCountryPortals() {
  const { productFacets, productFacetsIsInitialLoad, productFacetsIsError } =
    useProductFacets(LANDING_FACETS_PARAMS);
  const { products } = useLandingHeroProducts();

  const countries = useMemo<CountryPortal[]>(() => {
    const flagBySlug = new Map<string, string>();
    for (const product of products?.items ?? []) {
      if (product.country.slug && product.country.flagEmoji) {
        flagBySlug.set(product.country.slug, product.country.flagEmoji);
      }
    }

    const facets = productFacets?.facets.country ?? [];
    return facets
      .filter((facet) => facet.count > 0)
      .map((facet) => ({
        slug: facet.value,
        label: facet.label ?? facet.value,
        count: facet.count,
        flagEmoji: flagBySlug.get(facet.value) ?? '',
      }));
  }, [productFacets, products?.items]);
  return {
    countries,
    isLoading: productFacetsIsInitialLoad,
    isError: productFacetsIsError,
  };
}
