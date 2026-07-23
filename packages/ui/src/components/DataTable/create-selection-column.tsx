'use client';

import Checkbox from '@mui/material/Checkbox';
import type { ColumnDef, RowData } from '@tanstack/react-table';

export type CreateSelectionColumnLabels = {
  selectAll: string;
  selectRow: string;
};

export function createSelectionColumn<TData extends RowData>(
  labels: CreateSelectionColumnLabels,
): ColumnDef<TData> {
  return {
    id: 'select',
    enableSorting: false,
    enableHiding: false,
    size: 48,
    header: ({ table }) => (
      <Checkbox
        size="small"
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
        onChange={(_event, checked) => {
          table.toggleAllPageRowsSelected(checked);
        }}
        slotProps={{ input: { 'aria-label': labels.selectAll } }}
        onClick={(event) => event.stopPropagation()}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        size="small"
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={(_event, checked) => {
          row.toggleSelected(checked);
        }}
        slotProps={{ input: { 'aria-label': labels.selectRow } }}
        onClick={(event) => event.stopPropagation()}
      />
    ),
  };
}
