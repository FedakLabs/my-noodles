'use client';

import { useProductsList } from '@/api/products';

import { LANDING_HERO_PRODUCTS_PARAMS } from '../landing-query-params';

export function useLandingHeroProducts() {
  return useProductsList(LANDING_HERO_PRODUCTS_PARAMS);
}
