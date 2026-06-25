'use client';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

const skeletonSx = { bgcolor: 'rgba(255,255,255,0.1)' };

export function FeedCardSkeleton() {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        borderRadius: { xs: 0, sm: 3 },
        bgcolor: '#0a0a0a',
      }}
    >
      <Skeleton
        variant="rectangular"
        animation="wave"
        sx={{ position: 'absolute', inset: 0, height: '100%', ...skeletonSx }}
      />

      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          px: { xs: 2, sm: 2.5 },
          pt: 7,
          pb: { xs: 2.5, sm: 3 },
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0) 100%)',
        }}
      >
        <Stack spacing={1.25}>
          <Skeleton variant="text" animation="wave" width="78%" sx={{ fontSize: '1.25rem', ...skeletonSx }} />
          <Skeleton variant="text" animation="wave" width="38%" sx={{ fontSize: '1rem', ...skeletonSx }} />
          <Stack direction="row" spacing={0.75}>
            <Skeleton variant="rounded" animation="wave" width={88} height={24} sx={skeletonSx} />
            <Skeleton variant="rounded" animation="wave" width={72} height={24} sx={skeletonSx} />
            <Skeleton variant="rounded" animation="wave" width={64} height={24} sx={skeletonSx} />
          </Stack>
          <Skeleton variant="rounded" animation="wave" width={108} height={32} sx={skeletonSx} />
        </Stack>
      </Box>
    </Box>
  );
}
