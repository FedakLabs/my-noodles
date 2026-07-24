import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { AdminOrder, AdminOrdersSortBy, OrderStatus } from '@my-noodles/api-clients/admin';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@my-noodles/locale';
import {
  CopyableField,
  createColumnHelper,
  DataTable,
  DateRangePicker,
  type DatePreset,
  type DateRange,
  SelectField,
  useDataTable,
  type SortingState,
} from '@my-noodles/ui';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
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
const ISO_DATE = 'YYYY-MM-DD';

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

function parseIsoDate(value: string | null | undefined): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }

  const [yearString, monthString, dayString] = value.split('-');
  const year = Number(yearString);
  const month = Number(monthString);
  const day = Number(dayString);
  const parsed = dayjs(new Date(year, month - 1, day));

  if (!parsed.isValid() || parsed.year() !== year || parsed.month() !== month - 1 || parsed.date() !== day) {
    return undefined;
  }

  return parsed.startOf('day').toDate();
}

function formatTriggerValue(from: string | null, to: string | null): string {
  if (!from && !to) {
    return '';
  }

  const fromLabel = from ? dayjs(from).format('DD.MM.YYYY') : '…';
  const toLabel = to ? dayjs(to).format('DD.MM.YYYY') : '…';
  return `${fromLabel} – ${toLabel}`;
}

export function OrdersListScreen() {
  const { t, i18n } = useTranslation(['orders', 'common']);
  const chromeLocale: Locale = isLocale(i18n.language) ? i18n.language : DEFAULT_LOCALE;
  const {
    q: searchQ,
    status: statuses,
    createdFrom,
    createdTo,
    page,
    applySearch,
    setStatus,
    setCreatedRange,
    setPage,
  } = useOrdersSearchParams();
  const orderDetailModalRef = useRef<OrderDetailModalRef>(null);
  const [q, setQ] = useState(searchQ ?? '');
  const [sorting, setSorting] = useState<SortingState>(DEFAULT_SORTING);
  const [dateAnchorEl, setDateAnchorEl] = useState<HTMLElement | null>(null);
  const limit = 20;

  const activeSort = sorting[0];
  const sortBy = activeSort ? COLUMN_TO_SORT_BY[activeSort.id] : undefined;
  const sortOrder = activeSort ? (activeSort.desc ? 'desc' : 'asc') : undefined;
  const datePopoverOpen = Boolean(dateAnchorEl);

  const rangeValue = useMemo<Partial<DateRange> | undefined>(() => {
    const from = parseIsoDate(createdFrom);
    const to = parseIsoDate(createdTo);
    if (!from && !to) {
      return undefined;
    }
    return { from, to };
  }, [createdFrom, createdTo]);

  const datePresets = useMemo<DatePreset[][]>(
    () => [
      [
        {
          id: 'last7',
          label: t('orders:list.presets.last7'),
          getValue: () => ({
            from: dayjs().subtract(6, 'day').startOf('day').toDate(),
            to: dayjs().startOf('day').toDate(),
          }),
        },
        {
          id: 'last30',
          label: t('orders:list.presets.last30'),
          getValue: () => ({
            from: dayjs().subtract(29, 'day').startOf('day').toDate(),
            to: dayjs().startOf('day').toDate(),
          }),
        },
        {
          id: 'thisMonth',
          label: t('orders:list.presets.thisMonth'),
          getValue: () => ({
            from: dayjs().startOf('month').toDate(),
            to: dayjs().startOf('day').toDate(),
          }),
        },
      ],
    ],
    [t],
  );

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

  const openDatePopover = (event: MouseEvent<HTMLElement>) => {
    setDateAnchorEl(event.currentTarget);
  };

  const closeDatePopover = () => {
    setDateAnchorEl(null);
  };

  const handleDateApply = (range: DateRange) => {
    setCreatedRange(dayjs(range.from).format(ISO_DATE), dayjs(range.to).format(ISO_DATE));
    closeDatePopover();
  };

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
          label={t('orders:list.dates')}
          size="small"
          value={formatTriggerValue(createdFrom, createdTo)}
          placeholder={t('orders:list.datesPlaceholder')}
          onClick={openDatePopover}
          slotProps={{
            input: { readOnly: true },
            inputLabel: { shrink: true },
          }}
          sx={{ minWidth: 220, cursor: 'pointer' }}
        />
        <Popover
          open={datePopoverOpen}
          anchorEl={dateAnchorEl}
          onClose={closeDatePopover}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          <DateRangePicker
            value={rangeValue}
            locale={chromeLocale}
            presets={datePresets}
            applyLabel={t('orders:list.dateApply')}
            fromLabel={t('orders:list.dateFrom')}
            toLabel={t('orders:list.dateTo')}
            previousMonthLabel={t('orders:list.prevMonth')}
            nextMonthLabel={t('orders:list.nextMonth')}
            onApply={handleDateApply}
          />
        </Popover>
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
