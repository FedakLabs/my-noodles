'use client';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { iconStyle, showToast } from '@my-noodles/ui';
import CartIcon from '@my-noodles/ui/icons/cart.svg';
import CloseIcon from '@my-noodles/ui/icons/close.svg';
import { useTranslations } from 'next-intl';

import { useAddCartItem } from '@/api/cart';
import { useFeedLikes, useUnlikeFeedProduct } from '@/api/feed';
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
  const { addCartItemAsync, addCartItemIsAddingProduct } = useAddCartItem();
  const { feedLikes, feedLikesIsInitialLoad, feedLikesIsFetching } = useFeedLikes({ enabled: open });
  const { unlikeFeed, unlikeFeedIsPending, unlikeFeedVariables } = useUnlikeFeedProduct();

  const showSkeleton = feedLikesIsInitialLoad || feedLikesIsFetching;
  const likes = showSkeleton ? [] : (feedLikes ?? []);

  const handleUnlike = (productId: string) => {
    unlikeFeed(productId, {
      onSuccess: () => onUnliked(productId),
      onError: () => showToast.error(t('likedList.removeFailed')),
    });
  };

  const handleAddToCart = async (product: (typeof likes)[number]) => {
    const name = product.name ?? product.slug;
    try {
      await addCartItemAsync({
        productId: product.id,
        slug: product.slug,
        title: name,
        priceMinor: product.priceMinor,
        currency: product.currency,
        imageUrl: product.images[0],
        suppressPanelOpen: true,
      });
      showToast.success(t('likedList.addedToCart', { name }));
    } catch {
      // Cart hook onError shows inventory-specific toast.
    }
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

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 2.5, py: 2 }} aria-busy={showSkeleton}>
        {showSkeleton ? (
          <FeedLikedListSkeleton />
        ) : likes.length === 0 ? (
          <Typography color="text.secondary">{t('likedList.empty')}</Typography>
        ) : (
          <Stack spacing={2}>
            {likes.map((product) => {
              const removing = unlikeFeedIsPending && unlikeFeedVariables === product.id;
              const adding = addCartItemIsAddingProduct(product.id);
              const rowBusy = removing || adding;

              return (
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
                    <IconButton
                      size="small"
                      aria-label={t('likedList.remove')}
                      aria-busy={removing}
                      disabled={rowBusy}
                      onClick={() => handleUnlike(product.id)}
                    >
                      {removing ? (
                        <CircularProgress size={18} color="inherit" aria-hidden />
                      ) : (
                        <CloseIcon aria-hidden style={iconStyle({ size: 18, color: 'inherit' })} />
                      )}
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label={t('likedList.addToCart')}
                      aria-busy={adding}
                      disabled={rowBusy}
                      onClick={() => void handleAddToCart(product)}
                    >
                      {adding ? (
                        <CircularProgress size={18} color="inherit" aria-hidden />
                      ) : (
                        <CartIcon aria-hidden style={iconStyle({ size: 18, color: 'inherit' })} />
                      )}
                    </IconButton>
                  </Stack>
                </Stack>
              );
            })}
          </Stack>
        )}
      </Box>
    </Drawer>
  );
}
