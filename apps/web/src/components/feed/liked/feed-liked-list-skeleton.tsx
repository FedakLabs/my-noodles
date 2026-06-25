'use client';

import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

const ROWS = 4;

export function FeedLikedListSkeleton() {
  return (
    <Stack spacing={2} aria-busy aria-hidden>
      {Array.from({ length: ROWS }, (_, index) => (
        <Stack key={index} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Skeleton
            variant="rounded"
            animation="wave"
            width={56}
            height={56}
            sx={{ borderRadius: 1.5, flexShrink: 0 }}
          />
          <Stack spacing={0.75} sx={{ flex: 1, minWidth: 0 }}>
            <Skeleton variant="text" animation="wave" width="72%" sx={{ fontSize: '0.875rem' }} />
            <Skeleton variant="text" animation="wave" width="36%" sx={{ fontSize: '0.875rem' }} />
          </Stack>
          <Stack direction="row" spacing={0.25} sx={{ flexShrink: 0 }}>
            <Skeleton variant="circular" animation="wave" width={32} height={32} />
            <Skeleton variant="circular" animation="wave" width={32} height={32} />
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
