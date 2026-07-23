import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { Brand } from '@my-noodles/api-clients/admin';
import { createColumnHelper, DataTable, useDataTable } from '@my-noodles/ui';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useBrandsList } from '@/api/brands';
import { BrandFormModal, type BrandFormModalRef } from '@/components/brands/brand-form-modal';

const columnHelper = createColumnHelper<Brand>();

export function BrandsListScreen() {
  const { t } = useTranslation(['brands', 'common']);
  const brandFormModalRef = useRef<BrandFormModalRef>(null);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const limit = 20;

  const { brands, brandsIsLoading, brandsIsError } = useBrandsList({
    page,
    limit,
    q: search || undefined,
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor('slug', {
        header: t('brands:list.columnSlug'),
      }),
      columnHelper.accessor('name', {
        header: t('brands:list.columnName'),
      }),
      columnHelper.accessor('themeKey', {
        header: t('brands:list.columnTheme'),
        cell: (info) => info.getValue() ?? '—',
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              brandFormModalRef.current?.open({ mode: 'edit', brandId: row.original.id });
            }}
          >
            {t('brands:actions.edit')}
          </Button>
        ),
      }),
    ],
    [t],
  );

  const pageCount = brands ? Math.max(1, Math.ceil(brands.meta.total / limit)) : 0;

  const table = useDataTable({
    data: brands?.items ?? [],
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
          {t('brands:list.title')}
        </Typography>
        <Button variant="contained" onClick={() => brandFormModalRef.current?.open({ mode: 'create' })}>
          {t('common:actions.create')}
        </Button>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField
          label={t('brands:list.search')}
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
        busy={brandsIsLoading}
        busyLabel={t('common:states.loading')}
        isError={brandsIsError}
        errorContent={t('brands:list.loadError')}
        emptyContent={t('brands:list.empty')}
        getRowProps={(row) => ({
          hover: true,
          sx: { cursor: 'pointer' },
          onClick: () => {
            brandFormModalRef.current?.open({ mode: 'edit', brandId: row.original.id });
          },
        })}
        pagination={{
          previous: t('common:actions.previous'),
          next: t('common:actions.next'),
          page: t('brands:list.page', {
            page: brands?.meta.page ?? page,
            total: brands?.meta.total ?? 0,
          }),
        }}
      />

      <BrandFormModal ref={brandFormModalRef} />
    </Stack>
  );
}
