import './types';

export { DataTable, type DataTableProps, type DataTableRowProps } from './DataTable';
export { DataTableColumnHeader, type DataTableColumnHeaderProps } from './DataTableColumnHeader';
export {
  DataTablePagination,
  type DataTablePaginationLabels,
  type DataTablePaginationProps,
} from './DataTablePagination';
export { createSelectionColumn, type CreateSelectionColumnLabels } from './create-selection-column';
export { useDataTable, type UseDataTableOptions } from './use-data-table';
export type { DataTableColumnAlign, DataTableColumnMeta } from './types';

export {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type PaginationState,
  type Row,
  type RowSelectionState,
  type SortingState,
  type Table,
} from '@tanstack/react-table';
