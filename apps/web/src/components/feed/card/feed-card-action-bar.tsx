'use client';

import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import type { SxProps, Theme } from '@mui/material/styles';
import CartIcon from '@my-noodles/ui/icons/cart.svg';
import ChevronRightIcon from '@my-noodles/ui/icons/chevron-right.svg';
import { useTranslations } from 'next-intl';

import type { Product } from '@/api/feed';
import { ChevronIcon } from '@/components/feed/action-rail/feed-icons';
import { useCartActions } from '@/hooks/cart';
import { Link } from '@/i18n/navigation';

type FeedCardActionBarProps = {
  item: Product;
  detailsOpen: boolean;
  onToggleDetails: () => void;
  sx?: SxProps<Theme>;
};

export function FeedCardActionBar({ item, detailsOpen, onToggleDetails, sx }: FeedCardActionBarProps) {
  const t = useTranslations('feed');
  const { addItem, isAddingProduct } = useCartActions();
  const isAdding = isAddingProduct(item.id);

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'stretch', ...sx }}>
      <IconButton
        aria-label={detailsOpen ? t('details.close') : t('actions.details')}
        aria-expanded={detailsOpen}
        data-feed-no-swipe
        onClick={onToggleDetails}
        sx={{
          flexShrink: 0,
          alignSelf: 'center',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.35)',
          borderRadius: 2,
          width: 42,
          height: 42,
          '&:hover': { bgcolor: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.55)' },
        }}
      >
        <ChevronIcon direction={detailsOpen ? 'down' : 'up'} size={22} aria-hidden />
      </IconButton>

      <Stack
        direction="row"
        sx={{
          flex: 1,
          minWidth: 0,
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.35)',
          bgcolor: 'rgba(255,255,255,0.08)',
        }}
      >
        <Button
          component={Link}
          href={`/product/${item.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          variant="text"
          startIcon={<ChevronRightIcon aria-hidden size={18} />}
          sx={{
            flex: 1,
            minWidth: 0,
            borderRadius: 0,
            px: 1.5,
            color: '#fff',
            borderRight: '1px solid rgba(255,255,255,0.2)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
          }}
        >
          {t('details.goToProduct')}
        </Button>
        <Button
          variant="contained"
          disabled={!item.inStock || isAdding}
          aria-busy={isAdding}
          startIcon={
            isAdding ? (
              <CircularProgress size={18} color="inherit" aria-hidden />
            ) : (
              <CartIcon aria-hidden size={18} />
            )
          }
          onClick={() =>
            addItem({
              productId: item.id,
              slug: item.slug,
              title: item.name ?? item.slug,
              priceMinor: item.priceMinor,
              currency: item.currency,
              imageUrl: item.images[0],
            })
          }
          sx={{
            flex: 1,
            minWidth: 0,
            borderRadius: 0,
            px: 1.5,
            boxShadow: 'none',
            ...(isAdding && {
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              opacity: 1,
            }),
            '&.Mui-disabled': isAdding
              ? {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  opacity: 1,
                }
              : {
                  color: '#fff',
                  bgcolor: 'rgba(0,0,0,0.45)',
                  opacity: 1,
                },
          }}
        >
          {item.inStock ? t('details.add') : t('details.outOfStock')}
        </Button>
      </Stack>
    </Stack>
  );
}
