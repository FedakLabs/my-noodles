'use client';

import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

const skeletonSx = { bgcolor: 'rgba(255,255,255,0.12)' };

export function FeedCardDetailsSkeleton() {
  return (
    <Stack spacing={1.5} aria-hidden>
      <Skeleton variant="text" animation="wave" width="100%" sx={{ fontSize: '0.875rem', ...skeletonSx }} />
      <Skeleton variant="text" animation="wave" width="96%" sx={{ fontSize: '0.875rem', ...skeletonSx }} />
      <Skeleton variant="text" animation="wave" width="88%" sx={{ fontSize: '0.875rem', ...skeletonSx }} />
      <Skeleton variant="text" animation="wave" width="72%" sx={{ fontSize: '0.875rem', ...skeletonSx }} />
      <Skeleton
        variant="text"
        animation="wave"
        width="64%"
        sx={{ fontSize: '0.875rem', ...skeletonSx, mt: 0.5 }}
      />
      <Skeleton variant="text" animation="wave" width="80%" sx={{ fontSize: '0.875rem', ...skeletonSx }} />
    </Stack>
  );
}
