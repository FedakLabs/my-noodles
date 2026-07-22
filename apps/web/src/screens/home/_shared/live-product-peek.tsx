'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Product } from '@my-noodles/api-clients/storefront';
import { DiscoveryCard, resolveSkin, useDiscoveryCardView } from '@my-noodles/ui';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { useProductDetail } from '@/api/products';
import { useCurrency } from '@/hooks/currency';
import { Link } from '@/i18n/navigation';

type LiveProductPeekProps = {
  product: Product;
  maxWidth?: number | string;
};

export function LiveProductPeek({ product, maxWidth = 360 }: LiveProductPeekProps) {
  const t = useTranslations('home.shared');
  const tCatalog = useTranslations('catalog');
  const tProduct = useTranslations('product');
  const { formatCurrency } = useCurrency();
  const { view, isPreview, toggleView } = useDiscoveryCardView();

  const skin = resolveSkin({
    brand: product.brand?.slug,
    country: product.country.code,
    category: product.category.slug,
    slug: product.slug,
  });

  const alt = product.name ?? product.slug;
  const { product: detail, productIsInitialLoad } = useProductDetail(product.slug, {
    enabled: isPreview,
  });

  const mediaItems = useMemo(() => {
    const images = detail?.images?.length ? detail.images : product.images;
    return images.map((url, index) => ({
      type: 'image' as const,
      url,
      alt,
      viewTransitionName: index === 0 ? `product-image-${product.slug}` : undefined,
    }));
  }, [alt, detail?.images, product.images, product.slug]);

  const detailsContent = useMemo(() => {
    if (!detail) {
      return null;
    }

    const previewCopy = detail.story ?? detail.description;
    const previewHeading = detail.story
      ? tProduct('story')
      : detail.description
        ? tProduct('description')
        : null;

    return (
      <Stack spacing={1.5}>
        {previewCopy ? (
          <Stack spacing={0.5}>
            {previewHeading ? <Typography variant="subtitle2">{previewHeading}</Typography> : null}
            <Typography variant="body2" color="text.secondary">
              {previewCopy}
            </Typography>
          </Stack>
        ) : null}
        {detail.forWhom ? (
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">{tProduct('forWhom')}</Typography>
            <Typography variant="body2">{detail.forWhom}</Typography>
          </Stack>
        ) : null}
      </Stack>
    );
  }, [detail, tProduct]);

  const mediaLabels = useMemo(
    () => ({
      gallery: tCatalog('imageGallery'),
      slide: (index: number, total: number) => tCatalog('imageSlide', { index, total }),
      video: {
        play: tProduct('playVideo'),
        pause: tProduct('pauseVideo'),
        mute: tProduct('muteVideo'),
        unmute: tProduct('unmuteVideo'),
      },
    }),
    [tCatalog, tProduct],
  );

  return (
    <Box sx={{ width: '100%', maxWidth, mx: 'auto' }}>
      <DiscoveryCard.View
        view={view}
        skin={skin}
        onClick={toggleView}
        media={
          <DiscoveryCard.Media
            unframed
            items={mediaItems}
            mode={isPreview ? 'carousel' : 'static'}
            labels={mediaLabels}
          />
        }
        meta={
          <DiscoveryCard.Body>
            <Stack spacing={1}>
              {product.isTriedByUs ? (
                <Chip
                  size="small"
                  color="primary"
                  label={t('triedByUsBadge')}
                  sx={{ alignSelf: 'flex-start' }}
                />
              ) : null}
              <Typography variant="subtitle1">{product.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {product.country.flagEmoji ? `${product.country.flagEmoji} ` : ''}
                {product.country.name}
              </Typography>
              <Typography variant="subtitle2">
                {formatCurrency(product.priceMinor, product.currency)}
              </Typography>
            </Stack>
          </DiscoveryCard.Body>
        }
        actions={
          <DiscoveryCard.Actions
            actions={[
              <Typography
                key="details"
                component={Link}
                href={`/product/${product.slug}`}
                variant="button"
                color="inherit"
                onClick={(event) => event.stopPropagation()}
                sx={{ textDecoration: 'none', px: 1.5, py: 1 }}
              >
                {tCatalog('goToProduct')}
              </Typography>,
            ]}
          />
        }
        details={{
          loading: productIsInitialLoad,
          content: productIsInitialLoad ? null : detailsContent,
        }}
      />
    </Box>
  );
}
