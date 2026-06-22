import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

function FilterOptionSkeletons({ count = 4 }: { count?: number }) {
  return (
    <Stack spacing={0.75}>
      {Array.from({ length: count }, (_, index) => (
        <Skeleton key={index} variant="rounded" height={36} />
      ))}
    </Stack>
  );
}

export function FilterSheetSkeleton() {
  return (
    <Stack spacing={3} aria-hidden>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton variant="text" width={88} sx={{ fontSize: '1.25rem' }} />
        <Skeleton variant="rounded" width={72} height={32} />
      </Stack>

      <Stack spacing={1}>
        <Skeleton variant="text" width={96} sx={{ fontSize: '0.875rem' }} />
        <FilterOptionSkeletons />
      </Stack>

      <Stack spacing={1}>
        <Skeleton variant="text" width={80} sx={{ fontSize: '0.875rem' }} />
        <FilterOptionSkeletons count={3} />
      </Stack>

      <Stack spacing={1}>
        <Skeleton variant="text" width={64} sx={{ fontSize: '0.875rem' }} />
        <Skeleton variant="rounded" height={48} />
      </Stack>

      <Skeleton variant="rounded" height={36} />
      <Skeleton variant="rounded" height={36} />
    </Stack>
  );
}
