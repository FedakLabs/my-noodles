'use client';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import type { SelectProps } from '@mui/material/Select';
import Select from '@mui/material/Select';
import { ProductSort } from '@my-noodles/api-clients/storefront';
import { useTranslations } from 'next-intl';

type CatalogSortSelectProps = {
  value: ProductSort;
  onChange: (sort: ProductSort) => void;
  size?: SelectProps['size'];
  disabled?: boolean;
  labelId?: string;
};

export function CatalogSortSelect({
  value,
  onChange,
  size = 'small',
  disabled,
  labelId = 'catalog-sort-label',
}: CatalogSortSelectProps) {
  const t = useTranslations('catalog.filters');

  return (
    <FormControl size={size} sx={{ minWidth: 160, flexShrink: 0 }}>
      <InputLabel id={labelId}>{t('sort')}</InputLabel>
      <Select
        labelId={labelId}
        label={t('sort')}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        <MenuItem value={ProductSort.POPULAR}>{t('sortPopular')}</MenuItem>
        <MenuItem value={ProductSort.NEW}>{t('sortNew')}</MenuItem>
        <MenuItem value={ProductSort.PRICE_ASC}>{t('sortPriceAsc')}</MenuItem>
        <MenuItem value={ProductSort.PRICE_DESC}>{t('sortPriceDesc')}</MenuItem>
      </Select>
    </FormControl>
  );
}
