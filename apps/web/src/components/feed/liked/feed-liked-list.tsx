'use client';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { layoutDisplay } from '@my-noodles/theme';
import { showToast } from '@my-noodles/ui';
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

type LikedProduct = NonNullable<ReturnType<typeof useFeedLikes>['feedLikes']>[number];

const drawerPaperSx = {
  mobile: {
    height: '80dvh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  desktop: {
    width: '100%',
    maxWidth: 380,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
} as const;

type LikedListPanelProps = {
  likes: LikedProduct[];
  showSkeleton: boolean;
  onClose: () => void;
  onUnlike: (productId: string) => void;
  onAddToCart: (product: LikedProduct) => void;
  unlikePendingId: string | undefined;
  unlikeIsPending: boolean;
  isAddingProduct: (productId: string) => boolean;
};

function LikedListPanel({
  likes,
  showSkeleton,
  onClose,
  onUnlike,
  onAddToCart,
  unlikePendingId,
  unlikeIsPending,
  isAddingProduct,
}: LikedListPanelProps) {
  const t = useTranslations('feed');
  const { formatCurrency } = useCurrency();

  return (
    <Stack sx={{ height: '100%', minHeight: 0 }}>
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
          <CloseIcon aria-hidden size={20} />
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
              const removing = unlikeIsPending && unlikePendingId === product.id;
              const adding = isAddingProduct(product.id);
              const rowBusy = removing || adding;

              return (
                <Stack key={product.id} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Box
                    component="img"
                    src={product.images[0]}
                    alt={product.name}
                    sx={{ width: 56, height: 56, borderRadius: 1.5, objectFit: 'cover', flexShrink: 0 }}
                  />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                      {product.name}
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
                      onClick={() => onUnlike(product.id)}
                    >
                      {removing ? (
                        <CircularProgress size={18} color="inherit" aria-hidden />
                      ) : (
                        <CloseIcon aria-hidden size={18} />
                      )}
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label={t('likedList.addToCart')}
                      aria-busy={adding}
                      disabled={rowBusy}
                      onClick={() => onAddToCart(product)}
                    >
                      {adding ? (
                        <CircularProgress size={18} color="inherit" aria-hidden />
                      ) : (
                        <CartIcon aria-hidden size={18} />
                      )}
                    </IconButton>
                  </Stack>
                </Stack>
              );
            })}
          </Stack>
        )}
      </Box>
    </Stack>
  );
}

export function FeedLikedList({ open, onClose, onUnliked }: FeedLikedListProps) {
  const t = useTranslations('feed');
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

  const handleAddToCart = (product: LikedProduct) => {
    const name = product.name;
    void addCartItemAsync({
      productId: product.id,
      slug: product.slug,
      title: name,
      priceMinor: product.priceMinor,
      currency: product.currency,
      imageUrl: product.images[0],
      suppressPanelOpen: true,
    })
      .then(() => {
        showToast.success(t('likedList.addedToCart', { name }));
      })
      .catch(() => {
        // Cart hook onError shows inventory-specific toast.
      });
  };

  const panelProps: LikedListPanelProps = {
    likes,
    showSkeleton,
    onClose,
    onUnlike: handleUnlike,
    onAddToCart: handleAddToCart,
    unlikePendingId: unlikeFeedVariables,
    unlikeIsPending: unlikeFeedIsPending,
    isAddingProduct: addCartItemIsAddingProduct,
  };

  return (
    <>
      <Drawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        sx={{ display: layoutDisplay.mobileOnlyBlock }}
        slotProps={{ paper: { sx: drawerPaperSx.mobile } }}
      >
        <LikedListPanel {...panelProps} />
      </Drawer>

      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        sx={{ display: layoutDisplay.desktopOnlyBlock }}
        slotProps={{ paper: { sx: drawerPaperSx.desktop } }}
      >
        <LikedListPanel {...panelProps} />
      </Drawer>
    </>
  );
}
