import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { AdminCartListItemDto } from '@my-noodles/api-clients/admin';
import { CopyableField, createColumnHelper, DataTable, SearchField, useDataTable } from '@my-noodles/ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useCartsList } from '@/api/carts';
import { CartDetailModal, type CartDetailModalRef } from '@/components/carts/cart-detail-modal';
import {
  CART_SEARCH_FIELDS,
  type CartSearchField,
  useCartsSearchParams,
} from '@/screens/carts/search-params';
import { formatCurrency } from '@/utils/format-currency';

const columnHelper = createColumnHelper<AdminCartListItemDto>();

export function CartsListScreen() {
  const { t } = useTranslation(['carts', 'common']);
  const {
    field: urlField,
    value: urlValue,
    visitorSessionId,
    applySearch,
    setField: setSearchField,
  } = useCartsSearchParams();
  const cartDetailModalRef = useRef<CartDetailModalRef>(null);
  const [page, setPage] = useState(1);
  const [field, setField] = useState<CartSearchField>(urlField);
  const [q, setQ] = useState(urlValue);
  const limit = 20;

  const searchFields = useMemo(
    () =>
      CART_SEARCH_FIELDS.map((value) => ({
        value,
        label: t('carts:list.searchByVisitorSessionId'),
      })),
    [t],
  );

  const { carts, cartsIsLoading, cartsIsError } = useCartsList({
    page,
    limit,
    visitorSessionId: visitorSessionId ?? undefined,
  });

  useEffect(() => {
    setField(urlField);
    setQ(urlValue);
    setPage(1);
  }, [urlField, urlValue]);

  function runSearch() {
    setPage(1);
    applySearch(q, field);
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('visitorSessionId', {
        header: t('carts:list.columnVisitorId'),
        cell: ({ getValue }) => (
          <CopyableField
            value={getValue()}
            copyLabel={t('common:actions.copy')}
            copiedLabel={t('common:actions.copied')}
          />
        ),
      }),
      columnHelper.accessor('totalMinor', {
        header: t('carts:list.columnTotal'),
        cell: ({ row, getValue }) => formatCurrency(getValue(), row.original.currency),
      }),
    ],
    [t],
  );

  const pageCount = carts ? Math.max(1, Math.ceil(carts.meta.total / limit)) : 0;

  const table = useDataTable({
    data: carts?.items ?? [],
    columns,
    getRowId: (row) => row.visitorSessionId,
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
        {t('carts:list.title')}
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
        <SearchField
          fields={searchFields}
          field={field}
          onFieldChange={(next) => {
            const nextField = next as CartSearchField;
            setField(nextField);
            setPage(1);
            setSearchField(nextField, q);
          }}
          value={q}
          onValueChange={setQ}
          onSubmit={runSearch}
          fieldLabel={t('carts:list.searchBy')}
          label={t('carts:list.search')}
        />
        <Button variant="outlined" onClick={runSearch}>
          {t('common:actions.search')}
        </Button>
      </Stack>

      <DataTable
        table={table}
        size="small"
        busy={cartsIsLoading}
        busyLabel={t('common:states.loading')}
        isError={cartsIsError}
        errorContent={t('carts:list.loadError')}
        emptyContent={t('carts:list.empty')}
        getRowProps={(row) => ({
          hover: true,
          sx: { cursor: 'pointer' },
          onClick: () => {
            cartDetailModalRef.current?.open({ visitorSessionId: row.original.visitorSessionId });
          },
        })}
        pagination={{
          previous: t('common:actions.previous'),
          next: t('common:actions.next'),
          page: t('carts:list.page', {
            page: carts?.meta.page ?? page,
            total: carts?.meta.total ?? 0,
          }),
        }}
      />

      <CartDetailModal ref={cartDetailModalRef} />
    </Stack>
  );
}
