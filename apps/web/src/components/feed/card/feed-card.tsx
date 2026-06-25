'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { MediaGallery, type MediaGalleryHandle } from '@my-noodles/ui';
import { useTranslations } from 'next-intl';
import type { RefObject } from 'react';

import type { FeedItemDto } from '@/api/feed';
import { feedCardSurfaceSx } from '@/components/feed/feed-chrome';
import { useCurrency } from '@/hooks/currency';
import type { FeedTagDimension } from '@/hooks/feed';

import { FeedCardActionBar } from './feed-card-action-bar';
import { FeedCardDetails } from './feed-card-details';
import { feedGalleryCarouselOptions } from './feed-gallery-carousel';
import { toFeedMediaItems } from './feed-media';

type FeedCardProps = {
  item: FeedItemDto;
  onAddTag: (type: FeedTagDimension, value: string, label: string) => void;
  detailsOpen: boolean;
  onOpenDetails: () => void;
  onCloseDetails: () => void;
  mediaGalleryRef?: RefObject<MediaGalleryHandle | null>;
};

type HashtagChip = {
  type: FeedTagDimension;
  slug: string;
  label: string;
};

function buildHashtags(item: FeedItemDto): HashtagChip[] {
  const chips: HashtagChip[] = [
    { type: 'category', slug: item.category.slug, label: item.category.name ?? item.category.slug },
    { type: 'country', slug: item.country.slug, label: item.country.name ?? item.country.slug },
  ];

  if (item.brand) {
    chips.push({ type: 'brand', slug: item.brand.slug, label: item.brand.name ?? item.brand.slug });
  }

  return chips;
}

export function FeedCard({
  item,
  onAddTag,
  detailsOpen,
  onOpenDetails,
  onCloseDetails,
  mediaGalleryRef,
}: FeedCardProps) {
  const t = useTranslations('feed');
  const { formatCurrency } = useCurrency();

  const mediaItems = toFeedMediaItems(item);
  const hashtags = buildHashtags(item);

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
      <Box sx={{ position: 'absolute', inset: 0 }}>
        <MediaGallery
          fill
          items={mediaItems}
          carouselOptions={feedGalleryCarouselOptions}
          slideTouchAction="pan-x"
          mediaRef={mediaGalleryRef}
          labels={{
            gallery: t('media.gallery'),
            slide: (index, total) => t('media.slide', { index, total }),
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
        <Stack spacing={1.25} sx={{ pointerEvents: detailsOpen ? 'none' : 'auto' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
            {item.name ?? item.slug}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600 }}>
            {formatCurrency(item.priceMinor, item.currency)}
          </Typography>

          <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap' }}>
            {hashtags.map((chip) => (
              <Chip
                key={`${chip.type}-${chip.slug}`}
                label={`#${chip.label}`}
                size="small"
                onClick={() => onAddTag(chip.type, chip.slug, chip.label)}
                sx={{
                  color: '#fff',
                  bgcolor: 'rgba(255,255,255,0.16)',
                  backdropFilter: 'blur(4px)',
                  fontWeight: 600,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' },
                }}
              />
            ))}
          </Stack>

          <FeedCardActionBar
            item={item}
            detailsOpen={detailsOpen}
            onToggleDetails={detailsOpen ? onCloseDetails : onOpenDetails}
          />
        </Stack>
      </Box>

      <FeedCardDetails item={item} open={detailsOpen} onClose={onCloseDetails} />
    </Box>
  );
}
