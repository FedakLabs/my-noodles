/** Top skin stripe height — matches `--skin-card-gradient` stop on full-card backgrounds. */
const DISCOVERY_CARD_SKIN_STRIPE_HEIGHT = '45%';

/** Rounded bottom of the skin stripe — matches discovery image frame radius. */
const DISCOVERY_CARD_SKIN_STRIPE_BOTTOM_RADIUS_PX = 12;

const SKIN_STRIPE_TRANSITION_MS = 400;

const skinStripeBandSx = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  borderBottomLeftRadius: DISCOVERY_CARD_SKIN_STRIPE_BOTTOM_RADIUS_PX,
  borderBottomRightRadius: DISCOVERY_CARD_SKIN_STRIPE_BOTTOM_RADIUS_PX,
  overflow: 'hidden',
  pointerEvents: 'none',
  zIndex: 0,
};

type DiscoveryCardSkinStripePseudoOptions = {
  suppressHoverStripe?: boolean;
  /** Collapse stripe height to 0 — e.g. while expand shell is open. */
  collapseStripe?: boolean;
};

export function discoveryCardSkinStripePseudoSx(options?: DiscoveryCardSkinStripePseudoOptions) {
  const suppressHoverStripe = options?.suppressHoverStripe ?? false;
  const collapseStripe = options?.collapseStripe ?? false;
  const stripeHeight = collapseStripe ? 0 : DISCOVERY_CARD_SKIN_STRIPE_HEIGHT;
  const heightTransition = `height ${SKIN_STRIPE_TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`;

  const stripePseudoSx = {
    ...skinStripeBandSx,
    height: stripeHeight,
    transition: heightTransition,
  };

  return {
    '&::before': {
      content: '""',
      ...stripePseudoSx,
      backgroundImage: 'var(--skin-card-gradient-band)',
    },
    '&::after': {
      content: '""',
      ...stripePseudoSx,
      backgroundImage: 'var(--skin-card-gradient-band-active)',
      opacity: 0,
      transition: `height ${SKIN_STRIPE_TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1), opacity 250ms ease`,
    },
    ...(suppressHoverStripe
      ? {}
      : {
          '@media (hover: hover)': {
            '&:hover::after': {
              opacity: 1,
            },
          },
        }),
    '& > *': {
      position: 'relative',
      zIndex: 1,
    },
  };
}
