'use client';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { useCollections } from '@/api/collections';
import { PageContainer } from '@/components/layout/page-container';
import { Link } from '@/i18n/navigation';

export function HomeScreen() {
  const t = useTranslations('home');
  const { collections, collectionsIsInitialLoad } = useCollections();

  return (
    <PageContainer>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h3">{t('title')}</Typography>
          <Typography color="text.secondary">{t('description')}</Typography>
        </Stack>

        <Button component={Link} href="/catalog" variant="contained" size="large">
          {t('ctaCatalog')}
        </Button>

        <Stack spacing={1}>
          <Typography variant="h5">{t('collectionsTitle')}</Typography>
          {collectionsIsInitialLoad ? (
            <Typography color="text.secondary">{t('loading')}</Typography>
          ) : (
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }} useFlexGap>
              {collections?.map((collection) => (
                <Button
                  key={collection.slug}
                  component={Link}
                  href={`/collections/${collection.slug}`}
                  variant="outlined"
                >
                  {collection.name}
                </Button>
              ))}
            </Stack>
          )}
        </Stack>
      </Stack>
    </PageContainer>
  );
}
