'use client';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import { feedCardSurfaceSx, feedEndGlowSx } from '@/components/feed/feed-chrome';

import { FeedEndContent } from './feed-end-content';

type FeedEndCardProps = {
  activeTags: Parameters<typeof FeedEndContent>[0]['activeTags'];
  tagLabels: Record<string, string>;
  onRemoveTag: Parameters<typeof FeedEndContent>[0]['onRemoveTag'];
  onReshuffle: () => void;
  reshuffling: boolean;
};

export function FeedEndCard(props: FeedEndCardProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        borderRadius: { xs: 0, sm: 3 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 3, sm: 4 },
        textAlign: 'center',
        ...feedCardSurfaceSx,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          ...feedEndGlowSx(theme),
        }}
      />

      <Box sx={{ position: 'relative', width: '100%' }}>
        <FeedEndContent {...props} />
      </Box>
    </Box>
  );
}
