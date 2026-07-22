import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { getSortedRowModel } from '@tanstack/react-table';
import { useMemo, useState } from 'react';

import {
  createColumnHelper,
  createSelectionColumn,
  DataTable,
  DataTableColumnHeader,
  useDataTable,
  type RowSelectionState,
} from '../components/DataTable';

type DemoOrder = {
  id: string;
  customer: string;
  status: 'new' | 'sent' | 'completed';
  totalMinor: number;
  createdAt: string;
  notes: string;
};

const demoOrders: DemoOrder[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    customer: 'Олена Коваль',
    status: 'new',
    totalMinor: 45900,
    createdAt: '2026-07-01T10:15:00.000Z',
    notes: 'Leave at reception if nobody home',
  },
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    customer: 'Ігор Мельник',
    status: 'sent',
    totalMinor: 128500,
    createdAt: '2026-07-02T14:40:00.000Z',
    notes: 'Call before delivery',
  },
  {
    id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    customer: 'Марія Шевченко',
    status: 'completed',
    totalMinor: 8900,
    createdAt: '2026-07-03T09:05:00.000Z',
    notes: 'Gift wrap requested',
  },
  {
    id: 'd4e5f6a7-b8c9-0123-def0-234567890123',
    customer: 'Андрій Бондар',
    status: 'new',
    totalMinor: 67200,
    createdAt: '2026-07-04T16:20:00.000Z',
    notes: 'Office hours only',
  },
  {
    id: 'e5f6a7b8-c9d0-1234-ef01-345678901234',
    customer: 'Софія Ткач',
    status: 'sent',
    totalMinor: 21400,
    createdAt: '2026-07-05T11:55:00.000Z',
    notes: 'Fragile snacks',
  },
  {
    id: 'f6a7b8c9-d0e1-2345-f012-456789012345',
    customer: 'Дмитро Лисенко',
    status: 'completed',
    totalMinor: 99000,
    createdAt: '2026-07-06T08:30:00.000Z',
    notes: 'Repeat customer',
  },
  {
    id: 'a7b8c9d0-e1f2-3456-0123-567890123456',
    customer: 'Наталія Романюк',
    status: 'new',
    totalMinor: 33500,
    createdAt: '2026-07-07T13:10:00.000Z',
    notes: 'Prefer morning delivery',
  },
  {
    id: 'b8c9d0e1-f2a3-4567-1234-678901234567',
    customer: 'Юрій Савчук',
    status: 'sent',
    totalMinor: 150000,
    createdAt: '2026-07-08T17:45:00.000Z',
    notes: 'Bulk discovery box',
  },
  {
    id: 'c9d0e1f2-a3b4-5678-2345-789012345678',
    customer: 'Катерина Гнатюк',
    status: 'completed',
    totalMinor: 5400,
    createdAt: '2026-07-09T12:00:00.000Z',
    notes: 'Single snack trial',
  },
  {
    id: 'd0e1f2a3-b4c5-6789-3456-890123456789',
    customer: 'Василь Кравчук',
    status: 'new',
    totalMinor: 78500,
    createdAt: '2026-07-10T15:25:00.000Z',
    notes: 'Include tasting notes card',
  },
  {
    id: 'e1f2a3b4-c5d6-7890-4567-901234567890',
    customer: 'Ірина Поліщук',
    status: 'sent',
    totalMinor: 41200,
    createdAt: '2026-07-11T10:50:00.000Z',
    notes: 'Doorbell broken — knock',
  },
  {
    id: 'f2a3b4c5-d6e7-8901-5678-012345678901',
    customer: 'Петро Захарченко',
    status: 'completed',
    totalMinor: 22600,
    createdAt: '2026-07-12T19:15:00.000Z',
    notes: 'Thank-you sticker pack',
  },
];

const tallOrders = Array.from({ length: 40 }, (_, index) => {
  const base = demoOrders[index % demoOrders.length]!;
  return {
    ...base,
    id: `${base.id.slice(0, -2)}${index.toString(16).padStart(2, '0')}`,
    customer: `${base.customer} #${index + 1}`,
  };
});

