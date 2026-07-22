'use client';

import {
  getCoreRowModel,
  useReactTable,
  type RowData,
  type TableOptions,
  type Table,
} from '@tanstack/react-table';

export type UseDataTableOptions<TData extends RowData> = Omit<TableOptions<TData>, 'getCoreRowModel'> & {
  getCoreRowModel?: TableOptions<TData>['getCoreRowModel'];
};

export function useDataTable<TData extends RowData>(options: UseDataTableOptions<TData>): Table<TData> {
  return useReactTable({
    getCoreRowModel: getCoreRowModel(),
    ...options,
  });
}
