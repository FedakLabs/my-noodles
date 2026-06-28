'use client';

import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { BusyArea, PriceRangeSlider } from '@my-noodles/ui';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { useProductFacets } from '@/api/products';
import { useCurrency } from '@/hooks/currency';
import {
  type CatalogFacetKey,
  toCatalogFacetsParams,
  useCatalogSearchParams,
} from '@/screens/catalog/search-params';

import { FilterFacetGroup } from './filter-facet-group';
import { FilterSheetSkeleton } from './filter-sheet-skeleton';

export type FilterSheetPanelLayout = 'drawer' | 'sidebar';

export type FilterSheetPanelProps = {
  layout?: FilterSheetPanelLayout;
};

export function FilterSheetPanel({ layout = 'drawer' }: FilterSheetPanelProps) {
  const isSidebar = layout === 'sidebar';
  const t = useTranslations('catalog.filters');
  const { formatCurrency, majorToMinor, minorToMajor } = useCurrency();
  const theme = useTheme();
  const { params, setParams } = useCatalogSearchParams();

  const facetsParams = useMemo(() => toCatalogFacetsParams(params), [params]);
  const {
    productFacets,
    productFacetsIsInitialLoad,
    productFacetsIsError,
    productFacetsIsBusy,
    productFacetsIsRefetching,
    productFacetsRefetch,
  } = useProductFacets(facetsParams);
  const facets = productFacets?.facets;

  const categoryOptions = facets?.category ?? [];
  const countryOptions = facets?.country ?? [];
  const brandOptions = facets?.brand ?? [];
  const isEmpty =
    Boolean(productFacets) &&
    categoryOptions.length === 0 &&
    countryOptions.length === 0 &&
    brandOptions.length === 0;

  const priceBoundsMinor = useMemo(() => {
    const min = facets?.price.min ?? 0;
    const max = facets?.price.max ?? min;
    return { min, max };
  }, [facets?.price.max, facets?.price.min]);

  const priceBoundsMajor = useMemo(
    () => ({
      min: minorToMajor(priceBoundsMinor.min),
      max: minorToMajor(priceBoundsMinor.max),
    }),
    [minorToMajor, priceBoundsMinor.max, priceBoundsMinor.min],
  );

  const priceValueMajor = useMemo<[number, number]>(
    () => [
      minorToMajor(params.priceMin ?? priceBoundsMinor.min),
      minorToMajor(params.priceMax ?? priceBoundsMinor.max),
    ],
    [minorToMajor, params.priceMax, params.priceMin, priceBoundsMinor.max, priceBoundsMinor.min],
  );

  const formatPriceLabel = (amountMajor: number) => formatCurrency(majorToMinor(amountMajor));

  const toggleArrayValue = (key: CatalogFacetKey, value: string) => {
    const current = params[key];
    const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
    void setParams({ [key]: next, page: 1 });
  };

  const panelBody = productFacetsIsInitialLoad ? (
    <FilterSheetSkeleton />
  ) : productFacetsIsError ? (
    <Stack spacing={2} sx={{ py: 1 }}>
      <Typography variant="body2" color="error">
        {t('error')}
      </Typography>
      <Button
        variant="outlined"
        size="small"
        onClick={() => void productFacetsRefetch()}
        sx={{ alignSelf: 'flex-start' }}
      >
        {t('retry')}
      </Button>
    </Stack>
  ) : isEmpty ? (
    <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
      {t('empty')}
    </Typography>
  ) : (
    <>
      <FilterFacetGroup
        title={t('category')}
        options={categoryOptions}
        selectedValues={params.category}
        onToggle={(value) => toggleArrayValue('category', value)}
      />

      <FilterFacetGroup
        title={t('country')}
        options={countryOptions}
        selectedValues={params.country}
        onToggle={(value) => toggleArrayValue('country', value)}
      />

      <FilterFacetGroup
        title={t('brand')}
        options={brandOptions}
        selectedValues={params.brand}
        onToggle={(value) => toggleArrayValue('brand', value)}
      />

      <PriceRangeSlider
        min={priceBoundsMajor.min}
        max={priceBoundsMajor.max}
        value={priceValueMajor}
        valueLabelFormat={formatPriceLabel}
        onCommit={([priceMinMajor, priceMaxMajor]) => {
          const priceMinMinor = majorToMinor(priceMinMajor);
          const priceMaxMinor = majorToMinor(priceMaxMajor);

          void setParams({
            priceMin: priceMinMinor <= priceBoundsMinor.min ? null : priceMinMinor,
            priceMax: priceMaxMinor >= priceBoundsMinor.max ? null : priceMaxMinor,
            page: 1,
          });
        }}
        label={t('price')}
        minLabel={t('priceMin')}
        maxLabel={t('priceMax')}
      />

      <FormControlLabel
        control={
          <Switch
            checked={Boolean(params.isTriedByUs)}
            disabled={!params.isTriedByUs && (facets?.isTriedByUs ?? 0) === 0}
            onChange={(_, checked) => void setParams({ isTriedByUs: checked || null, page: 1 })}
          />
        }
        label={t('triedByUs')}
      />

      <FormControlLabel
        control={
          <Switch
            checked={Boolean(params.inStock)}
            disabled={!params.inStock && (facets?.inStock ?? 0) === 0}
            onChange={(_, checked) => void setParams({ inStock: checked || null, page: 1 })}
          />
        }
        label={t('inStock')}
      />
    </>
  );

  return (
    <Stack
      sx={{
        ...(isSidebar ? { minWidth: 0 } : { flex: 1, minHeight: 0, minWidth: 0 }),
      }}
      aria-busy={productFacetsIsBusy ? true : undefined}
      aria-label={productFacetsIsInitialLoad ? t('loading') : undefined}
    >
      <BusyArea
        busy={productFacetsIsRefetching}
        show={productFacetsIsRefetching}
        label={t('searching')}
        timingOptions={{ minVisibleMs: 0, showDelayMs: 0 }}
        borderRadius={isSidebar ? theme.borderRadius.discovery : 0}
        sx={isSidebar ? { minWidth: 0 } : { flex: 1, minHeight: 0, minWidth: 0 }}
      >
        <Stack
          spacing={3}
          sx={{
            p: 2,
            ...(isSidebar
              ? {}
              : {
                  flex: 1,
                  minHeight: 0,
                  overflowY: 'auto',
                }),
          }}
        >
          <Typography variant="h6">{t('title')}</Typography>

          {panelBody}
        </Stack>
      </BusyArea>
    </Stack>
  );
}
