import type { ProductSummaryDto } from '@my-noodles/api-clients/storefront';

import type { CatalogViewMode } from '@/components/catalog-view-mode';

export type CatalogProductGridSharedProps = {
  onOpenFilters: () => void;
  isViewModeResetting: boolean;
  clearViewModeReset: () => void;
  viewMode: CatalogViewMode;
  listTitle: string;
};

export function catalogGridProducts(
  showSkeleton: boolean,
  items: readonly ProductSummaryDto[],
): ProductSummaryDto[] {
  return showSkeleton ? [] : [...items];
}
