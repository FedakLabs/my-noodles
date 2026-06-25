'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { MediaGallery, resolveSkin, skinVarsToStyle } from '@my-noodles/ui';
import { useTranslations } from 'next-intl';

import { useProductDetail } from '@/api/products';
import { PageContainer } from '@/components/layout/page-container';
import { AlternativesRail } from '@/components/product/alternatives-rail/alternatives-rail';
import { ProductShareMenu } from '@/components/product/product-share-menu/product-share-menu';
import { useViewItem, useViewItemList } from '@/hooks/analytics';
import { useCartActions } from '@/hooks/cart';
import { useCurrency } from '@/hooks/currency';

type ProductScreenProps = {
  slug: string;
};

export function ProductScreen({ slug }: ProductScreenProps) {
  const t = useTranslations('product');
  const { formatCurrency } = useCurrency();
  const { addItem } = useCartActions();
  const { product, productIsInitialLoad, productIsLoadFailed, productIsEmpty } = useProductDetail(slug);

  useViewItem(product, Boolean(product) && !productIsInitialLoad && !productIsLoadFailed);
  useViewItemList(
    `product-alternatives:${slug}`,
    t('alternatives'),
    product?.alternatives,
    Boolean(product?.alternatives.length) && !productIsInitialLoad && !productIsLoadFailed,
  );

  if (productIsInitialLoad) {
    return (
      <PageContainer>
        <Typography color="text.secondary">{t('loading')}</Typography>
      </PageContainer>
    );
  }

  if (productIsLoadFailed) {
    return (
      <PageContainer>
        <Typography color="error">{t('error')}</Typography>
      </PageContainer>
    );
  }

  if (productIsEmpty) {
    return (
      <PageContainer>
        <Typography color="text.secondary">{t('empty')}</Typography>
      </PageContainer>
    );
  }

  if (!product) {
    return (
      <PageContainer>
        <Typography color="text.secondary">{t('loading')}</Typography>
      </PageContainer>
    );
  }

  const skin = resolveSkin({
    brand: product.brand?.slug,
    country: product.country.code,
    category: product.category.slug,
    slug: product.slug,
  });
  const heroImage = product.images[0];
  const mediaItems = [
    ...product.images.map((url, index) => ({
      type: 'image' as const,
      url,
      alt: product.name ?? product.slug,
      viewTransitionName: index === 0 ? `product-image-${product.slug}` : undefined,
    })),
    ...product.videos.map((url) => ({
      type: 'video' as const,
      url,
      alt: product.name ?? product.slug,
    })),
  ];

  return (
    <PageContainer>
      <Stack spacing={3} style={skinVarsToStyle(skin.cssVars)}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <MediaGallery
              items={mediaItems}
              labels={{
                gallery: t('mediaGallery'),
                slide: (index, total) => t('mediaSlide', { index, total }),
                video: {
                  play: t('playVideo'),
                  pause: t('pauseVideo'),
                  mute: t('muteVideo'),
                  unmute: t('unmuteVideo'),
                },
              }}
            />
          </Box>

          <Stack spacing={2} sx={{ flex: 1 }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
            >
              <Typography variant="h4" sx={{ minWidth: 0, flex: 1 }}>
                {product.name}
              </Typography>
              <ProductShareMenu productName={product.name ?? product.slug} productSlug={product.slug} />
            </Stack>
            <Typography variant="body1" color="text.secondary">
              {product.country.name} · {product.category.name}
            </Typography>
            <Typography variant="h5">{formatCurrency(product.priceMinor, product.currency)}</Typography>
            {product.description ? <Typography variant="body1">{product.description}</Typography> : null}
            {product.forWhom ? (
              <Typography variant="body2">
                {t('forWhom')}: {product.forWhom}
              </Typography>
            ) : null}
            {product.story ? (
              <Typography variant="body2" color="text.secondary">
                {product.story}
              </Typography>
            ) : null}

            <Button
              variant="contained"
              size="large"
              disabled={!product.inStock}
              onClick={() => {
                const productId = product.id;
                addItem({
                  productId,
                  slug: product.slug,
                  title: product.name ?? product.slug,
                  priceMinor: product.priceMinor,
                  currency: product.currency,
                  imageUrl: heroImage,
                });
              }}
            >
              {product.inStock ? t('addToCart') : t('outOfStock')}
            </Button>
          </Stack>
        </Stack>

        {product.alternatives.length > 0 ? (
          <Stack spacing={2}>
            <Typography variant="h5">{t('alternatives')}</Typography>
            <AlternativesRail products={product.alternatives} ariaLabel={t('alternatives')} />
          </Stack>
        ) : null}
      </Stack>
    </PageContainer>
  );
}
