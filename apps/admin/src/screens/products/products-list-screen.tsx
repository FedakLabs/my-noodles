import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { AdminProductDto } from '@my-noodles/api-clients/admin';
import { DEFAULT_LOCALE, pickLocalized } from '@my-noodles/locale';
import {
  createColumnHelper,
  DataTable,
  InlineEditableNumber,
  SearchField,
  SelectField,
  useDataTable,
} from '@my-noodles/ui';
import SearchIcon from '@my-noodles/ui/icons/search.svg';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useBrandsList } from '@/api/brands';
import { useCategoriesList } from '@/api/categories';
import { useCountriesList } from '@/api/countries';
import { useProductsList } from '@/api/products';
import {
  ConfirmQuantityChangeModal,
  type ConfirmQuantityChangeModalRef,
} from '@/components/products/confirm-quantity-change-modal';
import { ProductAvailableCheckbox } from '@/components/products/product-available-checkbox';
import {
  ProductCardPreviewModal,
  type ProductCardPreviewModalRef,
} from '@/components/products/product-card-preview-modal';
import { ProductFormModal, type ProductFormModalRef } from '@/components/products/product-form-modal';
import {
  PRODUCT_SEARCH_FIELDS,
  type ProductSearchField,
  useProductsSearchParams,
} from '@/screens/products/search-params';
import { formatCurrency } from '@/utils/format-currency';

const columnHelper = createColumnHelper<AdminProductDto>();

