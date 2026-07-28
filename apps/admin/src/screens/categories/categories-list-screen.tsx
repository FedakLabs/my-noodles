import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { Category } from '@my-noodles/api-clients/admin';
import { createColumnHelper, DataTable, useDataTable } from '@my-noodles/ui';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useCategoriesList } from '@/api/categories';
import { CategoryFormModal, type CategoryFormModalRef } from '@/components/categories/category-form-modal';

const columnHelper = createColumnHelper<Category>();

export function CategoriesListScreen() {
  const { t } = useTranslation(['categories', 'common']);
  const categoryFormModalRef = useRef<CategoryFormModalRef>(null);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const limit = 20;

  const { categories, categoriesIsLoading, categoriesIsError } = useCategoriesList({
    page,
    limit,
    q: search || undefined,
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor('slug', {
        header: t('categories:list.columnSlug'),
      }),
      columnHelper.accessor((row) => row.name, {
        id: 'name',
        header: t('categories:list.columnName'),
      }),
      columnHelper.accessor('sortOrder', {
        header: t('categories:list.columnSortOrder'),
        meta: { align: 'right' },
      }),
      columnHelper.accessor('themeKey', {
        header: t('categories:list.columnTheme'),
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
              categoryFormModalRef.current?.open({ mode: 'edit', categoryId: row.original.id });
            }}
          >
            {t('categories:actions.edit')}
          </Button>
        ),
      }),
    ],
    [t],
  );

  const pageCount = categories ? Math.max(1, Math.ceil(categories.meta.total / limit)) : 0;

  const table = useDataTable({
    data: categories?.items ?? [],
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
          {t('categories:list.title')}
        </Typography>
        <Button variant="contained" onClick={() => categoryFormModalRef.current?.open({ mode: 'create' })}>
          {t('common:actions.create')}
        </Button>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField
          label={t('categories:list.search')}
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
        busy={categoriesIsLoading}
        busyLabel={t('common:states.loading')}
        isError={categoriesIsError}
        errorContent={t('categories:list.loadError')}
        emptyContent={t('categories:list.empty')}
        getRowProps={(row) => ({
          hover: true,
          sx: { cursor: 'pointer' },
          onClick: () => {
            categoryFormModalRef.current?.open({ mode: 'edit', categoryId: row.original.id });
          },
        })}
        pagination={{
          previous: t('common:actions.previous'),
          next: t('common:actions.next'),
          page: t('categories:list.page', {
            page: categories?.meta.page ?? page,
            total: categories?.meta.total ?? 0,
          }),
        }}
      />

      <CategoryFormModal ref={categoryFormModalRef} />
    </Stack>
  );
}
