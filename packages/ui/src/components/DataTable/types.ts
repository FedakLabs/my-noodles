import type { RowData } from '@tanstack/react-table';

export type DataTableColumnAlign = 'left' | 'center' | 'right';

export type DataTableColumnMeta = {
  align?: DataTableColumnAlign;
  width?: number | string;
};

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> extends DataTableColumnMeta {}
}