const columnHelper = createColumnHelper<DemoOrder>();

function formatMoney(totalMinor: number) {
  return `₴${(totalMinor / 100).toFixed(2)}`;
}

function statusChip(status: DemoOrder['status']) {
  return <Chip size="small" label={status} />;
}

const meta = {
  title: 'Components/DataTable',
  component: DataTable,
  parameters: {
    docs: {
      description: {
        component:
          'Headless TanStack Table instance via `useDataTable`, themed chrome via `DataTable` (Paper, cells, pagination, busy/empty/error).',
      },
    },
  },
} satisfies Meta<typeof DataTable>;

export default meta;

type Story = StoryObj<typeof meta>;

function BasicDemo() {
  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: (info) => `${info.getValue().slice(0, 8)}…`,
      }),
      columnHelper.accessor('customer', { header: 'Customer' }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => statusChip(info.getValue()),
      }),
      columnHelper.accessor('totalMinor', {
        header: 'Total',
        meta: { align: 'right' },
        cell: (info) => formatMoney(info.getValue()),
      }),
    ],
    [],
  );

  const table = useDataTable({ data: demoOrders, columns, getRowId: (row) => row.id });

  return <DataTable table={table} size="small" />;
}

export const Basic: Story = {
  render: () => <BasicDemo />,
};

function EmptyDemo() {
  const columns = useMemo(
    () => [
      columnHelper.accessor('customer', { header: 'Customer' }),
      columnHelper.accessor('totalMinor', {
        header: 'Total',
        meta: { align: 'right' },
        cell: (info) => formatMoney(info.getValue()),
      }),
    ],
    [],
  );

  const table = useDataTable({ data: [], columns, getRowId: (row) => row.id });

  return <DataTable table={table} size="small" emptyContent="No orders yet." />;
}

export const Empty: Story = {
  render: () => <EmptyDemo />,
};

function ErrorDemo() {
  const columns = useMemo(
    () => [
      columnHelper.accessor('customer', { header: 'Customer' }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => statusChip(info.getValue()),
      }),
    ],
    [],
  );

  const table = useDataTable({ data: [], columns, getRowId: (row) => row.id });

  return <DataTable table={table} size="small" isError errorContent="Could not load orders." />;
}

export const Error: Story = {
  render: () => <ErrorDemo />,
};

function BusyDemo() {
  const [busy, setBusy] = useState(true);
  const columns = useMemo(
    () => [
      columnHelper.accessor('customer', { header: 'Customer' }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => statusChip(info.getValue()),
      }),
      columnHelper.accessor('totalMinor', {
        header: 'Total',
        meta: { align: 'right' },
        cell: (info) => formatMoney(info.getValue()),
      }),
    ],
    [],
  );

  const table = useDataTable({
    data: demoOrders.slice(0, 5),
    columns,
    getRowId: (row) => row.id,
  });

  return (
    <Stack spacing={1.5}>
      <Button variant="outlined" onClick={() => setBusy((value) => !value)}>
        {busy ? 'Clear busy' : 'Show busy'}
      </Button>
      <DataTable table={table} size="small" busy={busy} busyLabel="Refreshing orders" />
    </Stack>
  );
}

export const Busy: Story = {
  render: () => <BusyDemo />,
};

function ClientSortingDemo() {
  const columns = useMemo(
    () => [
      columnHelper.accessor('customer', {
        header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
        enableSorting: true,
      }),
      columnHelper.accessor('status', {
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        enableSorting: true,
        cell: (info) => statusChip(info.getValue()),
      }),
      columnHelper.accessor('totalMinor', {
        header: ({ column }) => <DataTableColumnHeader column={column} title="Total" />,
        enableSorting: true,
        meta: { align: 'right' },
        cell: (info) => formatMoney(info.getValue()),
      }),
    ],
    [],
  );

  const table = useDataTable({
    data: demoOrders,
    columns,
    getRowId: (row) => row.id,
    getSortedRowModel: getSortedRowModel(),
  });

  return <DataTable table={table} size="small" />;
}

