import { createColumnHelper, createTable, getCoreRowModel } from '@tanstack/react-table';
import { describe, expect, it } from 'vitest';

type Row = { id: string; name: string };

const columnHelper = createColumnHelper<Row>();

describe('manual pagination table options', () => {
  it('exposes previous/next page gates from pageCount and pageIndex', () => {
    const table = createTable({
      data: [{ id: '1', name: 'Ada' }],
      columns: [columnHelper.accessor('name', { header: 'Name' })],
      getCoreRowModel: getCoreRowModel(),
      getRowId: (row) => row.id,
      manualPagination: true,
      pageCount: 3,
      state: {
        pagination: { pageIndex: 1, pageSize: 5 },
      },
      onStateChange: () => undefined,
      renderFallbackValue: null,
    });

    expect(table.getCanPreviousPage()).toBe(true);
    expect(table.getCanNextPage()).toBe(true);

    table.setOptions((prev) => ({
      ...prev,
      state: {
        ...prev.state,
        pagination: { pageIndex: 2, pageSize: 5 },
      },
    }));

    expect(table.getCanPreviousPage()).toBe(true);
    expect(table.getCanNextPage()).toBe(false);
  });
});
