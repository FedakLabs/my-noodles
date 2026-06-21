import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

type ProductGridSkeletonProps = {
  count?: number;
};

export function ProductGridSkeleton({ count = 8 }: ProductGridSkeletonProps) {
  return (
    <Grid container spacing={2} aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <Grid key={index} size={{ xs: 6, sm: 4, md: 3 }} sx={{ minWidth: 0 }}>
          <Stack
            spacing={1.5}
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: 'background.paper',
              boxShadow: 1,
              height: '100%',
            }}
          >
            <Skeleton variant="rounded" sx={{ aspectRatio: '1', width: '100%' }} />
            <Skeleton variant="text" width="92%" sx={{ fontSize: '1rem' }} />
            <Skeleton variant="text" width="55%" />
            <Skeleton variant="text" width="35%" />
            <Skeleton variant="rounded" height={36} />
          </Stack>
        </Grid>
      ))}
    </Grid>
  );
}
