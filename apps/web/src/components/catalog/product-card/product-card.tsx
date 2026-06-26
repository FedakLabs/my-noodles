'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ProductSummaryDto } from '@my-noodles/api-clients/storefront';
import {
  DiscoveryCard,
  discoveryCardGroupedCartButtonSx,
  discoveryCardGroupedDetailsButtonSx,
  iconStyle,
  resolveSkin,
  useDiscoveryCardView,
} from '@my-noodles/ui';
import CartIcon from '@my-noodles/ui/icons/cart.svg';
import ChevronRightIcon from '@my-noodles/ui/icons/chevron-right.svg';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useRef } from 'react';

import { useProductDetail } from '@/api/products';
import { useCartActions } from '@/hooks/cart';
import { useCurrency } from '@/hooks/currency';
import { Link } from '@/i18n/navigation';
import { testIds } from '@/tests/test-ids';

import { productCardPreviewAnchor } from './product-card-preview-anchor';
import { ProductCardPreviewDetailsEmpty } from './product-card-preview-details-empty';
import { labelQuickActionSx, summaryTitleSx } from './product-card-sx';
import { CATALOG_PRODUCT_GRID_COLUMNS } from './use-catalog-grid-columns';
import { usePreviewCollapse } from './use-preview-collapse';

export type ProductCardProps = {
  product: ProductSummaryDto;
  /** Grid index for overlay anchor positioning. */
  gridIndex?: number;
  /** Column count for preview anchor — pass from ProductGrid to avoid per-card media-query drift. */
  gridColumns?: number;
  /** Enable click-to-expand preview (catalog grid). */
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
  const { addItem } = useCartActions();
  const skin = resolveSkin({
    brand: product.brand?.slug,
    country: product.country.code,
    category: product.category.slug,
    slug: product.slug,
  });
  const alt = product.name ?? product.slug;
  const gridColumns = gridColumnsProp ?? CATALOG_PRODUCT_GRID_COLUMNS.sm;
  const viewAnchor = productCardPreviewAnchor(gridIndex, gridColumns);

  const { view, isPreview, toggleView, setView } = useDiscoveryCardView();
  const rootRef = useRef<HTMLDivElement>(null);
  const previewActive = isPreview && previewEnabled;

  const { product: detail, productIsInitialLoad } = useProductDetail(product.slug, {
    enabled: previewActive,
  });

  const handleCollapse = useCallback(() => {
    setView('summary');
  }, [setView]);

  usePreviewCollapse(isPreview, handleCollapse, rootRef);

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

  const cardDetailsContent = useMemo(() => {
    if (!detail) {
      return <ProductCardPreviewDetailsEmpty message={t('previewDetailsEmpty')} />;
    }

    const previewCopy = detail.story ?? detail.description;
    const previewHeading = detail.story
      ? tProduct('story')
      : detail.description
        ? tProduct('description')
        : null;
    const hasForWhom = Boolean(detail.forWhom);

    if (!previewCopy && !hasForWhom) {
      return <ProductCardPreviewDetailsEmpty message={t('previewDetailsEmpty')} />;
    }

    return (
      <Stack spacing={1.5}>
        {previewCopy ? (
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">{previewHeading}</Typography>
            <Typography variant="body2" color="text.secondary">
              {previewCopy}
            </Typography>
          </Stack>
        ) : null}
        {hasForWhom ? (
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">{tProduct('forWhom')}</Typography>
            <Typography variant="body2">{detail.forWhom}</Typography>
          </Stack>
        ) : null}
      </Stack>
    );
  }, [detail, t, tProduct]);

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

  const cardMeta = (
    <DiscoveryCard.Body>
      <Typography variant="subtitle1" sx={!isPreview ? summaryTitleSx : undefined}>
        {product.name}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {product.country.name}
      </Typography>
      <Typography variant="subtitle2" sx={{ mt: 0.5 }}>
        {formatCurrency(product.priceMinor, product.currency)}
      </Typography>
    </DiscoveryCard.Body>
  );

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

  const quickActions = (
    <DiscoveryCard.Actions
      actions={[
        <Button
          key="cart"
          variant="text"
          color="inherit"
          size="small"
          sx={[labelQuickActionSx, discoveryCardGroupedDetailsButtonSx]}
          disabled={!product.inStock}
          aria-label={isPreview ? undefined : product.inStock ? t('addToCart') : t('outOfStock')}
          data-testid={testIds.catalog.addToCart(product.slug)}
          onClick={(event) => {
            event.stopPropagation();
            handleAddToCart();
          }}
        >
          <Stack direction="row" spacing={isPreview ? 1 : 0} sx={{ minWidth: 0, alignItems: 'center' }}>
            <CartIcon aria-hidden style={iconStyle({ size: 20, color: 'inherit' })} />
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
          sx={[labelQuickActionSx, discoveryCardGroupedCartButtonSx]}
          aria-label={isPreview ? undefined : t('goToDetails')}
          onClick={(event) => event.stopPropagation()}
        >
          <Stack direction="row" spacing={isPreview ? 1 : 0} sx={{ minWidth: 0, alignItems: 'center' }}>
            <ChevronRightIcon aria-hidden style={iconStyle({ size: 20, color: 'inherit' })} />
            <DiscoveryCard.Collapse expanded={isPreview} orientation="horizontal">
              {t('goToProduct')}
            </DiscoveryCard.Collapse>
          </Stack>
        </Button>,
      ]}
    />
  );

  const cardMedia = (
    <DiscoveryCard.Media
      unframed
      items={mediaItems}
      mode={isPreview ? 'carousel' : 'static'}
      labels={mediaLabels}
    />
  );

  return (
    <Box ref={rootRef} sx={{ height: '100%', width: '100%', minWidth: 0 }}>
      <DiscoveryCard.View
        view={view}
        anchor={viewAnchor}
        skin={skin}
        media={cardMedia}
        meta={cardMeta}
        actions={quickActions}
        onClick={previewEnabled ? toggleView : undefined}
        details={{
          loading: productIsInitialLoad,
          content: productIsInitialLoad ? null : cardDetailsContent,
        }}
      />
    </Box>
  );
}
