'use client';

import ButtonBase from '@mui/material/ButtonBase';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import SearchIcon from '@my-noodles/ui/icons/search.svg';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

import { usePendingRouter } from '@/hooks/smooth';
import { useRouter } from '@/i18n/navigation';

import { FeedCinemaTransition } from './feed-cinema-transition';

/**
 * Base was 56×68. Visual width/height were swapped vs CSS (right-edge tab),
 * so CSS width −⅓ and height +⅓ vs the previous +⅓/−⅓ pass.
 */
const ICON_SIZE = 24;
const TAB_WIDTH = Math.max(Math.round(56 * (2 / 3)), ICON_SIZE + 12);
const TAB_HEIGHT = Math.round(68 * (4 / 3));
/** Half-pill on the free (left) side. */
const TAB_RADIUS = Math.round(TAB_WIDTH / 2);

/** Outward fillet into the screen edge. */
const FILLET = 14;

export function CatalogFeedEntry() {
  const t = useTranslations('common');
  const theme = useTheme();
  const router = usePendingRouter();
  const prefetchRouter = useRouter();
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)', {
    defaultMatches: false,
  });
  const [transitioning, setTransitioning] = useState(false);

  const fill = theme.palette.primary.main;
  const fillHover = theme.palette.primary.dark;

  useEffect(() => {
    prefetchRouter.prefetch('/feed');
  }, [prefetchRouter]);

  const goToFeed = useCallback(() => {
    router.push('/feed');
  }, [router]);

  const handleOpen = () => {
    if (transitioning) {
      return;
    }

    if (prefersReducedMotion) {
      goToFeed();
      return;
    }

    setTransitioning(true);
  };

  return (
    <>
      <ButtonBase
        aria-label={t('nav.feed')}
        disabled={transitioning}
        onClick={handleOpen}
        sx={{
          position: 'fixed',
          top: '50%',
          right: 0,
          zIndex: theme.zIndex.speedDial,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: TAB_WIDTH,
          height: TAB_HEIGHT,
          // Rounded toward the page; square against the screen (right)
          borderRadius: `${TAB_RADIUS}px 0 0 ${TAB_RADIUS}px`,
          bgcolor: fill,
          color: 'primary.contrastText',
          boxShadow: theme.shadows[4],
          transform: 'translateY(-50%)',
          overflow: 'visible',

          '&::before, &::after': {
            content: '""',
            position: 'absolute',
            right: 0,
            width: FILLET,
            height: FILLET,
            bgcolor: 'transparent',
            pointerEvents: 'none',
          },
          // Full fillet-sized shadow (not half) so the seam is solid fill, no page bleed-through
          '&::before': {
            top: -FILLET,
            borderBottomRightRadius: FILLET,
            boxShadow: `0 ${FILLET}px 0 0 ${fill}`,
          },
          '&::after': {
            bottom: -FILLET,
            borderTopRightRadius: FILLET,
            boxShadow: `0 ${-FILLET}px 0 0 ${fill}`,
          },

          '&:hover': {
            bgcolor: fillHover,
          },
          '&:hover::before': {
            boxShadow: `0 ${FILLET}px 0 0 ${fillHover}`,
          },
          '&:hover::after': {
            boxShadow: `0 ${-FILLET}px 0 0 ${fillHover}`,
          },
          '&.Mui-disabled': {
            bgcolor: fill,
            color: 'primary.contrastText',
            opacity: 0.72,
          },
        }}
      >
        <SearchIcon aria-hidden size={ICON_SIZE} />
      </ButtonBase>

      <FeedCinemaTransition active={transitioning} onCovered={goToFeed} />
    </>
  );
}
