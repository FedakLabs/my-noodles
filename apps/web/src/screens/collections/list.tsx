'use client';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { useCollections } from '@/api/collections';
import { PageContainer } from '@/components/layout/page-container';
import { Link } from '@/i18n/navigation';

export function CollectionsScreen() {
  const t = useTranslations('collections');
  const { collections, collectionsIsInitialLoad } = useCollections();

  return (
    <PageContainer>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h4">{t('title')}</Typography>
          <Typography color="text.secondary">{t('description')}</Typography>
        </Stack>

        {collectionsIsInitialLoad ? (
          <Typography color="text.secondary">{t('listLoading')}</Typography>
        ) : collections?.length ? (
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }} useFlexGap>
            {collections.map((collection) => (
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
        ) : (
          <Typography color="text.secondary">{t('listEmpty')}</Typography>
        )}
      </Stack>
    </PageContainer>
  );
}
