import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { AdminProductDto, AdminProductSearchBy } from '@my-noodles/api-clients/admin';
import { ProductDiscoveryCard, SelectField } from '@my-noodles/ui';
import { useParams } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useBrandsList } from '@/api/brands';
import { useCategoriesList } from '@/api/categories';
import { useCountriesList } from '@/api/countries';
import { useProductsList } from '@/api/products';
import { ProductFormModal, type ProductFormModalRef } from '@/components/products/product-form-modal';
import { formatCurrency } from '@/utils/format-currency';

const SEARCH_BY_OPTIONS: AdminProductSearchBy[] = ['slug', 'name'];
const GRID_COLUMNS = 3;

export function ProductsListScreen() {
  const { t } = useTranslation(['products', 'common']);
  const { productId } = useParams({ strict: false });
  const productFormModalRef = useRef<ProductFormModalRef>(null);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [searchBy, setSearchBy] = useState<AdminProductSearchBy>('slug');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [brandIds, setBrandIds] = useState<string[]>([]);
  const [countryIds, setCountryIds] = useState<string[]>([]);
  const limit = 20;

  const { products, productsIsLoading, productsIsError } = useProductsList({
    page,
    limit,
    q: search || undefined,
    searchBy,
    categoryId: categoryIds.length > 0 ? categoryIds : undefined,
    brandId: brandIds.length > 0 ? brandIds : undefined,
    countryId: countryIds.length > 0 ? countryIds : undefined,
  });

  const { categories } = useCategoriesList({ page: 1, limit: 100 });
  const { brands } = useBrandsList({ page: 1, limit: 100 });
  const { countries } = useCountriesList({ page: 1, limit: 100 });

  useEffect(() => {
    if (productId) {
      productFormModalRef.current?.open({ mode: 'edit', productId });
    }
  }, [productId]);

  function runSearch() {
    setPage(1);
    setSearch(q.trim());
  }

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
        <TextField
          label={t('products:list.search')}
          size="small"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              runSearch();
            }
          }}
          sx={{ flex: '1 1 180px', minWidth: 160 }}
        />
        <SelectField
          label={t('products:list.searchBySlug')}
          size="small"
          width={140}
          value={searchBy}
          onChange={(event) => setSearchBy(event.target.value as AdminProductSearchBy)}
        >
          {SEARCH_BY_OPTIONS.map((value) => (
            <MenuItem key={value} value={value}>
              {value === 'slug' ? t('products:list.searchBySlug') : t('products:list.searchByName')}
            </MenuItem>
          ))}
        </SelectField>
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
                  .map((id) => categories?.items.find((category) => category.id === id)?.name.uk ?? id)
                  .join(', ');
              },
            },
          }}
        >
          {(categories?.items ?? []).map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name.uk}
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
                  .map((id) => countries?.items.find((country) => country.id === id)?.name.uk ?? id)
                  .join(', ');
              },
            },
          }}
        >
          {(countries?.items ?? []).map((country) => (
            <MenuItem key={country.id} value={country.id}>
              {country.name.uk}
            </MenuItem>
          ))}
        </SelectField>
        <Button variant="outlined" onClick={runSearch}>
          {t('common:actions.search')}
        </Button>
      </Stack>

      {productsIsLoading ? <Typography>{t('common:states.loading')}</Typography> : null}
      {productsIsError ? <Typography color="error">{t('products:list.loadError')}</Typography> : null}
      {!productsIsLoading && products?.items.length === 0 ? (
        <Typography color="text.secondary">{t('products:list.empty')}</Typography>
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(260px, 1fr))`,
          gap: 2,
        }}
      >
        {(products?.items ?? []).map((product: AdminProductDto, index: number) => (
          <ProductDiscoveryCard
            key={product.id}
            name={product.name.uk}
            countryLabel={product.country.name.uk}
            priceLabel={formatCurrency(product.priceMinor, product.currency)}
            mediaItems={[
              ...product.images.map((url) => ({ type: 'image' as const, url, alt: product.name.uk })),
              ...product.videos.map((url) => ({ type: 'video' as const, url, alt: product.name.uk })),
            ]}
            skinInput={{
              brand: product.brand?.slug,
              country: product.country.slug,
              category: product.category.slug,
              slug: product.slug,
            }}
            gridIndex={index}
            gridColumns={GRID_COLUMNS}
            details={{
              loading: false,
              story: product.story.uk,
              description: product.description.uk,
              forWhom: product.forWhom.uk,
              emptyMessage: t('products:card.detailsEmpty'),
              storyLabel: t('products:card.storyLabel'),
              descriptionLabel: t('products:card.descriptionLabel'),
              forWhomLabel: t('products:card.forWhomLabel'),
            }}
            actions={[
              <Button
                key="edit"
                variant="text"
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  productFormModalRef.current?.open({ mode: 'edit', productId: product.id });
                }}
              >
                {t('products:actions.edit')}
              </Button>,
            ]}
          />
        ))}
      </Box>

      {products ? (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
          <Button disabled={page <= 1} onClick={() => setPage((prev) => prev - 1)}>
            {t('common:actions.previous')}
          </Button>
          <Typography variant="body2">
            {t('products:list.page', { page, total: products.meta.total })}
          </Typography>
          <Button disabled={page * limit >= products.meta.total} onClick={() => setPage((prev) => prev + 1)}>
            {t('common:actions.next')}
          </Button>
        </Stack>
      ) : null}

      <ProductFormModal ref={productFormModalRef} />
    </Stack>
  );
}
