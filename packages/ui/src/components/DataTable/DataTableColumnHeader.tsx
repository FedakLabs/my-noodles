'use client';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { Column, RowData } from '@tanstack/react-table';

import SortIcon from '../../icons/sort.svg';
import { iconStyle } from '../../utils/iconStyle';

export type DataTableColumnHeaderProps<TData extends RowData, TValue = unknown> = {
  column: Column<TData, TValue>;
  title: string;
};

export function DataTableColumnHeader<TData extends RowData, TValue = unknown>({
  column,
  title,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const theme = useTheme();
  const canSort = column.getCanSort();
  const sorted = column.getIsSorted();
  const ariaSort = sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none';

  if (!canSort) {
    return (
      <Typography variant="subtitle2" component="span">
        {title}
      </Typography>
    );
  }

  return (
    <ButtonBase
      onClick={column.getToggleSortingHandler()}
      aria-sort={ariaSort}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: theme.customSpacing.gap.xs,
        typography: 'subtitle2',
        color: 'inherit',
        textAlign: 'inherit',
        borderRadius: 1,
        px: 0.25,
        py: 0.25,
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Box component="span">{title}</Box>
      <SortIcon
        aria-hidden
        style={iconStyle({
          size: 16,
          color: sorted ? theme.colors.icon.accent : theme.colors.icon.secondary,
        })}
      />
    </ButtonBase>
  );
}
