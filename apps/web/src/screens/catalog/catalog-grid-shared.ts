import type { Product } from '@my-noodles/api-clients/storefront';

import type { CatalogViewMode } from '@/components/catalog-view-mode';

export type CatalogProductGridSharedProps = {
  isViewModeResetting: boolean;
  clearViewModeReset: () => void;
  viewMode: CatalogViewMode;
  listTitle: string;
};

export function catalogGridProducts(showSkeleton: boolean, items: readonly Product[]): Product[] {
  return showSkeleton ? [] : [...items];
}
