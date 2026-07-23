'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import { type SxProps, type Theme, useTheme } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableFooter from '@mui/material/TableFooter';
import TableHead from '@mui/material/TableHead';
import TableRow, { type TableRowProps } from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { flexRender, type Row, type RowData, type Table as TanStackTable } from '@tanstack/react-table';
import type { ReactNode } from 'react';

import { BusyArea } from '../BusyArea';
import { DataTableColumnHeader } from './DataTableColumnHeader';
import { DataTablePagination, type DataTablePaginationLabels } from './DataTablePagination';
import './types';
import type { DataTableColumnAlign } from './types';

export type DataTableRowProps = TableRowProps & Record<string, unknown>;

export type DataTableProps<TData extends RowData> = {
  table: TanStackTable<TData>;
  /** default true — Paper with surface.card + discovery radius */
  elevated?: boolean;
  size?: 'small' | 'medium';
  stickyHeader?: boolean;
  busy?: boolean;
  busyLabel?: string;
  /** Skeleton body rows when busy with no data. Default 8. */
  skeletonRowCount?: number;
  isError?: boolean;
  emptyContent?: ReactNode;
  errorContent?: ReactNode;
  getRowProps?: (row: Row<TData>) => DataTableRowProps;
  pagination?: false | DataTablePaginationLabels;
  caption?: string;
  sx?: SxProps<Theme>;
};

function resolveAlign(align: DataTableColumnAlign | undefined): 'left' | 'center' | 'right' | undefined {
  return align;
}

export function DataTable<TData extends RowData>({
  table,
  elevated = true,
  size = 'medium',
  stickyHeader = false,
  busy = false,
  busyLabel = 'Loading',
  skeletonRowCount = 8,
  isError = false,
  emptyContent,
  errorContent,
  getRowProps,
  pagination = false,
  caption,
  sx,
}: DataTableProps<TData>) {
  const theme = useTheme();
  const rows = table.getRowModel().rows;
  const headerGroups = table.getHeaderGroups();
  const footerGroups = table.getFooterGroups();
  const leafColumns = table.getVisibleLeafColumns();
  const columnCount = leafColumns.length;
  const hasFooter = footerGroups.some((group) =>
    group.headers.some((header) => header.column.columnDef.footer != null),
  );
  const showErrorRow = isError;
  const showEmptyRow = !isError && !busy && rows.length === 0;
  const showSkeletonRows = busy && !isError && rows.length === 0;
  const showStateRow = showErrorRow || showEmptyRow;
  const stateContent = showErrorRow ? errorContent : emptyContent;

  const tableNode = (
    <TableContainer
      sx={{
        overflowX: 'auto',
        ...(stickyHeader
          ? {
              maxHeight: 480,
              overflowY: 'auto',
            }
          : null),
      }}
    >
      <Table size={size} stickyHeader={stickyHeader}>
        {caption ? <caption>{caption}</caption> : null}
        <TableHead>
          {headerGroups.map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const meta = header.column.columnDef.meta;
                const align = resolveAlign(meta?.align);
                const canSort = header.column.getCanSort();
                const headerDef = header.column.columnDef.header;
                const isPlainTitle = typeof headerDef === 'string';

                return (
                  <TableCell
                    key={header.id}
                    align={align}
                    colSpan={header.colSpan}
                    sx={{
                      width: meta?.width,
                      fontWeight: 600,
                      bgcolor: stickyHeader ? 'background.paper' : undefined,
                    }}
                  >
                    {header.isPlaceholder ? null : canSort && isPlainTitle ? (
                      <DataTableColumnHeader column={header.column} title={headerDef} />
                    ) : (
                      flexRender(headerDef, header.getContext())
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {showStateRow ? (
            <TableRow>
              <TableCell colSpan={Math.max(columnCount, 1)} sx={{ py: 4 }}>
                <Typography
                  variant="body2"
                  color={isError ? 'error' : 'text.secondary'}
                  sx={{ textAlign: 'center' }}
                >
                  {stateContent}
                </Typography>
              </TableCell>
            </TableRow>
          ) : showSkeletonRows ? (
            Array.from({ length: skeletonRowCount }, (_, rowIndex) => (
              <TableRow key={`skeleton-${rowIndex}`} aria-hidden>
                {leafColumns.map((column) => {
                  const meta = column.columnDef.meta;
                  return (
                    <TableCell key={column.id} align={resolveAlign(meta?.align)} sx={{ width: meta?.width }}>
                      <Skeleton variant="text" animation="wave" width="80%" />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            rows.map((row) => {
              const rowProps = getRowProps?.(row) ?? {};
              return (
                <TableRow key={row.id} {...rowProps}>
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta;
                    return (
                      <TableCell key={cell.id} align={resolveAlign(meta?.align)} sx={{ width: meta?.width }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          )}
        </TableBody>
        {hasFooter && !showStateRow && !showSkeletonRows ? (
          <TableFooter>
            {footerGroups.map((footerGroup) => (
              <TableRow key={footerGroup.id}>
                {footerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta;
                  return (
                    <TableCell
                      key={header.id}
                      align={resolveAlign(meta?.align)}
                      colSpan={header.colSpan}
                      sx={{ width: meta?.width, fontWeight: 600 }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.footer, header.getContext())}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableFooter>
        ) : null}
      </Table>
    </TableContainer>
  );

  const body = (
    <BusyArea
      busy={busy}
      label={busyLabel}
      borderRadius={elevated ? theme.borderRadius.discovery : theme.borderRadius.utility}
    >
      {tableNode}
      {pagination ? <DataTablePagination table={table} labels={pagination} /> : null}
    </BusyArea>
  );

  if (!elevated) {
    return <Box sx={sx}>{body}</Box>;
  }

  return (
    <Paper elevation={0} sx={[{ overflow: 'hidden' }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}>
      {body}
    </Paper>
  );
}
