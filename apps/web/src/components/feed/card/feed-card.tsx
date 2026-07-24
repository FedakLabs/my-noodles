'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { MediaGallery, type MediaGalleryHandle } from '@my-noodles/ui';
import CloseIcon from '@my-noodles/ui/icons/close.svg';
import { useTranslations } from 'next-intl';
import type { RefObject } from 'react';

import type { Product } from '@/api/feed';
import { FeedActionRail, type FeedCardControlsProps } from '@/components/feed/action-rail/feed-action-rail';
import { feedActiveChipSx, feedCardSurfaceSx, feedSubtleChipSx } from '@/components/feed/feed-chrome';
import { feedGalleryCarouselOptions } from '@/components/feed/feed-gallery-carousel-options';
import { useCurrency } from '@/hooks/currency';
import type { FeedTagChip, FeedTagDimension } from '@/hooks/feed';

import { FeedCardActionBar } from './feed-card-action-bar';
import { FeedCardDetails } from './feed-card-details';
import { FeedCardInteractive } from './feed-card-interactive';
import { toFeedMediaItems } from './feed-media';

type FeedCardProps = {
  item: Product;
  onAddTag: (type: FeedTagDimension, value: string, label: string) => void;
  onRemoveTag: (chip: FeedTagChip) => void;
  activeTags: FeedTagChip[];
  detailsOpen: boolean;
  onOpenDetails: () => void;
  onCloseDetails: () => void;
  mediaGalleryRef?: RefObject<MediaGalleryHandle | null>;
  controls?: FeedCardControlsProps;
};

type HashtagChip = {
  type: FeedTagDimension;
  slug: string;
  label: string;
};

function buildHashtags(item: Product): HashtagChip[] {
  const chips: HashtagChip[] = [
    { type: 'category', slug: item.category.slug, label: item.category.name ?? item.category.slug },
    { type: 'country', slug: item.country.slug, label: item.country.name ?? item.country.slug },
  ];

  if (item.brand) {
    chips.push({ type: 'brand', slug: item.brand.slug, label: item.brand.name ?? item.brand.slug });
  }

  if (item.seller) {
    chips.push({
      type: 'seller',
      slug: item.seller.slug,
      label: item.seller.name ?? item.seller.slug,
    });
  }

  return chips;
}

function isTagActive(activeTags: FeedTagChip[], chip: HashtagChip): boolean {
  return activeTags.some((tag) => tag.type === chip.type && tag.value === chip.slug);
}

export function FeedCard({
  item,
  onAddTag,
  onRemoveTag,
  activeTags,
  detailsOpen,
  onOpenDetails,
  onCloseDetails,
  mediaGalleryRef,
  controls,
}: FeedCardProps) {
  const t = useTranslations('feed');
  const theme = useTheme();
  const isCompactFeed = useMediaQuery(theme.breakpoints.down('sm'));
  const { formatCurrency } = useCurrency();

  const mediaItems = toFeedMediaItems(item);
  const hashtags = buildHashtags(item);
  const actionRail =
    controls && !detailsOpen && isCompactFeed ? <FeedActionRail item={item} {...controls} /> : null;

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        borderRadius: { xs: 0, sm: 3 },
        ...feedCardSurfaceSx,
      }}
    >
      <Box data-feed-media-gallery sx={{ position: 'absolute', inset: 0 }}>
        <MediaGallery
          fill
          items={mediaItems}
          carouselOptions={feedGalleryCarouselOptions}
          slideTouchAction="pan-x"
          progressSegments="top"
          mediaRef={mediaGalleryRef}
          labels={{
            gallery: t('media.gallery'),
            slide: (index, total) => t('media.slide', { index, total }),
            previousSlide: t('media.previousSlide'),
            nextSlide: t('media.nextSlide'),
            video: {
              play: t('media.playVideo'),
              pause: t('media.pauseVideo'),
              mute: t('media.muteVideo'),
              unmute: t('media.unmuteVideo'),
            },
          }}
        />
      </Box>

      <Box
        aria-hidden={detailsOpen}
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          px: { xs: 2, sm: 2.5 },
          pt: 7,
          pb: { xs: 2.5, sm: 3 },
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0) 100%)',
          opacity: detailsOpen ? 0 : 1,
          visibility: detailsOpen ? 'hidden' : 'visible',
          pointerEvents: 'none',
          transition: detailsOpen
            ? 'opacity 100ms cubic-bezier(0.4, 0, 0.2, 1), visibility 0ms linear 100ms'
            : 'opacity 100ms cubic-bezier(0.4, 0, 0.2, 1), visibility 0ms linear 0ms',
        }}
      >
        <Stack
          direction={actionRail ? 'row' : 'column'}
          spacing={actionRail ? 1 : 1.25}
          sx={{
            alignItems: actionRail ? 'flex-end' : undefined,
            width: '100%',
          }}
        >
          <Stack spacing={1.25} sx={{ flex: actionRail ? 1 : undefined, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'common.white', lineHeight: 1.2 }}>
              {item.name ?? item.slug}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.82)' }}>
              {item.seller.name ?? item.seller.slug}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'common.white', fontWeight: 600 }}>
              {formatCurrency(item.priceMinor, item.currency)}
            </Typography>

            <FeedCardInteractive sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {hashtags.map((chip) => {
                const active = isTagActive(activeTags, chip);
                const tagChip: FeedTagChip = { type: chip.type, value: chip.slug };

                return (
                  <Chip
                    key={`${chip.type}-${chip.slug}`}
                    label={`#${chip.label}`}
                    size="small"
                    data-feed-no-swipe
                    onClick={() => {
                      if (active) {
                        onRemoveTag(tagChip);
                        return;
                      }
                      onAddTag(chip.type, chip.slug, chip.label);
                    }}
                    onDelete={active ? () => onRemoveTag(tagChip) : undefined}
                    deleteIcon={active ? <CloseIcon aria-hidden size={14} /> : undefined}
                    sx={{
                      ...(active ? feedActiveChipSx(theme) : feedSubtleChipSx(theme)),
                      backdropFilter: 'blur(4px)',
                    }}
                  />
                );
              })}
            </FeedCardInteractive>

            <FeedCardInteractive>
              <FeedCardActionBar
                item={item}
                detailsOpen={detailsOpen}
                onToggleDetails={detailsOpen ? onCloseDetails : onOpenDetails}
              />
            </FeedCardInteractive>
          </Stack>

          {actionRail ? <FeedCardInteractive>{actionRail}</FeedCardInteractive> : null}
        </Stack>
      </Box>

      <FeedCardDetails item={item} open={detailsOpen} onClose={onCloseDetails} />
    </Box>
  );
}
