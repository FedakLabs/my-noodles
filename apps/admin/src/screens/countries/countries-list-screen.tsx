import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { Country } from '@my-noodles/api-clients/admin';
import { createColumnHelper, DataTable, useDataTable } from '@my-noodles/ui';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useCountriesList } from '@/api/countries';
import { CountryFormModal, type CountryFormModalRef } from '@/components/countries/country-form-modal';

const columnHelper = createColumnHelper<Country>();

export function CountriesListScreen() {
  const { t } = useTranslation(['countries', 'common']);
  const countryFormModalRef = useRef<CountryFormModalRef>(null);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const limit = 20;

  const { countries, countriesIsLoading, countriesIsError } = useCountriesList({
    page,
    limit,
    q: search || undefined,
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor('code', {
        header: t('countries:list.columnCode'),
      }),
      columnHelper.accessor('slug', {
        header: t('countries:list.columnSlug'),
      }),
      columnHelper.accessor((row) => row.name, {
        id: 'name',
        header: t('countries:list.columnName'),
      }),
      columnHelper.accessor('flagEmoji', {
        header: t('countries:list.columnFlag'),
        cell: (info) => info.getValue() ?? '—',
      }),
      columnHelper.accessor('themeKey', {
        header: t('countries:list.columnTheme'),
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
              countryFormModalRef.current?.open({ mode: 'edit', countryId: row.original.id });
            }}
          >
            {t('countries:actions.edit')}
          </Button>
        ),
      }),
    ],
    [t],
  );

  const pageCount = countries ? Math.max(1, Math.ceil(countries.meta.total / limit)) : 0;

  const table = useDataTable({
    data: countries?.items ?? [],
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
          {t('countries:list.title')}
        </Typography>
        <Button variant="contained" onClick={() => countryFormModalRef.current?.open({ mode: 'create' })}>
          {t('common:actions.create')}
        </Button>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField
          label={t('countries:list.search')}
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
        busy={countriesIsLoading}
        busyLabel={t('common:states.loading')}
        isError={countriesIsError}
        errorContent={t('countries:list.loadError')}
        emptyContent={t('countries:list.empty')}
        getRowProps={(row) => ({
          hover: true,
          sx: { cursor: 'pointer' },
          onClick: () => {
            countryFormModalRef.current?.open({ mode: 'edit', countryId: row.original.id });
          },
        })}
        pagination={{
          previous: t('common:actions.previous'),
          next: t('common:actions.next'),
          page: t('countries:list.page', {
            page: countries?.meta.page ?? page,
            total: countries?.meta.total ?? 0,
          }),
        }}
      />

      <CountryFormModal ref={countryFormModalRef} />
    </Stack>
  );
}
