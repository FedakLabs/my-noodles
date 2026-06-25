'use client';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { useTranslations } from 'next-intl';

import { useCurrency } from '@/hooks/currency';
import { useCatalogSearchParams } from '@/screens/catalog/search-params';

export function FilterChips() {
  const t = useTranslations('catalog.filters');
  const { formatCurrency } = useCurrency();
  const { params: filters, setParams } = useCatalogSearchParams();

  const chips: { key: string; label: string; onDelete: () => void }[] = [];

  filters.category.forEach((value) => {
    chips.push({
      key: `category-${value}`,
      label: `${t('category')}: ${value}`,
      onDelete: () => {
        void setParams({ category: filters.category.filter((item) => item !== value), page: 1 });
      },
    });
  });

  filters.country.forEach((value) => {
    chips.push({
      key: `country-${value}`,
      label: `${t('country')}: ${value}`,
      onDelete: () => {
        void setParams({ country: filters.country.filter((item) => item !== value), page: 1 });
      },
    });
  });

  filters.brand.forEach((value) => {
    chips.push({
      key: `brand-${value}`,
      label: `${t('brand')}: ${value}`,
      onDelete: () => {
        void setParams({ brand: filters.brand.filter((item) => item !== value), page: 1 });
      },
    });
  });

  if (filters.priceMin != null) {
    chips.push({
      key: 'priceMin',
      label: `${t('priceMin')}: ${formatCurrency(filters.priceMin)}`,
      onDelete: () => {
        void setParams({ priceMin: null, page: 1 });
      },
    });
  }

  if (filters.priceMax != null) {
    chips.push({
      key: 'priceMax',
      label: `${t('priceMax')}: ${formatCurrency(filters.priceMax)}`,
      onDelete: () => {
        void setParams({ priceMax: null, page: 1 });
      },
    });
  }

  if (filters.isTriedByUs) {
    chips.push({
      key: 'isTriedByUs',
      label: t('triedByUs'),
      onDelete: () => {
        void setParams({ isTriedByUs: null, page: 1 });
      },
    });
  }

  if (filters.inStock) {
    chips.push({
      key: 'inStock',
      label: t('inStock'),
      onDelete: () => {
        void setParams({ inStock: null, page: 1 });
      },
    });
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }} useFlexGap>
      {chips.map((chip) => (
        <Chip key={chip.key} label={chip.label} onDelete={chip.onDelete} size="small" />
      ))}
    </Stack>
  );
}
