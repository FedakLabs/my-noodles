'use client';

import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { iconStyle } from '@my-noodles/ui';
import CartIcon from '@my-noodles/ui/icons/cart.svg';
import CatalogIcon from '@my-noodles/ui/icons/catalog.svg';
import { useTranslations } from 'next-intl';

import { HeartIcon } from '@/components/feed/action-rail/feed-icons';
import { feedMutedTextSx, feedOutlinedButtonSx, feedSubtleChipSx } from '@/components/feed/feed-chrome';
import { useCartActions } from '@/hooks/cart';
import { type FeedTagChip, feedTagLabel } from '@/hooks/feed';
import { Link } from '@/i18n/navigation';

const endButtonIconSx = iconStyle({ size: 20, color: 'inherit' });

type FeedEndContentProps = {
  activeTags: FeedTagChip[];
  tagLabels: Record<string, string>;
  onRemoveTag: (chip: FeedTagChip) => void;
  onOpenSaved: () => void;
  onReshuffle: () => void;
  reshuffling: boolean;
};

export function FeedEndContent({
  activeTags,
  tagLabels,
  onRemoveTag,
  onOpenSaved,
  onReshuffle,
  reshuffling,
}: FeedEndContentProps) {
  const t = useTranslations('feed');
  const theme = useTheme();
  const { openPanel: openCartPanel } = useCartActions();
  const hasTags = activeTags.length > 0;

  return (
    <Stack spacing={2.5} sx={{ alignItems: 'center', maxWidth: 400, width: '100%' }}>
      <Typography variant="h5" sx={{ color: 'common.white', fontWeight: 700, lineHeight: 1.25 }}>
        {t('end.title')}
      </Typography>

      {hasTags ? (
        <Typography variant="body1" sx={feedMutedTextSx(theme)}>
          {t('end.tagsHint')}
        </Typography>
      ) : (
        <Typography variant="body1" sx={feedMutedTextSx(theme)}>
          {t('end.body')}
        </Typography>
      )}

      {hasTags ? (
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
          {activeTags.map((chip) => (
            <Chip
              key={`${chip.type}-${chip.value}`}
              label={`#${feedTagLabel(tagLabels, chip)}`}
              data-feed-no-swipe
              onDelete={() => onRemoveTag(chip)}
              sx={feedSubtleChipSx(theme)}
            />
          ))}
        </Stack>
      ) : null}

      <Stack spacing={1.25} sx={{ width: '100%', pt: 0.5 }}>
        <Button
          type="button"
          variant="contained"
          fullWidth
          data-feed-no-swipe
          onClick={onReshuffle}
          disabled={reshuffling}
        >
          {reshuffling ? t('end.tryingAgain') : t('end.tryAgain')}
        </Button>
        <Button
          component={Link}
          href="/catalog"
          variant="outlined"
          fullWidth
          data-feed-no-swipe
          startIcon={<CatalogIcon aria-hidden style={endButtonIconSx} />}
          sx={feedOutlinedButtonSx(theme)}
        >
          {t('end.browseCatalog')}
        </Button>
        <Button
          type="button"
          variant="outlined"
          fullWidth
          data-feed-no-swipe
          startIcon={<HeartIcon size={20} filled />}
          onClick={onOpenSaved}
          sx={feedOutlinedButtonSx(theme)}
        >
          {t('end.viewSaved')}
        </Button>
        <Button
          type="button"
          variant="outlined"
          fullWidth
          data-feed-no-swipe
          startIcon={<CartIcon aria-hidden style={endButtonIconSx} />}
          onClick={openCartPanel}
          sx={feedOutlinedButtonSx(theme)}
        >
          {t('end.viewCart')}
        </Button>
      </Stack>
    </Stack>
  );
}
