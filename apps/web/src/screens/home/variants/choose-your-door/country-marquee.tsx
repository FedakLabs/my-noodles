'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useDrag } from '@use-gesture/react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';

import { Link } from '@/i18n/navigation';

import { SectionReveal, useCountryPortals, useReducedMotion } from '../../_shared';

export function CountryMarquee() {
  const t = useTranslations('home.variants.b');
  const { countries } = useCountryPortals();
  const reducedMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 28 });

  const looped = [...countries, ...countries];

  useDrag(
    ({ delta: [dx] }) => {
      x.set(x.get() + dx);
    },
    {
      target: trackRef,
      enabled: !reducedMotion,
      axis: 'x',
      pointer: { touch: true },
      filterTaps: true,
    },
  );

  return (
    <SectionReveal sx={{ py: { xs: 4, md: 6 } }}>
      <Stack spacing={2}>
        <Typography variant="h4" component="h2" sx={{ textAlign: 'center', px: 2 }}>
          {t('worldTitle')}
        </Typography>
        <Box sx={{ overflow: 'hidden', touchAction: 'pan-y' }}>
          <motion.div
            ref={trackRef}
            style={{
              x: springX,
              display: 'flex',
              gap: 10,
              width: 'max-content',
              paddingInline: 16,
              cursor: reducedMotion ? 'default' : 'grab',
            }}
          >
            {looped.map((country, index) => (
              <Box
                key={`${country.slug}-${index}`}
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
          </motion.div>
        </Box>
      </Stack>
    </SectionReveal>
  );
}
