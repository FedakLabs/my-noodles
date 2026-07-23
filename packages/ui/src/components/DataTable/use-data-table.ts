'use client';

import {
  getCoreRowModel as createCoreRowModel,
  useReactTable,
  type RowData,
  type TableOptions,
  type Table,
} from '@tanstack/react-table';

export type UseDataTableOptions<TData extends RowData> = Omit<TableOptions<TData>, 'getCoreRowModel'> & {
  getCoreRowModel?: TableOptions<TData>['getCoreRowModel'];
};

/** Shared empty rows — `data: []` / `items ?? []` each render retriggers TanStack auto-reset. */
const EMPTY_DATA: unknown[] = [];

/** Stable factory — recreating per render is unnecessary and easy to get wrong in call sites. */
const defaultGetCoreRowModel = createCoreRowModel();

export function useDataTable<TData extends RowData>(options: UseDataTableOptions<TData>): Table<TData> {
  const data = options.data.length === 0 ? (EMPTY_DATA as TData[]) : options.data;

  return useReactTable({
    // Unstable `data` + default autoResetPageIndex queues resetPageIndex → setState → freeze.
    // Call sites that need reset-on-data-change can opt back in.
    autoResetPageIndex: false,
    getCoreRowModel: defaultGetCoreRowModel,
    ...options,
    data,
  });
}
