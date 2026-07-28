import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { Collection } from '@my-noodles/api-clients/admin';
import { createColumnHelper, DataTable, useDataTable } from '@my-noodles/ui';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useCollectionsList } from '@/api/collections';
import { CollectionActiveCheckbox } from '@/components/collections/collection-active-checkbox';
import {
  CollectionFormModal,
  type CollectionFormModalRef,
} from '@/components/collections/collection-form-modal';

const columnHelper = createColumnHelper<Collection>();

export function CollectionsListScreen() {
  const { t } = useTranslation(['collections', 'common']);
  const collectionFormModalRef = useRef<CollectionFormModalRef>(null);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const limit = 20;

  const { collections, collectionsIsLoading, collectionsIsError } = useCollectionsList({
    page,
    limit,
    q: search || undefined,
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor('slug', {
        header: t('collections:list.columnSlug'),
      }),
      columnHelper.accessor((row) => row.name, {
        id: 'name',
        header: t('collections:list.columnName'),
      }),
      columnHelper.accessor('emoji', {
        header: t('collections:list.columnEmoji'),
        cell: (info) => info.getValue() ?? '—',
      }),
      columnHelper.accessor('sortOrder', {
        header: t('collections:list.columnSortOrder'),
        meta: { align: 'right' },
      }),
      columnHelper.accessor('isActive', {
        header: t('collections:list.columnActive'),
        cell: ({ row }) => (
          <CollectionActiveCheckbox collectionId={row.original.id} isActive={row.original.isActive} />
        ),
      }),
    ],
    [t],
  );

  const pageCount = collections ? Math.max(1, Math.ceil(collections.meta.total / limit)) : 0;

  const table = useDataTable({
    data: collections?.items ?? [],
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
          {t('collections:list.title')}
        </Typography>
        <Button variant="contained" onClick={() => collectionFormModalRef.current?.open({ mode: 'create' })}>
          {t('common:actions.create')}
        </Button>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField
          label={t('collections:list.search')}
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
        busy={collectionsIsLoading}
        busyLabel={t('common:states.loading')}
        isError={collectionsIsError}
        errorContent={t('collections:list.loadError')}
        emptyContent={t('collections:list.empty')}
        getRowProps={(row) => ({
          hover: true,
          sx: { cursor: 'pointer' },
          onClick: () => {
            collectionFormModalRef.current?.open({ mode: 'edit', collectionId: row.original.id });
          },
        })}
        pagination={{
          previous: t('common:actions.previous'),
          next: t('common:actions.next'),
          page: t('collections:list.page', {
            page: collections?.meta.page ?? page,
            total: collections?.meta.total ?? 0,
          }),
        }}
      />

      <CollectionFormModal ref={collectionFormModalRef} />
    </Stack>
  );
}
