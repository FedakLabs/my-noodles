'use client';

import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { ProductSort } from '@my-noodles/api-clients/storefront';
import { cardShadow } from '@my-noodles/theme';
import ChevronRightIcon from '@my-noodles/ui/icons/chevron-right.svg';
import PlusIcon from '@my-noodles/ui/icons/plus.svg';
import SortIcon from '@my-noodles/ui/icons/sort.svg';
import StarIcon from '@my-noodles/ui/icons/star.svg';
import type { SvgIconProps } from '@my-noodles/ui/types';
import { useTranslations } from 'next-intl';
import { type FC, useId, useMemo, useState } from 'react';

export const DEFAULT_CATALOG_SORT = ProductSort.POPULAR;

type SortOptionKey =
  | 'sortPopular'
  | 'sortNew'
  | 'sortPriceAsc'
  | 'sortPriceDesc'
  | 'sortPopularDescription'
  | 'sortNewDescription'
  | 'sortPriceAscDescription'
  | 'sortPriceDescDescription';

type SortOption = {
  value: ProductSort;
  labelKey: SortOptionKey;
  descriptionKey: SortOptionKey;
  Icon: FC<SvgIconProps>;
  iconTransform?: string;
};

const SORT_OPTIONS: SortOption[] = [
  {
    value: ProductSort.POPULAR,
    labelKey: 'sortPopular',
    descriptionKey: 'sortPopularDescription',
    Icon: StarIcon,
  },
  {
    value: ProductSort.NEW,
    labelKey: 'sortNew',
    descriptionKey: 'sortNewDescription',
    Icon: PlusIcon,
  },
  {
    value: ProductSort.PRICE_ASC,
    labelKey: 'sortPriceAsc',
    descriptionKey: 'sortPriceAscDescription',
    Icon: ChevronRightIcon,
    iconTransform: 'rotate(-90deg)',
  },
  {
    value: ProductSort.PRICE_DESC,
    labelKey: 'sortPriceDesc',
    descriptionKey: 'sortPriceDescDescription',
    Icon: ChevronRightIcon,
    iconTransform: 'rotate(90deg)',
  },
];

type CatalogSortMenuProps = {
  value: ProductSort;
  onChange: (sort: ProductSort) => void;
  disabled?: boolean;
};

export function CatalogSortMenu({ value, onChange, disabled }: CatalogSortMenuProps) {
  const t = useTranslations('catalog.filters');
  const menuId = useId();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = anchorEl != null;

  const activeOption = useMemo(
    () => SORT_OPTIONS.find((option) => option.value === value) ?? SORT_OPTIONS[0]!,
    [value],
  );
  const isNonDefaultSort = value !== DEFAULT_CATALOG_SORT;

  return (
    <>
      <IconButton
        size="small"
        disabled={disabled}
        aria-label={`${t('sort')}: ${t(activeOption.labelKey)}`}
        aria-controls={open ? menuId : undefined}
        aria-haspopup="true"
        aria-expanded={open ? true : undefined}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{
          color: open || isNonDefaultSort ? 'primary.main' : 'inherit',
          p: 0.25,
        }}
      >
        <SortIcon aria-hidden size={20} />
      </IconButton>

      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 280,
              maxWidth: 360,
              mt: 0.75,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              boxShadow: `${cardShadow}, 0 8px 28px rgba(26, 22, 20, 0.14)`,
            },
          },
        }}
      >
        {SORT_OPTIONS.map((option) => {
          const selected = option.value === value;
          const OptionIcon = option.Icon;

          return (
            <MenuItem
              key={option.value}
              selected={selected}
              onClick={() => {
                onChange(option.value);
                setAnchorEl(null);
              }}
              sx={{ alignItems: 'flex-start', gap: 1.5, py: 1.25 }}
            >
              <OptionIcon
                aria-hidden
                size={20}
                style={{
                  marginTop: 2,
                  ...(option.iconTransform ? { transform: option.iconTransform } : {}),
                }}
              />
              <ListItemText
                primary={t(option.labelKey)}
                secondary={t(option.descriptionKey)}
                slotProps={{
                  primary: {
                    sx: {
                      fontWeight: selected ? 600 : 400,
                      color: selected ? 'primary.main' : 'text.primary',
                    },
                  },
                  secondary: {
                    variant: 'body2',
                  },
                }}
              />
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
