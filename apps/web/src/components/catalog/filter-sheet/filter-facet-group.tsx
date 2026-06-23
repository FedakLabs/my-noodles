'use client';

import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ProductFacetOptionDto } from '@my-noodles/api-clients/storefront';
import { usePrefersReducedMotion } from '@my-noodles/ui';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { isFilterOptionDisabled } from './filter-options';

const INITIAL_VISIBLE_COUNT = 5;

type FilterFacetGroupProps = {
  title: string;
  options: ProductFacetOptionDto[];
  selectedValues: string[];
  onToggle: (value: string) => void;
};

function splitFacetOptions(
  options: ProductFacetOptionDto[],
  selectedValues: string[],
  limit: number,
): {
  head: ProductFacetOptionDto[];
  tail: ProductFacetOptionDto[];
  selectedTail: ProductFacetOptionDto[];
  hiddenTail: ProductFacetOptionDto[];
} {
  const head = options.slice(0, limit);
  const tail = options.slice(limit);
  const selectedTail = tail.filter((option) => selectedValues.includes(option.value));
  const hiddenTail = tail.filter((option) => !selectedValues.includes(option.value));

  return { head, tail, selectedTail, hiddenTail };
}

export function FilterFacetGroup({ title, options, selectedValues, onToggle }: FilterFacetGroupProps) {
  const t = useTranslations('catalog.filters');
  const prefersReducedMotion = usePrefersReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const { head, tail, selectedTail, hiddenTail } = useMemo(
    () => splitFacetOptions(options, selectedValues, INITIAL_VISIBLE_COUNT),
    [options, selectedValues],
  );
  const hasMore = tail.length > 0;
  const collapseTimeout = prefersReducedMotion ? 0 : undefined;

  if (options.length === 0) {
    return null;
  }

  const renderOption = (option: ProductFacetOptionDto) => {
    const selected = selectedValues.includes(option.value);
    const disabled = isFilterOptionDisabled(option, selectedValues);

    return (
      <FormControlLabel
        key={option.value}
        sx={{ color: disabled ? 'text.disabled' : 'text.primary' }}
        control={<Checkbox checked={selected} disabled={disabled} onChange={() => onToggle(option.value)} />}
        label={`${option.label ?? option.value} (${option.count})`}
      />
    );
  };

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">{title}</Typography>
      <FormGroup>
        {head.map(renderOption)}
        {!expanded ? selectedTail.map(renderOption) : null}
        {hasMore ? (
          <Collapse in={expanded} timeout={collapseTimeout} sx={{ width: '100%' }}>
            <Stack component="div" sx={{ width: '100%' }}>
              {(expanded ? tail : hiddenTail).map(renderOption)}
            </Stack>
          </Collapse>
        ) : null}
      </FormGroup>
      {hasMore ? (
        <Button
          variant="text"
          size="small"
          onClick={() => setExpanded((current) => !current)}
          sx={{ alignSelf: 'flex-start', minWidth: 0, px: 0.5 }}
        >
          {expanded ? t('showLess') : t('showAll', { count: options.length })}
        </Button>
      ) : null}
    </Stack>
  );
}
