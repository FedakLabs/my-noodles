'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { resolveSkin } from '@my-noodles/ui';
import { useDrag } from '@use-gesture/react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { useRef } from 'react';

import { useRouter } from '@/i18n/navigation';

import { skinResultToGradient, startViewTransitionNav, useReducedMotion } from '../../_shared';

export type PortalKind = 'collections' | 'catalog' | 'feed';

type PortalCardProps = {
  kind: PortalKind;
  title: string;
  href: '/collections' | '/catalog' | '/feed';
  imageUrl?: string;
  skinSeed: { brand?: string; country?: string; category?: string; slug?: string };
  onHoverChange: (kind: PortalKind | null) => void;
};

export function PortalCard({ kind, title, href, imageUrl, skinSeed, onHoverChange }: PortalCardProps) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const skin = resolveSkin(skinSeed);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 280, damping: 22 });
  const springY = useSpring(y, { stiffness: 280, damping: 22 });

  useDrag(
    ({ down, movement: [mx, my], velocity: [vx, vy], direction: [dx, dy], cancel }) => {
      if (reducedMotion) {
        return;
      }

      if (!down && Math.abs(my) > Math.abs(mx) && Math.abs(my) > 40) {
        cancel?.();
        x.set(0);
        y.set(0);
        return;
      }

      x.set(down ? mx : 0);
      y.set(down ? my : 0);

      if (!down && (Math.abs(vx) > 0.6 || Math.abs(vy) > 0.6)) {
        x.set(dx * 24);
        y.set(dy * 16);
        window.setTimeout(() => {
          x.set(0);
          y.set(0);
        }, 180);
      }
    },
    {
      target: buttonRef,
      enabled: !reducedMotion,
      filterTaps: true,
      pointer: { touch: true },
    },
  );

  const backgroundImage = imageUrl ? `url(${imageUrl})` : skinResultToGradient(skin);

  return (
    <Box sx={{ width: '100%', minHeight: { xs: 140, md: 200 } }}>
      <motion.button
        ref={buttonRef}
        type="button"
        style={{
          x: springX,
          y: springY,
          appearance: 'none',
          border: 0,
          cursor: 'grab',
          touchAction: 'pan-y',
          textAlign: 'left',
          color: '#fff',
          width: '100%',
          height: '100%',
          minHeight: 'inherit',
          borderRadius: 16,
          overflow: 'hidden',
          position: 'relative',
          padding: 16,
          display: 'flex',
          alignItems: 'flex-end',
          backgroundImage,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        }}
        onMouseEnter={() => onHoverChange(kind)}
        onMouseLeave={() => onHoverChange(null)}
        onFocus={() => onHoverChange(kind)}
        onBlur={() => onHoverChange(null)}
        onClick={() => startViewTransitionNav(href, (path) => router.push(path))}
      >
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.62))',
          }}
        />
        <Typography variant="h5" sx={{ position: 'relative', zIndex: 1, color: 'common.white' }}>
          {title}
        </Typography>
      </motion.button>
    </Box>
  );
}
