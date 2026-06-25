import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

type ProductGridSkeletonProps = {
  count?: number;
};

function ProductCardSkeleton() {
  return (
    <Stack
      spacing={1.5}
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: 'background.paper',
        boxShadow: 1,
        height: '100%',
        width: '100%',
        minWidth: 0,
        maxWidth: '100%',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          aspectRatio: '1',
          width: '100%',
          borderRadius: 1.5,
          overflow: 'hidden',
          bgcolor: 'action.hover',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
          }}
        />
      </Box>
      <Skeleton variant="text" animation="wave" width="92%" sx={{ fontSize: '1rem', lineHeight: 1.3 }} />
      <Skeleton variant="text" animation="wave" width="55%" sx={{ fontSize: '0.875rem' }} />
      <Skeleton variant="text" animation="wave" width="40%" sx={{ fontSize: '0.875rem', mt: 0.5 }} />
      <Box sx={{ mt: 'auto', flexShrink: 0, width: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            minWidth: 0,
            borderRadius: 1.5,
            overflow: 'hidden',
            border: 1,
            borderColor: 'divider',
          }}
        >
          <Skeleton variant="rectangular" animation="wave" height={36} sx={{ flex: '1 1 0', minWidth: 0 }} />
          <Skeleton variant="rectangular" animation="wave" height={36} sx={{ flex: '1 1 0', minWidth: 0 }} />
        </Box>
      </Box>
    </Stack>
  );
}

export function ProductGridSkeleton({ count = 8 }: ProductGridSkeletonProps) {
  return (
    <Grid container spacing={2} aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <Grid key={index} size={{ xs: 6, sm: 4, md: 4 }} sx={{ minWidth: 0, display: 'flex', width: '100%' }}>
          <ProductCardSkeleton />
        </Grid>
      ))}
    </Grid>
  );
}
