import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { Order, OrderStatus } from '@my-noodles/api-clients/admin';
import { CopyableField, createColumnHelper, DataTable, useDataTable } from '@my-noodles/ui';
import { Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useOrdersList } from '@/api/orders';
import { OrderStatusChip } from '@/components/orders/order-status-chip';
import { orderDetailPath } from '@/router/route-names';
import { formatCurrency } from '@/utils/format-currency';

const STATUS_OPTIONS: OrderStatus[] = [
  'new',
  'confirmed',
  'sent',
  'arrived',
  'completed',
  'cancelled',
  'returned',
  'archived',
];

const columnHelper = createColumnHelper<Order>();

function formatCreatedAt(value: string | undefined): string {
  if (!value) {
    return '—';
  }
  return new Intl.DateTimeFormat('uk', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function OrdersListScreen() {
  const { t } = useTranslation(['orders', 'common']);
  const [page, setPage] = useState(1);
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdTo, setCreatedTo] = useState('');
  const limit = 20;

  const { orders, ordersIsLoading, ordersIsError } = useOrdersList({
    page,
    limit,
    status: statuses.length > 0 ? statuses : undefined,
    q: search || undefined,
    createdFrom: createdFrom || undefined,
    createdTo: createdTo || undefined,
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: t('orders:list.id'),
        cell: (info) => (
          <CopyableField
            value={`${info.getValue().slice(0, 8)}…`}
            copyText={info.getValue()}
            copyLabel={t('common:actions.copy')}
            copiedLabel={t('common:actions.copied')}
          />
        ),
      }),
      columnHelper.accessor('createdAt', {
        header: t('orders:list.createdAt'),
        cell: (info) => formatCreatedAt(info.getValue()),
      }),
      columnHelper.display({
        id: 'customer',
        header: t('orders:list.customer'),
        cell: ({ row }) => [row.original.firstName, row.original.lastName].filter(Boolean).join(' ') || '—',
      }),
      columnHelper.accessor('phone', {
        header: t('orders:list.phone'),
        cell: (info) => (
          <CopyableField
            value={info.getValue() ?? ''}
            copyLabel={t('common:actions.copy')}
            copiedLabel={t('common:actions.copied')}
          />
        ),
      }),
      columnHelper.accessor('status', {
        header: t('orders:list.status'),
        cell: (info) => <OrderStatusChip status={info.getValue()} />,
      }),
      columnHelper.accessor((row) => row.grandTotalMinor ?? row.totalMinor, {
        id: 'total',
        header: t('orders:list.total'),
        meta: { align: 'right' },
        cell: (info) => formatCurrency(info.getValue(), info.row.original.currency),
      }),
    ],
    [t],
  );

  const pageCount = orders ? Math.max(1, Math.ceil(orders.meta.total / limit)) : 0;

  const table = useDataTable({
    data: orders?.items ?? [],
    columns,
    getRowId: (row) => row.id,
    manualPagination: true,
    pageCount,
    state: {
      pagination: { pageIndex: page - 1, pageSize: limit },
    },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === 'function' ? updater({ pageIndex: page - 1, pageSize: limit }) : updater;
      setPage(next.pageIndex + 1);
    },
  });

  return (
    <Stack spacing={2}>
      <Typography variant="h4" component="h1">
        {t('orders:list.title')}
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
        <TextField
          label={t('orders:list.search')}
          size="small"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              setPage(1);
              setSearch(q.trim());
            }
          }}
          sx={{ flex: '1 1 180px', minWidth: 160 }}
        />
        <TextField
          select
          label={t('orders:list.status')}
          size="small"
          value={statuses}
          onChange={(event) => {
            const value = event.target.value;
            setPage(1);
            setStatuses(typeof value === 'string' ? (value.split(',') as OrderStatus[]) : value);
          }}
          slotProps={{
            inputLabel: { shrink: true },
            select: {
              multiple: true,
              displayEmpty: true,
              renderValue: (selected) => {
                const values = selected as OrderStatus[];
                if (values.length === 0) {
                  return t('orders:list.statusAll');
                }
                return values.map((value) => t(`orders:status.${value}`)).join(', ');
              },
            },
          }}
          sx={{ minWidth: 220 }}
        >
          {STATUS_OPTIONS.map((value) => (
            <MenuItem key={value} value={value}>
              {t(`orders:status.${value}`)}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label={t('orders:list.dateFrom')}
          type="date"
          size="small"
          value={createdFrom}
          onChange={(event) => {
            setPage(1);
            setCreatedFrom(event.target.value);
          }}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ minWidth: 160 }}
        />
        <TextField
          label={t('orders:list.dateTo')}
          type="date"
          size="small"
          value={createdTo}
          onChange={(event) => {
            setPage(1);
            setCreatedTo(event.target.value);
          }}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ minWidth: 160 }}
        />
        <Button
          variant="outlined"
          onClick={() => {
            setPage(1);
            setSearch(q.trim());
          }}
        >
          {t('common:actions.search')}
        </Button>
      </Stack>

      <DataTable
        table={table}
        size="small"
        busy={ordersIsLoading}
        busyLabel={t('common:states.loading')}
        isError={ordersIsError}
        errorContent={t('orders:list.loadError')}
        emptyContent={t('orders:list.empty')}
        getRowProps={(row) => ({
          component: Link,
          to: orderDetailPath(row.original.id),
          hover: true,
          style: { textDecoration: 'none' },
        })}
        pagination={{
          previous: t('common:actions.previous'),
          next: t('common:actions.next'),
          page: t('orders:list.page', {
            page: orders?.meta.page ?? page,
            total: orders?.meta.total ?? 0,
          }),
        }}
      />
    </Stack>
  );
}
