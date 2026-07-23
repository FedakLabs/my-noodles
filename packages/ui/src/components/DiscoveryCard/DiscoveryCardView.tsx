'use client';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { cardShadow } from '@my-noodles/theme';
import type { CSSProperties, KeyboardEvent, MouseEvent, PointerEvent, ReactNode } from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import type { SkinResult } from '../../utils/skins';
import {
  DISCOVERY_CARD_ACTIONS_ROW_MIN_HEIGHT,
  DISCOVERY_CARD_IMAGE_FRAME_SX,
} from './discovery-card-shared';
import { discoveryCardSkinStripePseudoSx } from './discovery-card-skin-stripe';
import { discoveryCardSkinStyle } from './discovery-card-skin-style';
import { type DiscoveryCardViewPhase, isView } from './discovery-card-view-phase';
import { DiscoveryCardScrollable } from './DiscoveryCardScrollable';

const VIEW_TRANSITION_MS = 400;
export const DISCOVERY_CARD_VIEW_TRANSITION_MS = VIEW_TRANSITION_MS;
/** Pause after scroll-to-top before width collapse — gives the layout a beat to register. */
const COLLAPSE_SETTLE_MS = 280;
const HOVER_SCALE_TRANSITION_MS = 250;
const PREVIEW_WIDTH = 'min(200%, calc(100vw - 32px))';
const MORPH_GAP_PX = 12;
const MORPH_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';
/** Ignore view-toggle clicks after a drag (matches Embla `dragThreshold` default). */
const CLICK_DRAG_THRESHOLD_PX = 10;

function scrollElementToTop(element: HTMLElement): Promise<void> {
  if (element.scrollTop === 0) {
    return Promise.resolve();
  }

  element.scrollTo({ top: 0, behavior: 'smooth' });

  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      resolve();
    };

    const startedAt = performance.now();
    const poll = () => {
      if (element.scrollTop === 0) {
        finish();
        return;
      }
      if (performance.now() - startedAt > 600) {
        element.scrollTop = 0;
        finish();
        return;
      }
      requestAnimationFrame(poll);
    };

    requestAnimationFrame(poll);
  });
}

export type DiscoveryCardViewAnchor = 'start' | 'center' | 'end';

export type DiscoveryCardViewDetails = {
  loading: boolean;
  content: ReactNode | null;
};

export type DiscoveryCardViewProps = {
  view: DiscoveryCardViewPhase;
  anchor?: DiscoveryCardViewAnchor;
  skin?: SkinResult;
  media: ReactNode;
  /** Title, subtitle, price, etc. — typically `DiscoveryCard.Body` children. */
  meta: ReactNode;
  /** Extra preview copy below the morph row in preview view. */
  details?: DiscoveryCardViewDetails;
  actions: ReactNode;
  onClick?: () => void;
};

function resolveTransformOrigin(anchor: DiscoveryCardViewAnchor): string {
  if (anchor === 'start') {
    return 'left center';
  }
  if (anchor === 'end') {
    return 'right center';
  }
  return 'center center';
}

function resolveOverlayPosition(anchor: DiscoveryCardViewAnchor): Record<string, unknown> {
  if (anchor === 'start') {
    return { left: 0, right: 'auto' };
  }

  if (anchor === 'end') {
    return { right: 0, left: 'auto' };
  }

  return { left: '50%', right: 'auto', transform: 'translateX(-50%)' };
}

function resolveHoverTransform(anchor: DiscoveryCardViewAnchor, anchoredOpen: boolean): string {
  if (anchoredOpen) {
    return anchor === 'center' ? 'translateX(-50%)' : 'none';
  }

  return anchor === 'center' ? 'translateX(-50%) scale(1.03)' : 'scale(1.03)';
}

