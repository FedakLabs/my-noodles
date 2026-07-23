'use client';

import Fab from '@mui/material/Fab';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@my-noodles/ui/icons/search.svg';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';

export function CatalogFeedFab() {
  const t = useTranslations('common');
  const theme = useTheme();

  return (
    <Fab
      component={Link}
      href="/feed"
      color="primary"
      aria-label={t('nav.feed')}
      sx={{
        position: 'fixed',
        right: { mobile: 16, desktop: 24 },
        bottom: { mobile: 16, desktop: 24 },
        zIndex: theme.zIndex.speedDial,
      }}
    >
      <SearchIcon aria-hidden size={24} />
    </Fab>
  );
}
