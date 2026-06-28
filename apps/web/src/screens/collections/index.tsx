'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { useCollectionDetail } from '@/api/collections';
import { useProductsList } from '@/api/products';
import { ProductGrid } from '@/components/catalog/product-grid/product-grid';
import { PageContainer } from '@/components/layout/page-container';
import { useViewItemList } from '@/hooks/analytics';
import { DEFAULT_CATALOG_FILTER_PARAMS } from '@/screens/catalog/search-params';

type CollectionScreenProps = {
  slug: string;
};

export function CollectionScreen({ slug }: CollectionScreenProps) {
  const t = useTranslations('collections');
  const { collection, collectionIsInitialLoad, collectionIsError } = useCollectionDetail(slug);
  const { products, productsIsInitialLoad } = useProductsList({
    ...DEFAULT_CATALOG_FILTER_PARAMS,
    page: 1,
    limit: 48,
    collection: collection?.code ?? null,
  });

  const collectionProducts =
    collection && products?.items
      ? products.items.filter((product) => collection.productSlugs.includes(product.slug))
      : [];

  useViewItemList(
    `collection:${slug}`,
    collection?.name ?? slug,
    collectionProducts,
    Boolean(collection) && !collectionIsInitialLoad && !productsIsInitialLoad,
  );

  if (collectionIsInitialLoad) {
    return (
      <PageContainer>
        <Typography color="text.secondary">{t('loading')}</Typography>
      </PageContainer>
    );
  }

  if (collectionIsError) {
    return (
      <PageContainer>
        <Typography color="error">{t('error')}</Typography>
      </PageContainer>
    );
  }

  if (!collection) {
    return (
      <PageContainer>
        <Typography color="text.secondary">{t('empty')}</Typography>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h4">{collection.name}</Typography>
          {collection.description ? (
            <Typography color="text.secondary">{collection.description}</Typography>
          ) : null}
        </Stack>
        <ProductGrid products={collectionProducts} isPending={productsIsInitialLoad} skeletonCount={12} />
      </Stack>
    </PageContainer>
  );
}