function cardSurfaceSx({
  isOpen,
  anchoredOpen,
  elevated,
  anchor,
  skinStyle,
  transformOrigin,
  overlayPositionSx,
  hoverScaleEnabled,
}: {
  isOpen: boolean;
  anchoredOpen: boolean;
  elevated: boolean;
  anchor: DiscoveryCardViewAnchor;
  skinStyle?: CSSProperties;
  transformOrigin: string;
  overlayPositionSx: Record<string, unknown>;
  hoverScaleEnabled: boolean;
}) {
  const easing = 'cubic-bezier(0.4, 0, 0.2, 1)';

  const skinStripeSx = skinStyle
    ? discoveryCardSkinStripePseudoSx({
        // Hover stripe is merged below with scale so @media keys do not clobber each other.
        suppressHoverStripe: true,
        collapseStripe: isOpen,
      })
    : {};
  const skinStripeHoverEnabled = Boolean(skinStyle) && !isOpen;

  return {
    position: 'absolute' as const,
    top: 0,
    ...overlayPositionSx,
    zIndex: elevated ? 12 : 1,
    p: 1.5,
    borderRadius: 2,
    bgcolor: 'background.paper',
    boxShadow: elevated ? `${cardShadow}, 0 12px 40px rgba(26, 22, 20, 0.16)` : 1,
    height: '100%',
    width: isOpen ? PREVIEW_WIDTH : '100%',
    minWidth: 0,
    maxWidth: isOpen ? PREVIEW_WIDTH : '100%',
    overflow: 'hidden',
    transformOrigin,
    transition: `width ${VIEW_TRANSITION_MS}ms ${easing}, max-width ${VIEW_TRANSITION_MS}ms ${easing}, box-shadow ${VIEW_TRANSITION_MS}ms ${easing}, transform ${HOVER_SCALE_TRANSITION_MS}ms ease`,
    ...skinStripeSx,
    ...(skinStripeHoverEnabled || hoverScaleEnabled
      ? {
          '@media (hover: hover)': {
            ...(skinStripeHoverEnabled
              ? {
                  '&:hover::after': {
                    opacity: 1,
                  },
                }
              : {}),
            ...(hoverScaleEnabled
              ? {
                  '&:hover': {
                    transform: resolveHoverTransform(anchor, anchoredOpen),
                  },
                }
              : {}),
          },
        }
      : {}),
  };
}

