'use client';

import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslations } from 'next-intl';

type CatalogLoadMoreButtonProps = {
  onLoadMore: () => void;
  isLoading?: boolean;
};

export function CatalogLoadMoreButton({ onLoadMore, isLoading = false }: CatalogLoadMoreButtonProps) {
  const t = useTranslations('catalog');

  return (
    <Button
      variant="outlined"
      onClick={onLoadMore}
      disabled={isLoading}
      aria-busy={isLoading}
      startIcon={isLoading ? <CircularProgress size={18} color="inherit" aria-hidden /> : undefined}
      sx={{
        alignSelf: 'center',
        borderRadius: 5,
      }}
    >
      {t('loadMore')}
    </Button>
  );
}