export const ClientSorting: Story = {
  render: () => <ClientSortingDemo />,
};

function ManualPaginationDemo() {
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 5;
  const pageCount = Math.ceil(demoOrders.length / pageSize);
  const pageRows = demoOrders.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize);

  const columns = useMemo(
    () => [
      columnHelper.accessor('customer', { header: 'Customer' }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => statusChip(info.getValue()),
      }),
      columnHelper.accessor('totalMinor', {
        header: 'Total',
        meta: { align: 'right' },
        cell: (info) => formatMoney(info.getValue()),
      }),
    ],
    [],
  );

  const table = useDataTable({
    data: pageRows,
    columns,
    getRowId: (row) => row.id,
    manualPagination: true,
    pageCount,
    state: { pagination: { pageIndex, pageSize } },
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
      setPageIndex(next.pageIndex);
    },
  });

  return (
    <DataTable
      table={table}
      size="small"
      pagination={{
        previous: 'Previous',
        next: 'Next',
        page: `Page ${pageIndex + 1} of ${pageCount}`,
      }}
    />
  );
}

export const ManualPagination: Story = {
  render: () => <ManualPaginationDemo />,
};

function RowClickDemo() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: (info) => `${info.getValue().slice(0, 8)}…`,
      }),
      columnHelper.accessor('customer', { header: 'Customer' }),
      columnHelper.accessor('totalMinor', {
        header: 'Total',
        meta: { align: 'right' },
        cell: (info) => formatMoney(info.getValue()),
      }),
    ],
    [],
  );

  const table = useDataTable({
    data: demoOrders.slice(0, 6),
    columns,
    getRowId: (row) => row.id,
  });

  return (
    <Stack spacing={1.5}>
      <Typography variant="body2" color="text.secondary">
        Last clicked: {selectedId ?? '—'}
      </Typography>
      <DataTable
        table={table}
        size="small"
        getRowProps={(row) => ({
          hover: true,
          selected: row.id === selectedId,
          onClick: () => setSelectedId(row.original.id),
          sx: { cursor: 'pointer' },
        })}
      />
    </Stack>
  );
}

export const RowClick: Story = {
  render: () => <RowClickDemo />,
};

function SelectionDemo() {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const columns = useMemo(
    () => [
      createSelectionColumn<DemoOrder>({
        selectAll: 'Select all rows',
        selectRow: 'Select row',
      }),
      columnHelper.accessor('customer', { header: 'Customer' }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => statusChip(info.getValue()),
      }),
      columnHelper.accessor('totalMinor', {
        header: 'Total',
        meta: { align: 'right' },
        cell: (info) => formatMoney(info.getValue()),
      }),
    ],
    [],
  );

  const table = useDataTable({
    data: demoOrders.slice(0, 8),
    columns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
  });

  return (
    <Stack spacing={1.5}>
      <Typography variant="body2">Selected: {Object.keys(rowSelection).length}</Typography>
      <DataTable table={table} size="small" />
    </Stack>
  );
}

export const Selection: Story = {
  render: () => <SelectionDemo />,
};

function StickyHeaderDemo() {
  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        meta: { width: 220 },
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('customer', {
        header: 'Customer',
        meta: { width: 220 },
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        meta: { width: 140 },
        cell: (info) => statusChip(info.getValue()),
      }),
      columnHelper.accessor('notes', {
        header: 'Notes',
        meta: { width: 360 },
      }),
      columnHelper.accessor('totalMinor', {
        header: 'Total',
        meta: { align: 'right', width: 120 },
        cell: (info) => formatMoney(info.getValue()),
      }),
      columnHelper.accessor('createdAt', {
        header: 'Created',
        meta: { width: 220 },
      }),
    ],
    [],
  );

  const table = useDataTable({ data: tallOrders, columns, getRowId: (row) => row.id });

  return <DataTable table={table} size="small" stickyHeader />;
}

export const StickyHeader: Story = {
  render: () => <StickyHeaderDemo />,
};
