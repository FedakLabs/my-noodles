'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { SectionReveal } from '../../_shared';
import { DoorCatalogChips } from './door-catalog-chips';
import { DoorCollectionsShelf } from './door-collections-shelf';
import { DoorFeedReel } from './door-feed-reel';

export function ThreeDoors() {
  const t = useTranslations('home.variants.a');

  return (
    <SectionReveal sx={{ px: { xs: 2, md: 4 }, py: { xs: 5, md: 7 } }}>
      <Stack spacing={3}>
        <Typography variant="h4" component="h2" sx={{ textAlign: 'center' }}>
          {t('doorsTitle')}
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
          }}
        >
          <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'background.paper', boxShadow: 1 }}>
            <DoorCollectionsShelf />
          </Box>
          <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'background.paper', boxShadow: 1 }}>
            <DoorCatalogChips />
          </Box>
          <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'background.paper', boxShadow: 1 }}>
            <DoorFeedReel />
          </Box>
        </Box>
      </Stack>
    </SectionReveal>
  );
}
