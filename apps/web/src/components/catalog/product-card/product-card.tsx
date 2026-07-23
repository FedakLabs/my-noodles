'use client';

import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import type { Product } from '@my-noodles/api-clients/storefront';
import {
  DiscoveryCard,
  discoveryCardGroupedCartButtonSx,
  discoveryCardGroupedDetailsButtonSx,
  ProductDiscoveryCard,
  productDiscoveryCardLabelQuickActionSx,
} from '@my-noodles/ui';
import CartIcon from '@my-noodles/ui/icons/cart.svg';
import ChevronRightIcon from '@my-noodles/ui/icons/chevron-right.svg';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';

import { useProductDetail } from '@/api/products';
import { useCartActions } from '@/hooks/cart';
import { useCurrency } from '@/hooks/currency';
import { Link } from '@/i18n/navigation';

import { CATALOG_PRODUCT_GRID_COLUMNS } from './use-catalog-grid-columns';

export type ProductCardProps = {
  product: Product;
  gridIndex?: number;
  /** Column count for preview anchor — pass from ProductGrid to avoid per-card media-query drift. */
  gridColumns?: number;
  previewEnabled?: boolean;
};

export function ProductCard({
  product,
  gridIndex = 0,
  gridColumns: gridColumnsProp,
  previewEnabled = true,
}: ProductCardProps) {
  const t = useTranslations('catalog');
  const tProduct = useTranslations('product');
  const { formatCurrency } = useCurrency();
  const { addItem, isAddingProduct } = useCartActions();
  const alt = product.name ?? product.slug;
  const gridColumns = gridColumnsProp ?? CATALOG_PRODUCT_GRID_COLUMNS.sm;
  const [previewActive, setPreviewActive] = useState(false);

  const handlePreviewChange = useCallback((isPreview: boolean) => {
    setPreviewActive(isPreview);
  }, []);

  const { product: detail, productIsInitialLoad } = useProductDetail(product.slug, {
    enabled: previewActive && previewEnabled,
  });

  const mediaItems = useMemo(() => {
    if (!detail) {
      return product.images.map((url, index) => ({
        type: 'image' as const,
        url,
        alt: alt,
        viewTransitionName: index === 0 ? `product-image-${product.slug}` : undefined,
      }));
    }

    return [
      ...detail.images.map((url, index) => ({
        type: 'image' as const,
        url,
        alt: alt,
        viewTransitionName: index === 0 ? `product-image-${product.slug}` : undefined,
      })),
      ...detail.videos.map((url) => ({
        type: 'video' as const,
        url,
        alt: alt,
      })),
    ];
  }, [detail, alt, product.images, product.slug]);

  const mediaLabels = useMemo(
    () => ({
      gallery: t('imageGallery'),
      slide: (index: number, total: number) => t('imageSlide', { index, total }),
      video: {
        play: tProduct('playVideo'),
        pause: tProduct('pauseVideo'),
        mute: tProduct('muteVideo'),
        unmute: tProduct('unmuteVideo'),
      },
    }),
    [t, tProduct],
  );

  const isAdding = isAddingProduct(product.id);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      title: alt,
      priceMinor: product.priceMinor,
      currency: product.currency,
      imageUrl: product.images[0],
    });
  };

  return (
    <ProductDiscoveryCard
      name={product.name ?? product.slug}
      countryLabel={product.country.name ?? ''}
      priceLabel={formatCurrency(product.priceMinor, product.currency)}
      mediaItems={mediaItems}
      skinInput={{
        brand: product.brand?.slug,
        country: product.country.code,
        category: product.category.slug,
        slug: product.slug,
      }}
      previewEnabled={previewEnabled}
      gridIndex={gridIndex}
      gridColumns={gridColumns}
      mediaLabels={mediaLabels}
      onPreviewChange={handlePreviewChange}
      details={{
        loading: productIsInitialLoad,
        story: detail?.story,
        description: detail?.description,
        forWhom: detail?.forWhom,
        emptyMessage: t('previewDetailsEmpty'),
        storyLabel: tProduct('story'),
        descriptionLabel: tProduct('description'),
        forWhomLabel: tProduct('forWhom'),
      }}
      actions={({ isPreview }) => [
        <Button
          key="cart"
          variant="text"
          color="inherit"
          size="small"
          sx={[productDiscoveryCardLabelQuickActionSx, discoveryCardGroupedDetailsButtonSx]}
          disabled={!product.inStock || isAdding}
          aria-busy={isAdding}
          aria-label={isPreview ? undefined : product.inStock ? t('addToCart') : t('outOfStock')}
          data-testid={`catalog-add-to-cart--${product.slug}`}
          onClick={(event) => {
            event.stopPropagation();
            handleAddToCart();
          }}
        >
          <Stack direction="row" spacing={isPreview ? 1 : 0} sx={{ minWidth: 0, alignItems: 'center' }}>
            {isAdding ? (
              <CircularProgress size={20} color="inherit" aria-hidden />
            ) : (
              <CartIcon aria-hidden size={20} />
            )}
            <DiscoveryCard.Collapse expanded={isPreview} orientation="horizontal">
              {product.inStock ? t('addShort') : t('outOfStock')}
            </DiscoveryCard.Collapse>
          </Stack>
        </Button>,
        <Button
          key="details"
          component={Link}
          href={`/product/${product.slug}`}
          variant="text"
          color="inherit"
          size="small"
          sx={[productDiscoveryCardLabelQuickActionSx, discoveryCardGroupedCartButtonSx]}
          aria-label={isPreview ? undefined : t('goToDetails')}
          onClick={(event) => event.stopPropagation()}
        >
          <Stack direction="row" spacing={isPreview ? 1 : 0} sx={{ minWidth: 0, alignItems: 'center' }}>
            <ChevronRightIcon aria-hidden size={20} />
            <DiscoveryCard.Collapse expanded={isPreview} orientation="horizontal">
              {t('goToProduct')}
            </DiscoveryCard.Collapse>
          </Stack>
        </Button>,
      ]}
    />
  );
}
