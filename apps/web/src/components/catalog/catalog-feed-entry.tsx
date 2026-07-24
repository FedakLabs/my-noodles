'use client';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { cardShadow } from '@my-noodles/theme';
import SearchIcon from '@my-noodles/ui/icons/search.svg';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

import { usePendingRouter } from '@/hooks/smooth';
import { useRouter } from '@/i18n/navigation';

import { FeedCinemaTransition } from './feed-cinema-transition';

/** Depth into the screen (= button height before rotation). */
const TAB_DEPTH = 38;
/** Length of the button along the edge after rotation (= button width before rotation). */
const TAB_LENGTH = 60;
/** Scoop radius for the edge flares (matches button corner radius). */
const TAB_RADIUS = Math.min(16, Math.round(TAB_DEPTH / 2));
const ICON_SIZE = 22;

const RAIL_WIDTH = TAB_DEPTH;
const RAIL_HEIGHT = TAB_LENGTH + TAB_RADIUS * 2 - 2;

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
  const fillTransition = theme.transitions.create('background-color', {
    duration: theme.transitions.duration.short,
  });

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

  const flareSx = (corner: 'top left' | 'top right') =>
    ({
      width: TAB_RADIUS,
      height: TAB_RADIUS,
      flex: 'none',
      // Solid fill + mask so background-color can ease like Fab / ButtonBase.
      bgcolor: fill,
      transition: fillTransition,
      WebkitMaskImage: `radial-gradient(circle at ${corner}, transparent ${TAB_RADIUS}px, #000 calc(${TAB_RADIUS}px + 0.5px))`,
      maskImage: `radial-gradient(circle at ${corner}, transparent ${TAB_RADIUS}px, #000 calc(${TAB_RADIUS}px + 0.5px))`,
      '.catalog-feed-entry-rail:hover &, .catalog-feed-entry-rail:focus-within &': {
        bgcolor: fillHover,
      },
    }) as const;

  return (
    <>
      <Box
        className="catalog-feed-entry-rail"
        sx={{
          position: 'fixed',
          top: '50%',
          right: 0,
          zIndex: theme.zIndex.speedDial,
          width: RAIL_WIDTH,
          height: RAIL_HEIGHT,
          transform: 'translateY(-50%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            display: 'flex',
            alignItems: 'flex-end',
            transform: 'translate(-50%, -50%) rotate(-90deg)',
            // Single-layer shadow so `drop-shadow` follows the tab + flare silhouette.
            filter: `drop-shadow(${cardShadow})`,
          }}
        >
          <Box aria-hidden sx={{ ...flareSx('top left'), mr: '-1px' }} />

          <ButtonBase
            aria-label={t('nav.feed')}
            disabled={transitioning}
            onClick={handleOpen}
            sx={{
              width: TAB_LENGTH,
              height: TAB_DEPTH,
              borderRadius: `${TAB_RADIUS}px ${TAB_RADIUS}px 0 0`,
              bgcolor: fill,
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: fillTransition,
              '.catalog-feed-entry-rail:hover &, .catalog-feed-entry-rail:focus-within &': {
                bgcolor: fillHover,
              },
              '&.Mui-disabled': {
                bgcolor: fill,
                color: 'primary.contrastText',
                opacity: 0.72,
              },
            }}
          >
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                transform: 'rotate(90deg)',
                lineHeight: 0,
              }}
            >
              <SearchIcon aria-hidden size={ICON_SIZE} />
            </Box>
          </ButtonBase>

          <Box aria-hidden sx={{ ...flareSx('top right'), ml: '-1px' }} />
        </Box>
      </Box>

      <FeedCinemaTransition active={transitioning} onCovered={goToFeed} />
    </>
  );
}
