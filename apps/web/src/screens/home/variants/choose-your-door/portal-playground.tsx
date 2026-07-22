'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { resolveSkin } from '@my-noodles/ui';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { skinDefinitionToTint, useLandingHeroProducts } from '../../_shared';
import { LiquidBackdrop } from './liquid-backdrop';
import { PortalCard, type PortalKind } from './portal-card';

export function PortalPlayground() {
  const t = useTranslations('home.variants.b');
  const { products } = useLandingHeroProducts();
  const [hovered, setHovered] = useState<PortalKind | null>(null);

  const portals = useMemo(() => {
    const items = products?.items ?? [];
    return [
      {
        kind: 'collections' as const,
        title: t('portalCollections'),
        href: '/collections' as const,
        product: items[0],
      },
      {
        kind: 'catalog' as const,
        title: t('portalCatalog'),
        href: '/catalog' as const,
        product: items[1] ?? items[0],
      },
      {
        kind: 'feed' as const,
        title: t('portalFeed'),
        href: '/feed' as const,
        product: items[2] ?? items[0],
      },
    ];
  }, [products?.items, t]);

  const activeProduct = portals.find((portal) => portal.kind === hovered)?.product ?? portals[0]?.product;
  const accent = skinDefinitionToTint(
    activeProduct
      ? resolveSkin({
          brand: activeProduct.brand?.slug,
          country: activeProduct.country.code,
          category: activeProduct.category.slug,
          slug: activeProduct.slug,
        }).definition
      : null,
  );

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        px: { xs: 2, md: 4 },
        py: { xs: 6, md: 8 },
        overflow: 'hidden',
      }}
    >
      <LiquidBackdrop accent={accent} />
      <Stack spacing={3} sx={{ width: '100%', maxWidth: 960, mx: 'auto', position: 'relative' }}>
        <Stack spacing={1} sx={{ textAlign: 'center' }}>
          <Typography variant="h3" component="h1">
            {t('heroHeadline')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('heroSubline')}
          </Typography>
        </Stack>
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
          }}
        >
          {portals.map((portal) => (
            <PortalCard
              key={portal.kind}
              kind={portal.kind}
              title={portal.title}
              href={portal.href}
              imageUrl={portal.product?.images[0]}
              skinSeed={{
                brand: portal.product?.brand?.slug,
                country: portal.product?.country.code,
                category: portal.product?.category.slug,
                slug: portal.product?.slug,
              }}
              onHoverChange={setHovered}
            />
          ))}
        </Box>
      </Stack>
    </Box>
  );
}
