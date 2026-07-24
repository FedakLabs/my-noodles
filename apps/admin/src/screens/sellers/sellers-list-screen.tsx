import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { Seller } from '@my-noodles/api-clients/admin';
import { createColumnHelper, DataTable, useDataTable } from '@my-noodles/ui';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSellersList } from '@/api/sellers';
import { SellerFormModal, type SellerFormModalRef } from '@/components/sellers/seller-form-modal';

const columnHelper = createColumnHelper<Seller>();

export function SellersListScreen() {
  const { t } = useTranslation(['sellers', 'common']);
  const sellerFormModalRef = useRef<SellerFormModalRef>(null);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const limit = 20;

  const { sellers, sellersIsLoading, sellersIsError } = useSellersList({
    page,
    limit,
    q: search || undefined,
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor('slug', {
        header: t('sellers:list.columnSlug'),
      }),
      columnHelper.accessor('name', {
        header: t('sellers:list.columnName'),
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              sellerFormModalRef.current?.open({ mode: 'edit', sellerId: row.original.id });
            }}
          >
            {t('sellers:actions.edit')}
          </Button>
        ),
      }),
    ],
    [t],
  );

  const pageCount = sellers ? Math.max(1, Math.ceil(sellers.meta.total / limit)) : 0;

  const table = useDataTable({
    data: sellers?.items ?? [],
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
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4" component="h1">
          {t('sellers:list.title')}
        </Typography>
        <Button variant="contained" onClick={() => sellerFormModalRef.current?.open({ mode: 'create' })}>
          {t('common:actions.create')}
        </Button>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField
          label={t('sellers:list.search')}
          size="small"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              setPage(1);
              setSearch(q.trim());
            }
          }}
          sx={{ flex: '1 1 220px', minWidth: 200 }}
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
        busy={sellersIsLoading}
        busyLabel={t('common:states.loading')}
        isError={sellersIsError}
        errorContent={t('sellers:list.loadError')}
        emptyContent={t('sellers:list.empty')}
        getRowProps={(row) => ({
          hover: true,
          sx: { cursor: 'pointer' },
          onClick: () => {
            sellerFormModalRef.current?.open({ mode: 'edit', sellerId: row.original.id });
          },
        })}
        pagination={{
          previous: t('common:actions.previous'),
          next: t('common:actions.next'),
          page: t('sellers:list.page', {
            page: sellers?.meta.page ?? page,
            total: sellers?.meta.total ?? 0,
          }),
        }}
      />

      <SellerFormModal ref={sellerFormModalRef} />
    </Stack>
  );
}
