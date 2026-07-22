'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

import { SectionReveal, useReducedMotion } from '../../_shared';

export function HumanTruth() {
  const t = useTranslations('home.variants.a');
  const reducedMotion = useReducedMotion();
  const words = t('humanTruth').split(' ');

  return (
    <SectionReveal sx={{ px: { xs: 2, md: 4 }, py: { xs: 5, md: 7 } }}>
      <Box sx={{ maxWidth: 720, mx: 'auto', textAlign: 'center' }}>
        {reducedMotion ? (
          <Typography variant="h5" component="p">
            {t('humanTruth')}
          </Typography>
        ) : (
          <Typography
            variant="h5"
            component={motion.p}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.6 }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.035 } },
            }}
            sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.35em' }}
          >
            {words.map((word, index) => (
              <Box
                key={`${word}-${index}`}
                component={motion.span}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  show: { opacity: 1, y: 0 },
                }}
              >
                {word}
              </Box>
            ))}
          </Typography>
        )}
      </Box>
    </SectionReveal>
  );
}
