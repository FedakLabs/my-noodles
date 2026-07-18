'use client';

import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState } from 'react';

import type { Product } from '@/api/feed';
import { ProductShareMenu } from '@/components/product/product-share-menu/product-share-menu';
import { useCartActions, useCartItemCount } from '@/hooks/cart';
import { type FeedTagChip, feedTagLabel } from '@/hooks/feed';

import { CartRailButton } from './feed-cart-rail-button';
import { CommentIcon, HeartIcon, TagIcon } from './feed-icons';
import { RailButton } from './feed-rail-button';

const CART_ATTENTION_MS = 2_800;
const RAIL_ICON_SIZE = 30;

export type FeedActionRailProps = {
  item: Product;
  onToggleLike: () => void;
  commentsOpen: boolean;
  onOpenComments: () => void;
  onOpenLiked: () => void;
  activeTags: FeedTagChip[];
  tagLabels: Record<string, string>;
  onRemoveTag: (chip: FeedTagChip) => void;
  onClearTags: () => void;
};

export type FeedCardControlsProps = Omit<FeedActionRailProps, 'item'>;

export function FeedActionRail({
  item,
  onToggleLike,
  commentsOpen,
  onOpenComments,
  onOpenLiked,
  activeTags,
  tagLabels,
  onRemoveTag,
  onClearTags,
}: FeedActionRailProps) {
  const t = useTranslations('feed');
  const tagsMenuId = useId();
  const [tagsAnchor, setTagsAnchor] = useState<HTMLElement | null>(null);
  const tagsOpen = tagsAnchor != null;
  const cartCount = useCartItemCount();
  const { openPanel } = useCartActions();
  const prevCartCountRef = useRef<number | null>(null);
  const attentionTimerRef = useRef<number | null>(null);
  const [cartHighlighted, setCartHighlighted] = useState(false);
  const [cartBumpKey, setCartBumpKey] = useState(0);

  useEffect(() => {
    if (prevCartCountRef.current === null) {
      prevCartCountRef.current = cartCount;
      return;
    }

    if (cartCount === prevCartCountRef.current) {
      return;
    }

    prevCartCountRef.current = cartCount;
    setCartHighlighted(true);
    setCartBumpKey((key) => key + 1);

    if (attentionTimerRef.current !== null) {
      window.clearTimeout(attentionTimerRef.current);
    }

    attentionTimerRef.current = window.setTimeout(() => {
      setCartHighlighted(false);
      attentionTimerRef.current = null;
    }, CART_ATTENTION_MS);
  }, [cartCount]);

  useEffect(
    () => () => {
      if (attentionTimerRef.current !== null) {
        window.clearTimeout(attentionTimerRef.current);
      }
    },
    [],
  );

  return (
    <>
      <Stack
        spacing={0.75}
        sx={{
          flexDirection: 'column',
          alignItems: 'center',
          flexShrink: 0,
          justifyContent: 'flex-end',
        }}
      >
        <CartRailButton
          label={t('actions.cart')}
          caption={cartCount > 0 ? String(cartCount) : undefined}
          highlighted={cartHighlighted}
          bumpKey={cartBumpKey}
          iconSize={RAIL_ICON_SIZE}
          compact
          onClick={openPanel}
        />

        <RailButton
          label={item.liked ? t('actions.liked') : t('actions.like')}
          active={item.liked}
          compact
          onClick={onToggleLike}
        >
          <HeartIcon filled={item.liked} size={RAIL_ICON_SIZE} />
        </RailButton>

        <RailButton
          label={t('actions.comments')}
          caption={(item.commentCount ?? 0) > 0 ? String(item.commentCount) : undefined}
          active={commentsOpen}
          compact
          onClick={onOpenComments}
          aria-expanded={commentsOpen}
        >
          <CommentIcon filled={commentsOpen} size={RAIL_ICON_SIZE} />
        </RailButton>

        <Stack spacing={0.25} sx={{ alignItems: 'center', color: 'common.white' }}>
          <ProductShareMenu
            productName={item.name ?? item.slug}
            productSlug={item.slug}
            iconSize={RAIL_ICON_SIZE}
          />
        </Stack>

        <RailButton
          label={t('tags.label')}
          caption={activeTags.length > 0 ? String(activeTags.length) : undefined}
          compact
          onClick={(event) => setTagsAnchor(event.currentTarget)}
          aria-controls={tagsOpen ? tagsMenuId : undefined}
          aria-haspopup="menu"
          aria-expanded={tagsOpen ? true : undefined}
        >
          <TagIcon size={RAIL_ICON_SIZE} />
        </RailButton>

        <RailButton label={t('actions.viewLiked')} compact onClick={onOpenLiked}>
          <HeartIcon filled size={RAIL_ICON_SIZE} />
        </RailButton>
      </Stack>

      <Menu
        id={tagsMenuId}
        anchorEl={tagsAnchor}
        open={tagsOpen}
        onClose={() => setTagsAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 220, maxWidth: 320 } } }}
      >
        {activeTags.length === 0 ? (
          <MenuItem disabled>
            <ListItemText primary={t('tags.empty')} />
          </MenuItem>
        ) : (
          activeTags.map((chip) => (
            <MenuItem key={`${chip.type}-${chip.value}`} onClick={() => onRemoveTag(chip)}>
              <ListItemText primary={`#${feedTagLabel(tagLabels, chip)}`} secondary={t('tags.remove')} />
            </MenuItem>
          ))
        )}
        {activeTags.length > 0 ? (
          <MenuItem
            onClick={() => {
              onClearTags();
              setTagsAnchor(null);
            }}
            sx={{ fontWeight: 700 }}
          >
            <ListItemText primary={t('tags.clearAll')} />
          </MenuItem>
        ) : null}
      </Menu>
    </>
  );
}
