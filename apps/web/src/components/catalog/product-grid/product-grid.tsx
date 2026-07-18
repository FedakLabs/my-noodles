'use client';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { Product } from '@my-noodles/api-clients/storefront';

import { CatalogEmptyState } from '@/components/catalog/catalog-empty-state';
import { CatalogLoadMore } from '@/components/catalog/catalog-load-more';
import { CatalogLoadMoreButton } from '@/components/catalog/catalog-load-more-button';
import { CatalogPagination } from '@/components/catalog/catalog-pagination';

import { ProductCard } from '../product-card/product-card';
import { useCatalogGridColumns } from '../product-card/use-catalog-grid-columns';
import { ProductGridSkeleton } from './product-grid-skeleton';

type ProductGridPagination = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
};

type ProductGridLoadMore = {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
};

type ProductGridPaginationLoadMore = {
  isLoading: boolean;
  onLoadMore: () => void;
};

type ProductGridProps = {
  products: Product[];
  pagination?: ProductGridPagination;
  paginationLoadMore?: ProductGridPaginationLoadMore;
  loadMore?: ProductGridLoadMore;
  isPending?: boolean;
  skeletonCount?: number;
};

export function ProductGrid({
  products,
  pagination,
  paginationLoadMore,
  loadMore,
  isPending,
  skeletonCount = 8,
}: ProductGridProps) {
  const isInitialLoad = Boolean(isPending && products.length === 0);
  const gridColumns = useCatalogGridColumns();

  if (isInitialLoad) {
    return <ProductGridSkeleton count={skeletonCount} />;
  }

  return (
    <Stack spacing={2}>
      {products.length === 0 ? (
        <CatalogEmptyState />
      ) : (
        <Grid container spacing={2}>
          {products.map((product, index) => (
            <Grid key={product.id} size={{ xs: 6, sm: 4, md: 4 }} sx={{ minWidth: 0, display: 'flex' }}>
              <ProductCard product={product} gridIndex={index} gridColumns={gridColumns} />
            </Grid>
          ))}
        </Grid>
      )}

      {paginationLoadMore ? (
        <CatalogLoadMoreButton
          onLoadMore={paginationLoadMore.onLoadMore}
          isLoading={paginationLoadMore.isLoading}
        />
      ) : null}

      {pagination ? <CatalogPagination sx={{ alignSelf: 'center' }} {...pagination} /> : null}

      {loadMore ? <CatalogLoadMore {...loadMore} /> : null}
    </Stack>
  );
}
