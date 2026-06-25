'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import type { FeedItemDto } from '@/api/feed';
import { useProductDetail } from '@/api/products';
import {
  feedDetailsBodyTextSx,
  feedDetailsGradientSx,
  feedDetailsMetaTextSx,
  feedDetailsTextShadowSx,
} from '@/components/feed/feed-chrome';
import { useCurrency } from '@/hooks/currency';

import { FeedCardActionBar } from './feed-card-action-bar';
import { FeedCardDetailsSkeleton } from './feed-card-details-skeleton';

type FeedCardDetailsProps = {
  item: FeedItemDto;
  open: boolean;
  onClose: () => void;
};

/**
 * Bottom drawer that slides up *within* the reel card. Height follows content up to 70%
 * of the card; only the copy scrolls — actions stay pinned at the bottom.
 */
export function FeedCardDetails({ item, open, onClose }: FeedCardDetailsProps) {
  const { formatCurrency } = useCurrency();
  const theme = useTheme();
  const { product, productIsInitialLoad } = useProductDetail(item.slug, { enabled: open });

  return (
    <Box
      aria-hidden={!open}
      data-feed-no-swipe
      onClick={(event) => event.stopPropagation()}
      sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        maxHeight: '70%',
        display: 'flex',
        flexDirection: 'column',
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 320ms cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: open ? 'auto' : 'none',
        zIndex: 2,
        ...feedDetailsGradientSx(theme),
      }}
    >
      <Stack spacing={1.25} sx={{ minHeight: 0, maxHeight: '100%', overflow: 'hidden' }}>
        <Box
          data-feed-scroll-host
          sx={{
            flex: '1 1 auto',
            minHeight: 0,
            overflowY: 'auto',
            px: { xs: 2, sm: 2.5 },
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <Stack spacing={1.25} sx={feedDetailsTextShadowSx(theme)}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {item.name ?? item.slug}
            </Typography>
            <Typography variant="body2" sx={feedDetailsMetaTextSx(theme)}>
              {[item.country.name, item.category.name].filter(Boolean).join(' · ')}
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {formatCurrency(item.priceMinor, item.currency)}
            </Typography>

            {productIsInitialLoad ? (
              <FeedCardDetailsSkeleton />
            ) : (
              <>
                {product?.description ? (
                  <Typography variant="body2" sx={feedDetailsBodyTextSx(theme)}>
                    {product.description}
                  </Typography>
                ) : null}
                {product?.forWhom ? (
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    {product.forWhom}
                  </Typography>
                ) : null}
                {product?.story ? (
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    {product.story}
                  </Typography>
                ) : null}
              </>
            )}
          </Stack>
        </Box>

        <FeedCardActionBar
          item={item}
          detailsOpen
          onToggleDetails={onClose}
          sx={{ flexShrink: 0, px: { xs: 2, sm: 2.5 }, pb: { xs: 2.5, sm: 3 } }}
        />
      </Stack>
    </Box>
  );
}
