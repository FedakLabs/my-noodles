'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { resolveSkin, skinVarsToStyle } from '@my-noodles/ui';
import { useLocale, useTranslations } from 'next-intl';

import { useProductDetail } from '@/api/products';
import { ProductGrid } from '@/components/catalog/product-grid/product-grid';
import { PageContainer } from '@/components/layout/page-container';
import { useCartActions } from '@/hooks/cart';
import { formatCurrency } from '@/utils/format-currency';

type ProductScreenProps = {
  slug: string;
};

export function ProductScreen({ slug }: ProductScreenProps) {
  const t = useTranslations('product');
  const locale = useLocale();
  const { addItem } = useCartActions();
  const { product, productIsInitialLoad, productIsLoadFailed, productIsEmpty } = useProductDetail(slug);

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

  if (productIsEmpty || !product) {
    return (
      <PageContainer>
        <Typography color="text.secondary">{t('empty')}</Typography>
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

  return (
    <PageContainer>
      <Stack spacing={3} style={skinVarsToStyle(skin.cssVars)}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          <Box
            sx={{
              flex: 1,
              aspectRatio: '1',
              borderRadius: 1.5,
              overflow: 'hidden',
              bgcolor: 'action.hover',
            }}
          >
            {heroImage ? (
              <Box
                component="img"
                src={heroImage}
                alt={product.name ?? product.slug}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : null}
          </Box>

          <Stack spacing={2} sx={{ flex: 1 }}>
            <Typography variant="h4">{product.name}</Typography>
            <Typography variant="body1" color="text.secondary">
              {product.country.name} · {product.category.name}
            </Typography>
            <Typography variant="h5">
              {formatCurrency(product.priceMinor, product.currency, locale)}
            </Typography>
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
            <ProductGrid products={product.alternatives} />
          </Stack>
        ) : null}
      </Stack>
    </PageContainer>
  );
}
