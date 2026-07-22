'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

import { useCollections } from '@/api/collections';
import { Link } from '@/i18n/navigation';

import { useReducedMotion } from '../../_shared';

export function DoorCollectionsShelf() {
  const t = useTranslations('home.variants.a');
  const reducedMotion = useReducedMotion();
  const { collections } = useCollections();
  const shelves = (collections ?? []).slice(0, 4);

  return (
    <Stack
      component={Link}
      href="/collections"
      spacing={1.5}
      sx={{ textDecoration: 'none', color: 'inherit', height: '100%' }}
    >
      <Typography variant="h6">{t('doorsCollectionsTitle')}</Typography>
      <Typography variant="body2" color="text.secondary">
        {t('doorsCollectionsBody')}
      </Typography>
      <Box sx={{ position: 'relative', height: 140, mt: 1 }}>
        {shelves.map((collection, index) => (
          <Box
            key={collection.id}
            component={reducedMotion ? 'div' : motion.div}
            {...(reducedMotion
              ? {}
              : {
                  initial: { rotate: -6 + index * 4, y: 12 },
                  whileInView: { rotate: -8 + index * 5, y: index * 10 },
                  viewport: { once: true },
                  transition: { delay: index * 0.08, type: 'spring', stiffness: 120, damping: 16 },
                })}
            sx={{
              position: 'absolute',
              left: `${12 + index * 14}%`,
              top: 8,
              width: '42%',
              height: 100,
              borderRadius: 2,
              overflow: 'hidden',
              bgcolor: 'action.hover',
              backgroundImage: collection.heroImage ? `url(${collection.heroImage})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: 2,
              display: 'flex',
              alignItems: 'flex-end',
              p: 1,
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: 'common.white', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
            >
              {collection.name}
            </Typography>
          </Box>
        ))}
      </Box>
    </Stack>
  );
}