export function DiscoveryCardView({
  view,
  anchor = 'center',
  skin,
  media,
  meta,
  details,
  actions,
  onClick,
}: DiscoveryCardViewProps) {
  const skinStyle = discoveryCardSkinStyle(skin);
  const logicalOpen = isView(view, 'expanded');
  const [surfaceOpen, setSurfaceOpen] = useState(logicalOpen);
  const [contentOpen, setContentOpen] = useState(logicalOpen);
  const morphRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const columnMediaRef = useRef<HTMLDivElement>(null);
  const pointerDownPointRef = useRef<{ x: number; y: number } | null>(null);
  const [columnMediaSize, setColumnMediaSize] = useState(0);
  const [layoutTransitioning, setLayoutTransitioning] = useState(false);
  const [surfaceWidthAnimating, setSurfaceWidthAnimating] = useState(false);
  const skipLayoutTransitionRef = useRef(true);
  const cardInteractive = onClick != null;

  // Bind media to one grid-column width — measure the placeholder, not the expanding card surface.
  useLayoutEffect(() => {
    const columnMediaEl = columnMediaRef.current;
    if (!columnMediaEl) {
      return;
    }

    const updateColumnMediaSize = () => {
      const width = columnMediaEl.offsetWidth;
      if (width > 0) {
        setColumnMediaSize(width);
      }
    };

    updateColumnMediaSize();
    const observer = new ResizeObserver(updateColumnMediaSize);
    observer.observe(columnMediaEl);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let contentCloseTimer: number | undefined;
    let settleTimer: number | undefined;
    let cancelled = false;

    if (logicalOpen) {
      setSurfaceOpen(true);
      setContentOpen(true);
      return;
    }

    const beginClose = () => {
      if (cancelled) {
        return;
      }

      setSurfaceOpen(false);
      contentCloseTimer = window.setTimeout(() => {
        if (!cancelled) {
          setContentOpen(false);
        }
      }, VIEW_TRANSITION_MS);
    };

    const scheduleCloseAfterScroll = () => {
      if (cancelled) {
        return;
      }

      settleTimer = window.setTimeout(beginClose, COLLAPSE_SETTLE_MS);
    };

    const scrollEl = scrollRef.current;
    if (!scrollEl || scrollEl.scrollTop === 0) {
      scheduleCloseAfterScroll();
    } else {
      void scrollElementToTop(scrollEl).then(scheduleCloseAfterScroll);
    }

    return () => {
      cancelled = true;
      if (settleTimer != null) {
        window.clearTimeout(settleTimer);
      }
      if (contentCloseTimer != null) {
        window.clearTimeout(contentCloseTimer);
      }
    };
  }, [logicalOpen]);

  useEffect(() => {
    setSurfaceWidthAnimating(true);
    const timer = window.setTimeout(() => setSurfaceWidthAnimating(false), VIEW_TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [surfaceOpen]);

  useEffect(() => {
    if (skipLayoutTransitionRef.current) {
      skipLayoutTransitionRef.current = false;
      return;
    }

    setLayoutTransitioning(true);
    const timer = window.setTimeout(() => setLayoutTransitioning(false), VIEW_TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [surfaceOpen]);

  const isOpen = surfaceOpen;
  const elevated = isOpen || contentOpen;
  const anchoredOpen = isOpen || contentOpen;
  const transformOrigin = resolveTransformOrigin(anchor);
  const overlayPositionSx = resolveOverlayPosition(anchor);
  const transitionMs = VIEW_TRANSITION_MS;
  const columnMediaWidth = columnMediaSize > 0 ? `${columnMediaSize}px` : '100%';
  const morphMinHeight = contentOpen && columnMediaSize > 0 ? columnMediaSize : undefined;

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointerDownPointRef.current = { x: event.clientX, y: event.clientY };
  };

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    const start = pointerDownPointRef.current;
    pointerDownPointRef.current = null;
    // Carousel swipe can mouseup outside Embla (e.g. on meta in preview row); LCA click
    // then reaches this handler even though Embla swallowed the in-carousel click.
    if (start) {
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (dx * dx + dy * dy > CLICK_DRAG_THRESHOLD_PX * CLICK_DRAG_THRESHOLD_PX) {
        return;
      }
    }
    onClick?.();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!cardInteractive) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  };

  const detailsLoading = details?.loading ?? false;
  const detailsContent = details?.content ?? null;
  const showDetailsTextLoading = contentOpen && detailsLoading && detailsContent == null;
  const showDetails = contentOpen && detailsContent != null && !showDetailsTextLoading;
  const bodyScrollEnabled = contentOpen && !layoutTransitioning;

  const detailsLoadingSkeleton = (
    <Stack spacing={0.5} sx={{ width: '100%' }}>
      <Skeleton variant="text" animation="wave" width="100%" />
      <Skeleton variant="text" animation="wave" width="96%" />
      <Skeleton variant="text" animation="wave" width="90%" />
      <Skeleton variant="text" animation="wave" width="74%" sx={{ mt: 0.5 }} />
    </Stack>
  );

  const mediaSurfaceSx = {
    ...DISCOVERY_CARD_IMAGE_FRAME_SX,
    flexGrow: 0,
    width: columnMediaWidth,
    maxWidth: columnMediaWidth,
    ...(columnMediaSize > 0
      ? {
          height: columnMediaWidth,
          maxHeight: columnMediaWidth,
        }
      : {}),
    position: 'relative' as const,
  };

  const morphLayoutSx = {
    display: 'flex',
    flexFlow: contentOpen ? 'row wrap' : 'column wrap',
    gap: MORPH_GAP_PX / 8,
    alignItems: contentOpen ? 'center' : 'stretch',
    minHeight: morphMinHeight,
    minWidth: 0,
    flexShrink: 0,
    transition: `gap ${transitionMs}ms ${MORPH_EASING}`,
  };

  const metaNowrapDuringWidthTransition = contentOpen && surfaceWidthAnimating;

  const metaStackSx = {
    flex: contentOpen ? '1 1 0' : '1 1 auto',
    minWidth: contentOpen ? 0 : undefined,
    width: contentOpen ? undefined : '100%',
    justifyContent: contentOpen ? 'center' : 'flex-start',
    transition: `flex-basis ${transitionMs}ms ${MORPH_EASING}`,
    ...(metaNowrapDuringWidthTransition
      ? {
          overflow: 'hidden',
          '& .MuiTypography-root': {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          },
        }
      : {}),
  };

  const morphBody = (
    <Box ref={morphRef} sx={morphLayoutSx}>
      <Box sx={mediaSurfaceSx} onClick={logicalOpen ? (event) => event.stopPropagation() : undefined}>
        {media}
      </Box>
      <Stack spacing={0.5} sx={metaStackSx}>
        {meta}
      </Stack>
    </Box>
  );

  const cardContent = (
    <Stack spacing={1.5} sx={{ height: '100%', minHeight: 0 }}>
      <Box
        role={cardInteractive ? 'button' : undefined}
        tabIndex={cardInteractive ? 0 : undefined}
        onPointerDown={cardInteractive ? handlePointerDown : undefined}
        onClick={cardInteractive ? handleClick : undefined}
        onKeyDown={cardInteractive ? handleKeyDown : undefined}
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          cursor: cardInteractive ? 'pointer' : undefined,
          outline: 'none',
          '&:focus-visible': cardInteractive
            ? {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: 2,
                borderRadius: 1,
              }
            : undefined,
        }}
      >
        {contentOpen ? (
          <DiscoveryCardScrollable ref={scrollRef} enabled={bodyScrollEnabled}>
            <Stack spacing={1.5}>
              {morphBody}
              {showDetails ? detailsContent : null}
              {showDetailsTextLoading ? <Box aria-busy>{detailsLoadingSkeleton}</Box> : null}
            </Stack>
          </DiscoveryCardScrollable>
        ) : (
          morphBody
        )}
      </Box>

      <Box sx={{ flexShrink: 0, width: '100%', mt: 'auto' }}>{actions}</Box>
    </Stack>
  );

  const placeholderHero = (
    <Box ref={columnMediaRef} sx={{ ...DISCOVERY_CARD_IMAGE_FRAME_SX, width: '100%', position: 'relative' }}>
      {media}
    </Box>
  );

  const placeholderCard = (
    <Stack
      spacing={1.5}
      aria-hidden
      sx={{ p: 1.5, visibility: 'hidden', pointerEvents: 'none', height: '100%' }}
    >
      {placeholderHero}
      <Stack spacing={0.5}>{meta}</Stack>
      <Box
        sx={{
          flexShrink: 0,
          width: '100%',
          mt: 'auto',
          minHeight: DISCOVERY_CARD_ACTIONS_ROW_MIN_HEIGHT,
        }}
      />
    </Stack>
  );

  return (
    <Box sx={{ position: 'relative', height: '100%', minWidth: 0, width: '100%' }}>
      {placeholderCard}
      <Stack
        aria-expanded={isOpen ? true : undefined}
        aria-busy={detailsLoading ? true : undefined}
        sx={cardSurfaceSx({
          isOpen,
          anchoredOpen,
          elevated,
          anchor,
          skinStyle,
          transformOrigin,
          overlayPositionSx,
          hoverScaleEnabled: cardInteractive,
        })}
        style={skinStyle}
      >
        {cardContent}
      </Stack>
    </Box>
  );
}
