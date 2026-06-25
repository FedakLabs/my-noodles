'use client';

import Button from '@mui/material/Button';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { PlayfulEmptyState } from '@/components/playful-empty-state/playful-empty-state';
import { useCatalogSearchParams } from '@/screens/catalog/search-params';
import { pickRandom } from '@/utils/pick-random';

const EMPTY_MESSAGE_KEYS = ['filters', 'wander', 'surprise', 'tweak', 'patience', 'nudge'] as const;

export function CatalogEmptyState() {
  const t = useTranslations('catalog');
  const { appliedKey, clearCatalog } = useCatalogSearchParams();
  const messageKeys = useMemo(() => [...EMPTY_MESSAGE_KEYS], []);
  const messageKey = useMemo(() => {
    void appliedKey;
    return pickRandom(messageKeys);
  }, [messageKeys, appliedKey]);

  return (
    <PlayfulEmptyState
      message={t(`emptyMessages.${messageKey}`)}
      action={
        <Button variant="outlined" size="small" onClick={clearCatalog}>
          {t('clear')}
        </Button>
      }
    />
  );
}
