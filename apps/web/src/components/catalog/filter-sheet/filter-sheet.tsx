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
import { useMemo, useState } from 'react';

import { useProductFacets } from '@/api/products';
import { SmoothBusyVeil } from '@/components/navigation/smooth-busy-veil';
import { useSmoothBusyState } from '@/hooks/smooth';
import {
  type CatalogFilterParams,
  type CatalogSearchParams,
  DEFAULT_CATALOG_FILTER_PARAMS,
  toCatalogFacetsParams,
  useCatalogSearchParams,
} from '@/screens/catalog/search-params';
import { DEFAULT_CURRENCY, formatCurrency, majorToMinor, minorToMajor } from '@/utils/format-currency';

import { isFilterOptionDisabled, sortFilterOptionsByAppliedUrl } from './filter-options';
import { FilterSheetSkeleton } from './filter-sheet-skeleton';

function draftFromApplied(applied: CatalogSearchParams): CatalogFilterParams {
  return {
    collection: applied.collection,
    category: applied.category,
    country: applied.country,
    brand: applied.brand,
    priceMin: applied.priceMin,
    priceMax: applied.priceMax,
    sort: applied.sort,
    isTriedByUs: applied.isTriedByUs,
    inStock: applied.inStock,
  };
}

type FilterSheetPanelProps = {
  applied: CatalogSearchParams;
  onApplyFilters: (draft: CatalogFilterParams) => void;
  onResetFilters: () => void;
  onApplied?: () => void;
};

function FilterSheetPanel({ applied, onApplyFilters, onResetFilters, onApplied }: FilterSheetPanelProps) {
  const t = useTranslations('catalog.filters');
  const locale = useLocale();
  const [draft, setDraft] = useState<CatalogFilterParams>(() => draftFromApplied(applied));

  const facetsParams = useMemo(() => toCatalogFacetsParams(draft), [draft]);
  const {
    productFacets,
    productFacetsIsInitialLoad,
    productFacetsIsLoadFailed,
    productFacetsIsBusy,
    productFacetsIsRefetching,
    productFacetsRefetch,
  } = useProductFacets(facetsParams);
  const facets = productFacets?.facets;
  const previewTotal = productFacets?.total ?? 0;

  const categoryOptions = useMemo(
    () => sortFilterOptionsByAppliedUrl(facets?.category ?? [], applied.category),
    [applied.category, facets?.category],
  );
  const countryOptions = useMemo(
    () => sortFilterOptionsByAppliedUrl(facets?.country ?? [], applied.country),
    [applied.country, facets?.country],
  );
  const isEmpty = Boolean(productFacets) && categoryOptions.length === 0 && countryOptions.length === 0;
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
      minorToMajor(draft.priceMin ?? priceBoundsMinor.min, DEFAULT_CURRENCY),
      minorToMajor(draft.priceMax ?? priceBoundsMinor.max, DEFAULT_CURRENCY),
    ],
    [draft.priceMax, draft.priceMin, priceBoundsMinor.max, priceBoundsMinor.min],
  );

  const formatPriceLabel = (amountMajor: number) =>
    formatCurrency(majorToMinor(amountMajor, DEFAULT_CURRENCY), DEFAULT_CURRENCY, locale);

  const toggleArrayValue = (key: 'category' | 'country', value: string) => {
    const current = draft[key];
    const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
    setDraft({ ...draft, [key]: next });
  };

  const applyDraft = () => {
    onApplyFilters({ ...draft, sort: applied.sort });
    onApplied?.();
  };

  const resetFilters = () => {
    setDraft({ ...DEFAULT_CATALOG_FILTER_PARAMS, sort: applied.sort });
    onResetFilters();
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
            const selected = draft.category.includes(option.value);
            const disabled = isFilterOptionDisabled(option, draft.category);
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
            const selected = draft.country.includes(option.value);
            const disabled = isFilterOptionDisabled(option, draft.country);
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

      <PriceRangeSlider
        min={priceBoundsMajor.min}
        max={priceBoundsMajor.max}
        value={priceValueMajor}
        valueLabelFormat={formatPriceLabel}
        onCommit={([priceMinMajor, priceMaxMajor]) => {
          const priceMinMinor = majorToMinor(priceMinMajor, DEFAULT_CURRENCY);
          const priceMaxMinor = majorToMinor(priceMaxMajor, DEFAULT_CURRENCY);

          setDraft({
            ...draft,
            priceMin: priceMinMinor <= priceBoundsMinor.min ? null : priceMinMinor,
            priceMax: priceMaxMinor >= priceBoundsMinor.max ? null : priceMaxMinor,
          });
        }}
        label={t('price')}
        minLabel={t('priceMin')}
        maxLabel={t('priceMax')}
      />

      <FormControlLabel
        control={
          <Switch
            checked={Boolean(draft.isTriedByUs)}
            disabled={!draft.isTriedByUs && (facets?.isTriedByUs ?? 0) === 0}
            onChange={(_, checked) => setDraft({ ...draft, isTriedByUs: checked || null })}
          />
        }
        label={t('triedByUs')}
      />

      <FormControlLabel
        control={
          <Switch
            checked={Boolean(draft.inStock)}
            disabled={!draft.inStock && (facets?.inStock ?? 0) === 0}
            onChange={(_, checked) => setDraft({ ...draft, inStock: checked || null })}
          />
        }
        label={t('inStock')}
      />
    </>
  );

  return (
    <Stack
      spacing={3}
      sx={{
        p: 2,
        minWidth: 0,
        overflowX: 'hidden',
        position: 'relative',
        opacity: refetchVeilActive ? 0.9 : 1,
        pointerEvents: refetchVeilActive ? 'none' : 'auto',
        transition: `opacity ${transitionMs}ms ${transitionEasing}`,
      }}
      aria-busy={productFacetsIsBusy ? true : undefined}
      aria-label={productFacetsIsInitialLoad ? t('loading') : undefined}
    >
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">{t('title')}</Typography>
        <Button size="small" onClick={resetFilters} disabled={productFacetsIsBusy}>
          {t('reset')}
        </Button>
      </Stack>

      {panelBody}

      {!productFacetsIsInitialLoad && !productFacetsIsLoadFailed ? (
        <Button
          variant="contained"
          onClick={applyDraft}
          disabled={productFacetsIsBusy || previewTotal === 0 || isEmpty}
        >
          {productFacetsIsBusy ? t('searching') : t('showResults', { count: previewTotal })}
        </Button>
      ) : null}

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
  mobileOpen?: boolean;
  mobileDraftKey?: number;
  onMobileClose?: () => void;
};

export function FilterSheet({ mobileOpen = false, mobileDraftKey = 0, onMobileClose }: FilterSheetProps) {
  const {
    params: applied,
    appliedKey: filtersAppliedKey,
    applyFilters,
    resetFilters,
  } = useCatalogSearchParams();

  return (
    <>
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          flex: '0 0 30%',
          maxWidth: 320,
          minWidth: 240,
        }}
      >
        <FilterSheetPanel
          key={filtersAppliedKey}
          applied={applied}
          onApplyFilters={applyFilters}
          onResetFilters={resetFilters}
        />
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
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              overflowX: 'hidden',
            },
          },
        }}
      >
        <FilterSheetPanel
          key={`${filtersAppliedKey}-${mobileDraftKey}`}
          applied={applied}
          onApplyFilters={applyFilters}
          onResetFilters={resetFilters}
          onApplied={onMobileClose}
        />
      </Drawer>
    </>
  );
}
