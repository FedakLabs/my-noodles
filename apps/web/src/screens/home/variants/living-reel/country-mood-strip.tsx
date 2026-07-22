'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';

import { SectionReveal, useCountryPortals } from '../../_shared';

export function CountryMoodStrip() {
  const t = useTranslations('home.variants.c');
  const { countries } = useCountryPortals();

  return (
    <SectionReveal sx={{ px: { xs: 2, md: 4 }, py: { xs: 5, md: 7 } }}>
      <Stack spacing={2}>
        <Typography variant="h4" component="h2" sx={{ textAlign: 'center' }}>
          {t('worldTitle')}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 1.25,
            overflowX: 'auto',
            pb: 1,
            px: 0.5,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {countries.map((country) => (
            <Box
              key={country.slug}
              component={Link}
              href={`/catalog?country=${encodeURIComponent(country.slug)}`}
              sx={{
                flex: '0 0 auto',
                px: 2,
                py: 1.25,
                borderRadius: 999,
                bgcolor: 'background.paper',
                boxShadow: 1,
                textDecoration: 'none',
                color: 'text.primary',
                typography: 'body2',
                whiteSpace: 'nowrap',
              }}
            >
              {country.flagEmoji} {country.label}
            </Box>
          ))}
        </Box>
      </Stack>
    </SectionReveal>
  );
}
