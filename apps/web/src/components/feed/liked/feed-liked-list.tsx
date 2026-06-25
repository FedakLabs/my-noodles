'use client';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { iconStyle } from '@my-noodles/ui';
import CartIcon from '@my-noodles/ui/icons/cart.svg';
import CloseIcon from '@my-noodles/ui/icons/close.svg';
import { useTranslations } from 'next-intl';

import { useFeedLikes, useUnlikeFeedProduct } from '@/api/feed';
import { useCartActions } from '@/hooks/cart';
import { useCurrency } from '@/hooks/currency';

import { FeedLikedListSkeleton } from './feed-liked-list-skeleton';

type FeedLikedListProps = {
  open: boolean;
  onClose: () => void;
  onUnliked: (productId: string) => void;
};

export function FeedLikedList({ open, onClose, onUnliked }: FeedLikedListProps) {
  const t = useTranslations('feed');
  const { formatCurrency } = useCurrency();
  const { addItem } = useCartActions();
  const { feedLikes, feedLikesIsInitialLoad, feedLikesIsFetching } = useFeedLikes({ enabled: open });
  const { unlikeFeedAsync } = useUnlikeFeedProduct();

  const showSkeleton = feedLikesIsInitialLoad || feedLikesIsFetching;
  const likes = showSkeleton ? [] : (feedLikes ?? []);

  const handleUnlike = async (productId: string) => {
    await unlikeFeedAsync(productId);
    onUnliked(productId);
  };

  const handleAddToCart = (product: (typeof likes)[number]) => {
    addItem({
      productId: product.id,
      slug: product.slug,
      title: product.name ?? product.slug,
      priceMinor: product.priceMinor,
      currency: product.currency,
      imageUrl: product.images[0],
    });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: { sx: { width: { xs: '100%', sm: 380 }, display: 'flex', flexDirection: 'column' } },
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          py: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6">{t('likedList.title')}</Typography>
        <IconButton aria-label={t('likedList.close')} onClick={onClose}>
          <CloseIcon aria-hidden style={iconStyle({ size: 20, color: 'inherit' })} />
        </IconButton>
      </Stack>

      {!showSkeleton && likes.length > 0 ? (
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            bgcolor: 'action.hover',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {t('likedList.notice')}
          </Typography>
        </Box>
      ) : null}

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 2.5, py: 2 }} aria-busy={showSkeleton}>
        {showSkeleton ? (
          <FeedLikedListSkeleton />
        ) : likes.length === 0 ? (
          <Typography color="text.secondary">{t('likedList.empty')}</Typography>
        ) : (
          <Stack spacing={2}>
            {likes.map((product) => (
              <Stack key={product.id} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Box
                  component="img"
                  src={product.images[0]}
                  alt={product.name ?? product.slug}
                  sx={{ width: 56, height: 56, borderRadius: 1.5, objectFit: 'cover', flexShrink: 0 }}
                />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                    {product.name ?? product.slug}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatCurrency(product.priceMinor, product.currency)}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center', flexShrink: 0 }}>
                  <Tooltip title={t('likedList.remove')}>
                    <IconButton
                      size="small"
                      aria-label={t('likedList.remove')}
                      onClick={() => void handleUnlike(product.id)}
                    >
                      <CloseIcon aria-hidden style={iconStyle({ size: 18, color: 'inherit' })} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('likedList.addToCart')}>
                    <IconButton
                      size="small"
                      aria-label={t('likedList.addToCart')}
                      onClick={() => handleAddToCart(product)}
                    >
                      <CartIcon aria-hidden style={iconStyle({ size: 18, color: 'inherit' })} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            ))}
          </Stack>
        )}
      </Box>
    </Drawer>
  );
}
