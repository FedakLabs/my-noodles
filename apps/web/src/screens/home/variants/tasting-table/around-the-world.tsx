'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';

import { SectionReveal, useCountryPortals } from '../../_shared';

export function AroundTheWorld() {
  const t = useTranslations('home.variants.a');
  const { countries } = useCountryPortals();

  return (
    <SectionReveal sx={{ px: { xs: 2, md: 4 }, py: { xs: 5, md: 7 } }}>
      <Stack spacing={2} sx={{ maxWidth: 900, mx: 'auto', textAlign: 'center' }}>
        <Typography variant="h4" component="h2">
          {t('worldTitle')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('worldBody')}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 1.25,
            pt: 1,
          }}
        >
          {countries.map((country) => (
            <Box
              key={country.slug}
              component={Link}
              href={`/catalog?country=${encodeURIComponent(country.slug)}`}
              sx={{
                px: 1.5,
                py: 1,
                borderRadius: 999,
                bgcolor: 'background.paper',
                boxShadow: 1,
                textDecoration: 'none',
                color: 'text.primary',
                typography: 'body2',
                '&:hover': { bgcolor: 'action.hover' },
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
