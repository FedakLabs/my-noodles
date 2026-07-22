'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

import { SectionReveal, useCountryPortals, useReducedMotion } from '../../_shared';

export function FeelItTeasers() {
  const t = useTranslations('home.variants.b');
  const reducedMotion = useReducedMotion();
  const { countries } = useCountryPortals();

  return (
    <SectionReveal sx={{ px: { xs: 2, md: 4 }, py: { xs: 5, md: 7 } }}>
      <Stack spacing={3}>
        <Typography variant="h4" component="h2" sx={{ textAlign: 'center' }}>
          {t('feelItTitle')}
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
          }}
        >
          <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'background.paper', boxShadow: 1, minHeight: 140 }}>
            <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
              {t('portalCollections')}
            </Typography>
            <Stack spacing={1}>
              {[0, 1, 2].map((index) => (
                <Box
                  key={index}
                  component={reducedMotion ? 'div' : motion.div}
                  {...(reducedMotion
                    ? {}
                    : {
                        animate: { x: [0, 6, 0] },
                        transition: { delay: index * 0.15, duration: 2.4, repeat: Infinity },
                      })}
                  sx={{ height: 18, borderRadius: 1, bgcolor: 'action.hover', width: `${80 - index * 12}%` }}
                />
              ))}
            </Stack>
          </Box>
          <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'background.paper', boxShadow: 1, minHeight: 140 }}>
            <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
              {t('portalCatalog')}
            </Typography>
            <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap' }}>
              {countries.slice(0, 4).map((country) => (
                <Chip key={country.slug} size="small" label={`${country.flagEmoji} ${country.label}`} />
              ))}
            </Stack>
          </Box>
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: 'common.black',
              color: 'common.white',
              boxShadow: 1,
              minHeight: 140,
              display: 'flex',
              alignItems: 'flex-end',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <Typography variant="subtitle1" sx={{ position: 'relative', zIndex: 1 }}>
              {t('portalFeed')}
            </Typography>
            {!reducedMotion ? (
              <Box
                component={motion.div}
                animate={{ y: ['0%', '-30%', '0%'] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                sx={{
                  position: 'absolute',
                  inset: '20% 30%',
                  borderRadius: 2,
                  border: '2px solid rgba(255,255,255,0.35)',
                }}
              />
            ) : null}
          </Box>
        </Box>
      </Stack>
    </SectionReveal>
  );
}
