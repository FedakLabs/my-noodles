'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Drawer from '@mui/material/Drawer';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { PriceRangeSlider } from '@my-noodles/ui';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { useProductFacets } from '@/api/products';
import { SmoothBusyVeil } from '@/components/navigation/smooth-busy-veil';
import { useSmoothBusyState } from '@/hooks/smooth';
import {
  type CatalogFacetKey,
  type CatalogSearchParams,
  toCatalogFacetsParams,
  useCatalogSearchParams,
} from '@/screens/catalog/search-params';
import { DEFAULT_CURRENCY, formatCurrency, majorToMinor, minorToMajor } from '@/utils/format-currency';

import { isFilterOptionDisabled } from './filter-options';
import { FilterSheetSkeleton } from './filter-sheet-skeleton';

type FilterSheetPanelProps = {
  params: CatalogSearchParams;
  onSetParams: (patch: Partial<CatalogSearchParams>) => void;
  onResetFilters: () => void;
};

function FilterSheetPanel({ params, onSetParams, onResetFilters }: FilterSheetPanelProps) {
  const t = useTranslations('catalog.filters');
  const locale = useLocale();

  const facetsParams = useMemo(() => toCatalogFacetsParams(params), [params]);
  const {
    productFacets,
    productFacetsIsInitialLoad,
    productFacetsIsLoadFailed,
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
  const {
    mounted: refetchVeilMounted,
    active: refetchVeilActive,
    transitionMs,
    transitionEasing,
  } = useSmoothBusyState(productFacetsIsRefetching);

  const priceBoundsMinor = useMemo(() => {
    const min = facets?.price.min ?? 0;
    const max = facets?.price.max ?? min;
    return { min, max };
  }, [facets?.price.max, facets?.price.min]);

  const priceBoundsMajor = useMemo(
    () => ({
      min: minorToMajor(priceBoundsMinor.min, DEFAULT_CURRENCY),
      max: minorToMajor(priceBoundsMinor.max, DEFAULT_CURRENCY),
    }),
    [priceBoundsMinor.max, priceBoundsMinor.min],
  );

  const priceValueMajor = useMemo<[number, number]>(
    () => [
      minorToMajor(params.priceMin ?? priceBoundsMinor.min, DEFAULT_CURRENCY),
      minorToMajor(params.priceMax ?? priceBoundsMinor.max, DEFAULT_CURRENCY),
    ],
    [params.priceMax, params.priceMin, priceBoundsMinor.max, priceBoundsMinor.min],
  );

  const formatPriceLabel = (amountMajor: number) =>
    formatCurrency(majorToMinor(amountMajor, DEFAULT_CURRENCY), DEFAULT_CURRENCY, locale);

  const toggleArrayValue = (key: CatalogFacetKey, value: string) => {
    const current = params[key];
    const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
    onSetParams({ [key]: next, page: 1 });
  };

  const panelBody = productFacetsIsInitialLoad ? (
    <FilterSheetSkeleton />
  ) : productFacetsIsLoadFailed ? (
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
      <Stack spacing={1}>
        <Typography variant="subtitle2">{t('category')}</Typography>
        <FormGroup>
          {categoryOptions.map((option) => {
            const selected = params.category.includes(option.value);
            const disabled = isFilterOptionDisabled(option, params.category);
            return (
              <FormControlLabel
                key={option.value}
                sx={{ color: disabled ? 'text.disabled' : 'text.primary' }}
                control={
                  <Checkbox
                    checked={selected}
                    disabled={disabled}
                    onChange={() => toggleArrayValue('category', option.value)}
                  />
                }
                label={`${option.label ?? option.value} (${option.count})`}
              />
            );
          })}
        </FormGroup>
      </Stack>

      <Stack spacing={1}>
        <Typography variant="subtitle2">{t('country')}</Typography>
        <FormGroup>
          {countryOptions.map((option) => {
            const selected = params.country.includes(option.value);
            const disabled = isFilterOptionDisabled(option, params.country);
            return (
              <FormControlLabel
                key={option.value}
                sx={{ color: disabled ? 'text.disabled' : 'text.primary' }}
                control={
                  <Checkbox
                    checked={selected}
                    disabled={disabled}
                    onChange={() => toggleArrayValue('country', option.value)}
                  />
                }
                label={`${option.label ?? option.value} (${option.count})`}
              />
            );
          })}
        </FormGroup>
      </Stack>

      <Stack spacing={1}>
        <Typography variant="subtitle2">{t('brand')}</Typography>
        <FormGroup>
          {brandOptions.map((option) => {
            const selected = params.brand.includes(option.value);
            const disabled = isFilterOptionDisabled(option, params.brand);
            return (
              <FormControlLabel
                key={option.value}
                sx={{ color: disabled ? 'text.disabled' : 'text.primary' }}
                control={
                  <Checkbox
                    checked={selected}
                    disabled={disabled}
                    onChange={() => toggleArrayValue('brand', option.value)}
                  />
                }
                label={`${option.label ?? option.value} (${option.count})`}
              />
            );
          })}
        </FormGroup>
      </Stack>

      <PriceRangeSlider
        min={priceBoundsMajor.min}
        max={priceBoundsMajor.max}
        value={priceValueMajor}
        valueLabelFormat={formatPriceLabel}
        onCommit={([priceMinMajor, priceMaxMajor]) => {
          const priceMinMinor = majorToMinor(priceMinMajor, DEFAULT_CURRENCY);
          const priceMaxMinor = majorToMinor(priceMaxMajor, DEFAULT_CURRENCY);

          onSetParams({
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
            onChange={(_, checked) => onSetParams({ isTriedByUs: checked || null, page: 1 })}
          />
        }
        label={t('triedByUs')}
      />

      <FormControlLabel
        control={
          <Switch
            checked={Boolean(params.inStock)}
            disabled={!params.inStock && (facets?.inStock ?? 0) === 0}
            onChange={(_, checked) => onSetParams({ inStock: checked || null, page: 1 })}
          />
        }
        label={t('inStock')}
      />
    </>
  );

  return (
    <Stack
      sx={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        position: 'relative',
        opacity: refetchVeilActive ? 0.9 : 1,
        pointerEvents: refetchVeilActive ? 'none' : 'auto',
        transition: `opacity ${transitionMs}ms ${transitionEasing}`,
      }}
      aria-busy={productFacetsIsBusy ? true : undefined}
      aria-label={productFacetsIsInitialLoad ? t('loading') : undefined}
    >
      <Stack
        spacing={3}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          p: 2,
        }}
      >
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{t('title')}</Typography>
          <Button size="small" onClick={onResetFilters} disabled={productFacetsIsBusy}>
            {t('reset')}
          </Button>
        </Stack>

        {panelBody}
      </Stack>

      {refetchVeilMounted ? (
        <SmoothBusyVeil
          visible={refetchVeilActive}
          label={t('searching')}
          transitionMs={transitionMs}
          transitionEasing={transitionEasing}
          borderRadius={0}
        />
      ) : null}
    </Stack>
  );
}

type FilterSheetProps = {
  desktopMaxHeight?: number;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

export function FilterSheet({ desktopMaxHeight, mobileOpen = false, onMobileClose }: FilterSheetProps) {
  const { params, setParams, resetFilters } = useCatalogSearchParams();

  const setFilterParams = (patch: Partial<CatalogSearchParams>) => {
    void setParams(patch);
  };

  return (
    <>
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          flex: '0 0 30%',
          maxWidth: 320,
          minWidth: 240,
          alignSelf: 'flex-start',
          position: 'sticky',
          top: 16,
          height: { md: desktopMaxHeight },
          maxHeight: 'calc(100dvh - 32px)',
        }}
      >
        <FilterSheetPanel params={params} onSetParams={setFilterParams} onResetFilters={resetFilters} />
      </Box>

      <Drawer
        anchor="bottom"
        open={mobileOpen}
        onClose={onMobileClose}
        sx={{ display: { xs: 'block', md: 'none' } }}
        slotProps={{
          paper: {
            sx: {
              maxHeight: '85dvh',
              display: 'flex',
              flexDirection: 'column',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              overflowX: 'hidden',
            },
          },
        }}
      >
        <FilterSheetPanel params={params} onSetParams={setFilterParams} onResetFilters={resetFilters} />
      </Drawer>
    </>
  );
}
