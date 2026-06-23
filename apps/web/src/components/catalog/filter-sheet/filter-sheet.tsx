'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import { alpha, useTheme } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { cardShadow, layoutDisplay } from '@my-noodles/theme';
import { BusyArea, PriceRangeSlider } from '@my-noodles/ui';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { useProductFacets } from '@/api/products';
import {
  type CatalogFacetKey,
  toCatalogFacetsParams,
  useCatalogSearchParams,
} from '@/screens/catalog/search-params';
import { DEFAULT_CURRENCY, formatCurrency, majorToMinor, minorToMajor } from '@/utils/format-currency';

import { FilterFacetGroup } from './filter-facet-group';
import { FilterSheetSkeleton } from './filter-sheet-skeleton';

type FilterSheetPanelLayout = 'drawer' | 'sidebar';

type FilterSheetPanelProps = {
  layout?: FilterSheetPanelLayout;
};

function FilterSheetPanel({ layout = 'drawer' }: FilterSheetPanelProps) {
  const isSidebar = layout === 'sidebar';
  const t = useTranslations('catalog.filters');
  const locale = useLocale();
  const theme = useTheme();
  const { params, setParams, hasFiltersApplied, resetFilters } = useCatalogSearchParams();

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
    void setParams({ [key]: next, page: 1 });
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
          const priceMinMinor = majorToMinor(priceMinMajor, DEFAULT_CURRENCY);
          const priceMaxMinor = majorToMinor(priceMaxMajor, DEFAULT_CURRENCY);

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
        label={t('searching')}
        blockInteraction
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
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{t('title')}</Typography>
            {hasFiltersApplied ? (
              <Button size="small" onClick={resetFilters} disabled={productFacetsIsBusy}>
                {t('reset')}
              </Button>
            ) : null}
          </Stack>

          {panelBody}
        </Stack>
      </BusyArea>
    </Stack>
  );
}

const DESKTOP_FILTER_STICKY_TOP = 80;

type FilterSheetProps = {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

export function FilterSheet({ mobileOpen = false, onMobileClose }: FilterSheetProps) {
  const t = useTranslations('catalog.filters');
  const theme = useTheme();

  return (
    <>
      <Box
        component="aside"
        aria-label={t('title')}
        sx={{
          display: layoutDisplay.desktopOnlyBlock,
          position: 'sticky',
          top: DESKTOP_FILTER_STICKY_TOP,
          alignSelf: 'start',
          maxHeight: `calc(100dvh - ${DESKTOP_FILTER_STICKY_TOP}px - 24px)`,
          overflow: 'hidden',
          borderRadius: `${theme.borderRadius.discovery}px`,
          border: 1,
          borderColor: alpha(theme.palette.divider, 0.9),
          bgcolor: alpha(theme.palette.background.paper, 0.88),
          backdropFilter: 'blur(12px)',
          boxShadow: cardShadow,
        }}
      >
        <Box
          sx={{
            maxHeight: 'inherit',
            overflowY: 'auto',
            overscrollBehavior: 'contain',
          }}
        >
          <FilterSheetPanel layout="sidebar" />
        </Box>
      </Box>

      <Drawer
        anchor="bottom"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        slotProps={{
          root: {
            sx: layoutDisplay.mobileOnlyBlock,
          },
          paper: {
            sx: {
              maxHeight: '85dvh',
              display: 'flex',
              flexDirection: 'column',
              overflowX: 'hidden',
            },
          },
        }}
      >
        <FilterSheetPanel />
      </Drawer>
    </>
  );
}
