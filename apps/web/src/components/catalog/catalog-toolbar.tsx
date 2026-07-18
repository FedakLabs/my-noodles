'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ProductSort } from '@my-noodles/api-clients/storefront';
import { layoutDisplay } from '@my-noodles/theme';
import {
  BusyArea,
  type BusyAreaState,
  iconStyle,
  resolveSmoothMotionTokens,
  StableLinearProgress,
} from '@my-noodles/ui';
import FilterIcon from '@my-noodles/ui/icons/filter.svg';
import { useTranslations } from 'next-intl';

import { CatalogViewModeMenu } from '@/components/catalog-view-mode';
import { CatalogSortMenu } from '@/components/catalog/catalog-sort-menu';

export type CatalogToolbarPagination = {
  page: number;
  pageCount: number;
};

export type CatalogTitleProps = {
  title?: string;
  showClear?: boolean;
  onClear?: () => void;
};

export function CatalogTitle({ title, showClear, onClear }: CatalogTitleProps) {
  const t = useTranslations('catalog');

  return (
    <Stack
      direction="row"
      spacing={1.5}
      useFlexGap
      sx={{ alignItems: 'center', minWidth: 0, flexWrap: 'wrap' }}
    >
      {title ? (
        <Typography variant="h4" sx={{ flexShrink: 0 }}>
          {title}
        </Typography>
      ) : null}
      {showClear && onClear ? (
        <Button size="small" onClick={onClear} sx={{ flexShrink: 0 }}>
          {t('clear')}
        </Button>
      ) : null}
    </Stack>
  );
}

export type CatalogToolbarControlsProps = {
  statusText: string;
  searchingText: string;
  showSearchingText: boolean;
  pagination?: CatalogToolbarPagination;
  progressLabel: string;
  timing: BusyAreaState;
  isBusy: boolean;
  sort?: ProductSort;
  onSortChange?: (sort: ProductSort) => void;
  onOpenFilters?: () => void;
  hasFiltersApplied?: boolean;
};

export function CatalogToolbarControls({
  statusText,
  searchingText,
  showSearchingText,
  pagination,
  progressLabel,
  timing,
  isBusy,
  sort,
  onSortChange,
  onOpenFilters,
  hasFiltersApplied,
}: CatalogToolbarControlsProps) {
  const t = useTranslations('catalog');
  const showSort = sort != null && onSortChange != null;
  const showPageStatus = pagination != null;

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
        minWidth: 0,
        color: 'text.secondary',
      }}
    >
      <BusyArea timing={timing} dim scrim={false} label={progressLabel}>
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ alignItems: 'center', minWidth: 0, flexWrap: 'wrap', color: 'inherit' }}
        >
          <Typography variant="body2" sx={{ minWidth: 0, color: 'inherit' }}>
            {showSearchingText ? searchingText : statusText}
          </Typography>
          {!showSearchingText && showPageStatus ? (
            <>
              <Divider orientation="vertical" flexItem sx={{ alignSelf: 'center', height: 20 }} />
              <Typography variant="body2" sx={{ color: 'inherit', flexShrink: 0 }}>
                {t('pageOfTotal', { page: pagination.page, pageCount: pagination.pageCount })}
              </Typography>
            </>
          ) : null}
        </Stack>
      </BusyArea>

      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', flexShrink: 0 }}>
        {onOpenFilters ? (
          <Box sx={{ display: layoutDisplay.mobileOnlyFlex, alignItems: 'center' }}>
            <IconButton
              size="small"
              disabled={isBusy}
              aria-label={t('openFilters')}
              onClick={onOpenFilters}
              sx={{ color: hasFiltersApplied ? 'primary.main' : 'inherit', p: 0.25 }}
            >
              <FilterIcon aria-hidden style={iconStyle({ size: 20, color: 'inherit' })} />
            </IconButton>
          </Box>
        ) : null}
        {showSort ? <CatalogSortMenu value={sort} onChange={onSortChange} disabled={isBusy} /> : null}
        {showSort ? (
          <Divider orientation="vertical" flexItem sx={{ alignSelf: 'center', height: 20 }} />
        ) : null}
        <CatalogViewModeMenu disabled={isBusy} />
      </Stack>
    </Stack>
  );
}

export type CatalogToolbarProgressProps = {
  progressActive: boolean;
  progressLabel: string;
};

export function CatalogToolbarProgress({ progressActive, progressLabel }: CatalogToolbarProgressProps) {
  const progressMotion = resolveSmoothMotionTokens();

  return (
    <StableLinearProgress
      active={progressActive}
      transitionMs={progressMotion.transitionMs}
      transitionEasing={progressMotion.transitionEasing}
      aria-label={progressLabel}
    />
  );
}
