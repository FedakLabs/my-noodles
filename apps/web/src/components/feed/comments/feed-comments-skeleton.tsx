'use client';

import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

const ROWS = 3;

export function FeedCommentsSkeleton() {
  return (
    <Stack spacing={2.5} aria-busy aria-hidden>
      {Array.from({ length: ROWS }, (_, index) => (
        <Stack key={index} direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
          <Skeleton variant="circular" animation="wave" width={40} height={40} />
          <Stack spacing={0.75} sx={{ flex: 1, minWidth: 0 }}>
            <Skeleton variant="text" animation="wave" width="38%" sx={{ fontSize: '0.875rem' }} />
            <Skeleton variant="text" animation="wave" width="100%" sx={{ fontSize: '0.875rem' }} />
            <Skeleton variant="text" animation="wave" width="88%" sx={{ fontSize: '0.875rem' }} />
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
