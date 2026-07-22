'use client';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { SectionReveal } from '../../_shared';

export function TrustRibbon() {
  const t = useTranslations('home.variants.b');
  const chips = [t('trustHonesty'), t('trustTried'), t('trustCurated')];

  return (
    <SectionReveal sx={{ px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
      <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
        <Typography variant="h5" component="h2">
          {t('trustTitle')}
        </Typography>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
          {chips.map((label) => (
            <Chip key={label} label={label} color="primary" variant="outlined" />
          ))}
        </Stack>
      </Stack>
    </SectionReveal>
  );
}
