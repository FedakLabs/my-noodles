'use client';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { alpha, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { Column, RowData } from '@tanstack/react-table';
import type { MouseEvent } from 'react';

import ChevronDownIcon from '../../icons/chevron-down.svg';
import ChevronUpIcon from '../../icons/chevron-up.svg';

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

  const upActive = sorted === 'asc';
  const downActive = sorted === 'desc';
  const accent = theme.colors.icon.accent;
  const secondary = theme.colors.icon.secondary;

  const sortButtonSx = (active: boolean) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 0.5,
    bgcolor: active ? alpha(accent, 0.18) : 'transparent',
    color: active ? accent : secondary,
    transition: theme.transitions.create(['background-color', 'color'], {
      duration: theme.transitions.duration.shorter,
    }),
    '&:hover': {
      bgcolor: active ? alpha(accent, 0.28) : theme.palette.action.hover,
    },
  });

  function cycleSorting(event: MouseEvent) {
    event.stopPropagation();
    if (!sorted) {
      column.toggleSorting(false);
      return;
    }
    if (sorted === 'asc') {
      column.toggleSorting(true);
      return;
    }
    column.clearSorting();
  }

  return (
    <Box
      component="span"
      aria-sort={ariaSort}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: theme.customSpacing.gap.xs,
      }}
    >
      <ButtonBase
        type="button"
        onClick={cycleSorting}
        aria-label={
          !sorted
            ? `Sort ${title} ascending`
            : sorted === 'asc'
              ? `Sort ${title} descending`
              : `Clear ${title} sort`
        }
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          borderRadius: 0.5,
          px: 0.25,
          mx: -0.25,
          color: 'inherit',
          '&:hover': {
            bgcolor: theme.palette.action.hover,
          },
        }}
      >
        <Typography variant="subtitle2" component="span">
          {title}
        </Typography>
      </ButtonBase>
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0,
          lineHeight: 0,
        }}
      >
        <ButtonBase
          type="button"
          aria-label={`Sort ${title} ascending`}
          aria-pressed={upActive}
          onClick={(event) => {
            event.stopPropagation();
            if (upActive) {
              column.clearSorting();
              return;
            }
            column.toggleSorting(false);
          }}
          sx={sortButtonSx(upActive)}
        >
          <ChevronUpIcon aria-hidden size={12} color="currentColor" />
        </ButtonBase>
        <ButtonBase
          type="button"
          aria-label={`Sort ${title} descending`}
          aria-pressed={downActive}
          onClick={(event) => {
            event.stopPropagation();
            if (downActive) {
              column.clearSorting();
              return;
            }
            column.toggleSorting(true);
          }}
          sx={sortButtonSx(downActive)}
        >
          <ChevronDownIcon aria-hidden size={12} color="currentColor" />
        </ButtonBase>
      </Box>
    </Box>
  );
}
