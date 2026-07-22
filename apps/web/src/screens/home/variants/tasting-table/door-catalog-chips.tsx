'use client';

import { useAutoAnimate } from '@formkit/auto-animate/react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { resolveSkin } from '@my-noodles/ui';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { Link } from '@/i18n/navigation';

import { skinResultToGradient, useCountryPortals, useLandingHeroProducts } from '../../_shared';

export function DoorCatalogChips() {
  const t = useTranslations('home.variants.a');
  const { countries } = useCountryPortals();
  const { products } = useLandingHeroProducts();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [gridRef] = useAutoAnimate();

  const chips = countries.slice(0, 5);
  const items = useMemo(() => {
    const all = products?.items ?? [];
    if (!selectedCountry) {
      return all.slice(0, 6);
    }
    return all.filter((product) => product.country.slug === selectedCountry).slice(0, 6);
  }, [products?.items, selectedCountry]);

  return (
    <Stack spacing={1.5} sx={{ height: '100%' }}>
      <Typography variant="h6">{t('doorsCatalogTitle')}</Typography>
      <Typography variant="body2" color="text.secondary">
        {t('doorsCatalogBody')}
      </Typography>
      <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap' }}>
        <Chip
          size="small"
          label={t('doorCatalogChipAll')}
          color={selectedCountry == null ? 'primary' : 'default'}
          onClick={() => setSelectedCountry(null)}
        />
        {chips.map((country) => (
          <Chip
            key={country.slug}
            size="small"
            label={`${country.flagEmoji} ${country.label}`}
            color={selectedCountry === country.slug ? 'primary' : 'default'}
            onClick={() => setSelectedCountry(country.slug)}
          />
        ))}
      </Stack>
      <Box
        ref={gridRef}
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 1,
          minHeight: 120,
        }}
      >
        {items.map((product) => {
          const skin = resolveSkin({
            brand: product.brand?.slug,
            country: product.country.code,
            category: product.category.slug,
            slug: product.slug,
          });

          return (
            <Box
              key={product.id}
              component={Link}
              href={`/catalog?country=${encodeURIComponent(product.country.slug)}`}
              sx={{
                aspectRatio: '1',
                borderRadius: 2,
                overflow: 'hidden',
                backgroundImage: product.images[0] ? `url(${product.images[0]})` : skinResultToGradient(skin),
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
              aria-label={product.name ?? product.slug}
            />
          );
        })}
      </Box>
    </Stack>
  );
}
