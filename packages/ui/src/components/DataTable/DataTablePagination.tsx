'use client';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { RowData, Table } from '@tanstack/react-table';

export type DataTablePaginationLabels = {
  previous: string;
  next: string;
  page: string;
};

export type DataTablePaginationProps<TData extends RowData> = {
  table: Table<TData>;
  labels: DataTablePaginationLabels;
};

export function DataTablePagination<TData extends RowData>({
  table,
  labels,
}: DataTablePaginationProps<TData>) {
  const theme = useTheme();

  return (
    <Stack
      direction="row"
      spacing={theme.customSpacing.gap.sm}
      sx={{
        alignItems: 'center',
        px: theme.customSpacing.padding.md,
        py: theme.customSpacing.padding.sm,
        borderTop: `1px solid ${theme.colors.border.subtle}`,
      }}
    >
      <Button size="small" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>
        {labels.previous}
      </Button>
      <Typography variant="body2" sx={{ flex: 1 }}>
        {labels.page}
      </Typography>
      <Button size="small" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
        {labels.next}
      </Button>
    </Stack>
  );
}
