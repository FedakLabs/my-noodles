'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';

import { SectionReveal, useLandingHeroProducts } from '../../_shared';

export function ThreeMoods() {
  const t = useTranslations('home.variants.c');
  const { products } = useLandingHeroProducts();
  const preview = products?.items[0]?.images[0];

  const moods = [
    { href: '/collections' as const, title: t('moodsCollections') },
    { href: '/catalog' as const, title: t('moodsCatalog') },
    { href: '/feed' as const, title: t('moodsFeed') },
  ];

  return (
    <SectionReveal sx={{ px: { xs: 2, md: 4 }, py: { xs: 5, md: 7 } }}>
      <Stack spacing={3}>
        <Typography variant="h4" component="h2" sx={{ textAlign: 'center' }}>
          {t('moodsTitle')}
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
          }}
        >
          {moods.map((mood) => (
            <Box
              key={mood.href}
              component={Link}
              href={mood.href}
              sx={{
                position: 'relative',
                minHeight: 160,
                borderRadius: 3,
                overflow: 'hidden',
                textDecoration: 'none',
                color: 'common.white',
                backgroundImage: preview ? `url(${preview})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                bgcolor: 'grey.800',
                display: 'flex',
                alignItems: 'flex-end',
                p: 2,
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.65))',
                },
              }}
            >
              <Typography variant="h6" sx={{ position: 'relative', zIndex: 1 }}>
                {mood.title}
              </Typography>
            </Box>
          ))}
        </Box>
      </Stack>
    </SectionReveal>
  );
}
