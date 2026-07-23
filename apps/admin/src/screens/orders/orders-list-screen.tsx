import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { AdminOrder, AdminOrdersSortBy, OrderStatus } from '@my-noodles/api-clients/admin';
import {
  CopyableField,
  createColumnHelper,
  DataTable,
  SelectField,
  useDataTable,
  type SortingState,
} from '@my-noodles/ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useOrdersList } from '@/api/orders';
import { OrderDetailModal, type OrderDetailModalRef } from '@/components/orders/order-detail-modal';
import { OrderStatusChip } from '@/components/orders/order-status-chip';
import { ORDER_STATUS_FILTER_OPTIONS, useOrdersSearchParams } from '@/screens/orders/search-params';
import { formatCurrency } from '@/utils/format-currency';

const COLUMN_TO_SORT_BY: Record<string, AdminOrdersSortBy> = {
  id: 'id',
  createdAt: 'createdAt',
  phone: 'phone',
  status: 'status',
  total: 'totalMinor',
};

const DEFAULT_SORTING: SortingState = [{ id: 'createdAt', desc: true }];

const columnHelper = createColumnHelper<AdminOrder>();

function formatDateTime(value: string | null | undefined): string {
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
  const {
    q: searchQ,
    status: statuses,
    createdFrom,
    createdTo,
    page,
    applySearch,
    setStatus,
    setCreatedFrom,
    setCreatedTo,
    setPage,
  } = useOrdersSearchParams();
  const orderDetailModalRef = useRef<OrderDetailModalRef>(null);
  const [q, setQ] = useState(searchQ ?? '');
  const [sorting, setSorting] = useState<SortingState>(DEFAULT_SORTING);
  const limit = 20;

  const activeSort = sorting[0];
  const sortBy = activeSort ? COLUMN_TO_SORT_BY[activeSort.id] : undefined;
  const sortOrder = activeSort ? (activeSort.desc ? 'desc' : 'asc') : undefined;

  const { orders, ordersIsLoading, ordersIsError } = useOrdersList({
    page,
    limit,
    status: statuses.length > 0 ? statuses : undefined,
    q: searchQ ?? undefined,
    createdFrom: createdFrom ?? undefined,
    createdTo: createdTo ?? undefined,
    sortBy,
    sortOrder,
  });

  useEffect(() => {
    setQ(searchQ ?? '');
  }, [searchQ]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: t('orders:list.id'),
        enableSorting: true,
        cell: (info) => (
          <CopyableField
            value={`${info.getValue().slice(0, 8)}…`}
            copyText={info.getValue()}
            copyLabel={t('common:actions.copy')}
            copiedLabel={t('common:actions.copied')}
          />
        ),
      }),
      columnHelper.display({
        id: 'customer',
        header: t('orders:list.customer'),
        enableSorting: false,
        cell: ({ row }) => [row.original.firstName, row.original.lastName].filter(Boolean).join(' ') || '—',
      }),
      columnHelper.accessor('phone', {
        header: t('orders:list.phone'),
        enableSorting: true,
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
        enableSorting: true,
        cell: (info) => <OrderStatusChip status={info.getValue()} />,
      }),
      columnHelper.accessor((row) => row.grandTotalMinor ?? row.totalMinor, {
        id: 'total',
        header: t('orders:list.total'),
        enableSorting: true,
        meta: { align: 'right' },
        cell: (info) => formatCurrency(info.getValue(), info.row.original.currency),
      }),
      columnHelper.accessor('createdAt', {
        header: t('orders:list.dates'),
        enableSorting: true,
        cell: ({ row }) => (
          <Stack spacing={0.25}>
            <Typography variant="body2">
              {t('orders:list.createdAt')}: {formatDateTime(row.original.createdAt)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('orders:list.orderedAt')}: {formatDateTime(row.original.orderedAt)}
            </Typography>
          </Stack>
        ),
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
    manualSorting: true,
    pageCount,
    state: {
      pagination: { pageIndex: page - 1, pageSize: limit },
      sorting,
    },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === 'function' ? updater({ pageIndex: page - 1, pageSize: limit }) : updater;
      setPage(next.pageIndex + 1);
    },
    onSortingChange: (updater) => {
      setSorting((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        return next;
      });
      setPage(1);
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
              applySearch(q);
            }
          }}
          sx={{ flex: '1 1 180px', minWidth: 160 }}
        />
        <SelectField
          label={t('orders:list.status')}
          size="small"
          width={220}
          visuallyFilledWhenEmpty
          value={statuses}
          onChange={(event) => {
            const value = event.target.value;
            setStatus(typeof value === 'string' ? (value.split(',') as OrderStatus[]) : value);
          }}
          slotProps={{
            select: {
              multiple: true,
              displayEmpty: true,
              renderValue: (selected) => {
                const values = selected as OrderStatus[];
                if (values.length === 0) {
                  return t('orders:list.statusAll');
                }
                return values.map((status) => t(`orders:status.${status}`)).join(', ');
              },
            },
          }}
        >
          {ORDER_STATUS_FILTER_OPTIONS.map((value) => (
            <MenuItem key={value} value={value}>
              {t(`orders:status.${value}`)}
            </MenuItem>
          ))}
        </SelectField>
        <TextField
          label={t('orders:list.dateFrom')}
          type="date"
          size="small"
          value={createdFrom ?? ''}
          onChange={(event) => setCreatedFrom(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ minWidth: 160 }}
        />
        <TextField
          label={t('orders:list.dateTo')}
          type="date"
          size="small"
          value={createdTo ?? ''}
          onChange={(event) => setCreatedTo(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ minWidth: 160 }}
        />
        <Button variant="outlined" onClick={() => applySearch(q)}>
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
          hover: true,
          sx: { cursor: 'pointer' },
          onClick: () => {
            orderDetailModalRef.current?.open({ orderId: row.original.id });
          },
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

      <OrderDetailModal ref={orderDetailModalRef} />
    </Stack>
  );
}