export function ProductsListScreen() {
  const { t } = useTranslation(['products', 'common']);
  const {
    field: urlField,
    value: urlValue,
    slug,
    name,
    applySearch,
    setField: setSearchField,
  } = useProductsSearchParams();
  const productFormModalRef = useRef<ProductFormModalRef>(null);
  const productPreviewModalRef = useRef<ProductCardPreviewModalRef>(null);
  const confirmQuantityModalRef = useRef<ConfirmQuantityChangeModalRef>(null);
  const [page, setPage] = useState(1);
  const [field, setField] = useState<ProductSearchField>(urlField);
  const [q, setQ] = useState(urlValue);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [brandIds, setBrandIds] = useState<string[]>([]);
  const [countryIds, setCountryIds] = useState<string[]>([]);
  const limit = 20;

  const searchFields = useMemo(
    () =>
      PRODUCT_SEARCH_FIELDS.map((value) => ({
        value,
        label: value === 'slug' ? t('products:list.searchBySlug') : t('products:list.searchByName'),
      })),
    [t],
  );

  const { products, productsIsLoading, productsIsError } = useProductsList({
    page,
    limit,
    slug: slug ?? undefined,
    name: name ?? undefined,
    categoryId: categoryIds.length > 0 ? categoryIds : undefined,
    brandId: brandIds.length > 0 ? brandIds : undefined,
    countryId: countryIds.length > 0 ? countryIds : undefined,
  });

  const { categories } = useCategoriesList({ page: 1, limit: 100 });
  const { brands } = useBrandsList({ page: 1, limit: 100 });
  const { countries } = useCountriesList({ page: 1, limit: 100 });

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
      columnHelper.accessor('slug', {
        header: t('products:list.columnSlug'),
      }),
      columnHelper.accessor((row) => pickLocalized(row.name, DEFAULT_LOCALE), {
        id: 'name',
        header: t('products:list.columnName'),
        cell: ({ row, getValue }) => (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', minWidth: 0 }}>
            <IconButton
              size="small"
              aria-label={t('products:list.preview')}
              onClick={(event) => {
                event.stopPropagation();
                productPreviewModalRef.current?.open({
                  productId: row.original.id,
                });
              }}
            >
              <SearchIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2" noWrap>
              {getValue()}
            </Typography>
          </Stack>
        ),
      }),
      columnHelper.accessor((row) => formatCurrency(row.priceMinor, row.currency), {
        id: 'price',
        header: t('products:list.columnPrice'),
      }),
      columnHelper.accessor((row) => row.brand?.name ?? '—', {
        id: 'brand',
        header: t('products:list.columnBrand'),
      }),
      columnHelper.accessor((row) => pickLocalized(row.country.name, DEFAULT_LOCALE), {
        id: 'country',
        header: t('products:list.columnCountry'),
      }),
      columnHelper.accessor((row) => pickLocalized(row.category.name, DEFAULT_LOCALE), {
        id: 'category',
        header: t('products:list.columnCategory'),
      }),
      columnHelper.accessor('quantity', {
        header: t('products:list.columnQuantity'),
        cell: ({ row }) => {
          const product = row.original;
          return (
            <InlineEditableNumber
              value={product.quantity}
              ariaLabel={t('products:quantity.editAriaLabel')}
              confirmLabel={t('products:quantity.confirmAriaLabel')}
              cancelLabel={t('products:quantity.cancelAriaLabel')}
              onSubmitRequest={(next) => {
                confirmQuantityModalRef.current?.open({
                  productId: product.id,
                  slug: product.slug,
                  name: pickLocalized(product.name, DEFAULT_LOCALE),
                  from: product.quantity,
                  to: next,
                });
              }}
            />
          );
        },
      }),
      columnHelper.accessor('available', {
        header: t('products:list.columnAvailable'),
        cell: ({ row }) => (
          <ProductAvailableCheckbox productId={row.original.id} available={row.original.available} />
        ),
      }),
    ],
    [t],
  );

  const pageCount = products ? Math.max(1, Math.ceil(products.meta.total / limit)) : 0;

  const table = useDataTable({
    data: products?.items ?? [],
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
          {t('products:list.title')}
        </Typography>
        <Button variant="contained" onClick={() => productFormModalRef.current?.open({ mode: 'create' })}>
          {t('common:actions.create')}
        </Button>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
        <SearchField
          fields={searchFields}
          field={field}
          onFieldChange={(next) => {
            const nextField = next as ProductSearchField;
            setField(nextField);
            setPage(1);
            setSearchField(nextField, q);
          }}
          value={q}
          onValueChange={setQ}
          onSubmit={runSearch}
          fieldLabel={t('products:list.searchBy')}
          label={t('products:list.search')}
        />
        <SelectField
          label={t('products:list.category')}
          size="small"
          width={200}
          visuallyFilledWhenEmpty
          value={categoryIds}
          onChange={(event) => {
            const next = event.target.value;
            setPage(1);
            setCategoryIds(typeof next === 'string' ? next.split(',') : next);
          }}
          slotProps={{
            select: {
              multiple: true,
              displayEmpty: true,
              renderValue: (selected) => {
                const values = selected as string[];
                if (values.length === 0) {
                  return t('products:list.categoryAll');
                }
                return values
                  .map((id) => {
                    const category = categories?.items.find((item) => item.id === id);
                    return category ? pickLocalized(category.name, DEFAULT_LOCALE) : id;
                  })
                  .join(', ');
              },
            },
          }}
        >
          {(categories?.items ?? []).map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {pickLocalized(category.name, DEFAULT_LOCALE)}
            </MenuItem>
          ))}
        </SelectField>
        <SelectField
          label={t('products:list.brand')}
          size="small"
          width={200}
          visuallyFilledWhenEmpty
          value={brandIds}
          onChange={(event) => {
            const next = event.target.value;
            setPage(1);
            setBrandIds(typeof next === 'string' ? next.split(',') : next);
          }}
          slotProps={{
            select: {
              multiple: true,
              displayEmpty: true,
              renderValue: (selected) => {
                const values = selected as string[];
                if (values.length === 0) {
                  return t('products:list.brandAll');
                }
                return values
                  .map((id) => brands?.items.find((brand) => brand.id === id)?.name ?? id)
                  .join(', ');
              },
            },
          }}
        >
          {(brands?.items ?? []).map((brand) => (
            <MenuItem key={brand.id} value={brand.id}>
              {brand.name}
            </MenuItem>
          ))}
        </SelectField>
        <SelectField
          label={t('products:list.country')}
          size="small"
          width={200}
          visuallyFilledWhenEmpty
          value={countryIds}
          onChange={(event) => {
            const next = event.target.value;
            setPage(1);
            setCountryIds(typeof next === 'string' ? next.split(',') : next);
          }}
          slotProps={{
            select: {
              multiple: true,
              displayEmpty: true,
              renderValue: (selected) => {
                const values = selected as string[];
                if (values.length === 0) {
                  return t('products:list.countryAll');
                }
                return values
                  .map((id) => {
                    const country = countries?.items.find((item) => item.id === id);
                    return country ? pickLocalized(country.name, DEFAULT_LOCALE) : id;
                  })
                  .join(', ');
              },
            },
          }}
        >
          {(countries?.items ?? []).map((country) => (
            <MenuItem key={country.id} value={country.id}>
              {pickLocalized(country.name, DEFAULT_LOCALE)}
            </MenuItem>
          ))}
        </SelectField>
        <Button variant="outlined" onClick={runSearch}>
          {t('common:actions.search')}
        </Button>
      </Stack>

      <DataTable
        table={table}
        size="small"
        busy={productsIsLoading}
        busyLabel={t('common:states.loading')}
        isError={productsIsError}
        errorContent={t('products:list.loadError')}
        emptyContent={t('products:list.empty')}
        getRowProps={(row) => ({
          hover: true,
          sx: { cursor: 'pointer' },
          onClick: () => {
            productFormModalRef.current?.open({ mode: 'edit', productId: row.original.id });
          },
        })}
        pagination={{
          previous: t('common:actions.previous'),
          next: t('common:actions.next'),
          page: t('products:list.page', {
            page: products?.meta.page ?? page,
            total: products?.meta.total ?? 0,
          }),
        }}
      />

      <ProductFormModal
        ref={productFormModalRef}
        onViewProductCard={(productId) => {
          productPreviewModalRef.current?.open({ productId });
        }}
      />
      <ProductCardPreviewModal
        ref={productPreviewModalRef}
        onEditProduct={(productId) => {
          productFormModalRef.current?.open({ mode: 'edit', productId });
        }}
      />
      <ConfirmQuantityChangeModal ref={confirmQuantityModalRef} />
    </Stack>
  );
}
