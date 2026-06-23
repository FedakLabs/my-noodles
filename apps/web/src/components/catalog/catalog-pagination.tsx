'use client';

import Pagination from '@mui/material/Pagination';
import type { SxProps, Theme } from '@mui/material/styles';

type CatalogPaginationProps = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  sx?: SxProps<Theme>;
};

export function CatalogPagination({
  page,
  pageCount,
  onPageChange,
  disabled = false,
  sx,
}: CatalogPaginationProps) {
  if (pageCount <= 1) {
    return null;
  }

  return (
    <Pagination
      page={page}
      count={pageCount}
      disabled={disabled}
      onChange={(_, nextPage) => onPageChange(nextPage)}
      sx={{ alignSelf: 'center', ...sx }}
    />
  );
}
