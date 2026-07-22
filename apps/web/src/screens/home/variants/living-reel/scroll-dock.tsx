'use client';

import Box from '@mui/material/Box';
import { motion, useScroll, useTransform } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { useReducedMotion } from '../../_shared';
import { HeroReel } from './hero-reel';

function supportsViewTimeline(): boolean {
  if (typeof CSS === 'undefined' || typeof CSS.supports !== 'function') {
    return false;
  }

  return CSS.supports('animation-timeline', 'view()');
}

type ScrollDockProps = {
  children: ReactNode;
};

export function ScrollDock({ children }: ScrollDockProps) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [useCssTimeline, setUseCssTimeline] = useState(false);

  useEffect(() => {
    setUseCssTimeline(supportsViewTimeline());
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });
  const motionProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reducedMotion || useCssTimeline) {
      return;
    }

    return motionProgress.on('change', (value) => {
      setProgress(value);
    });
  }, [motionProgress, reducedMotion, useCssTimeline]);

  if (reducedMotion) {
    return (
      <>
        <HeroReel dockProgress={0} />
        {children}
      </>
    );
  }

  if (useCssTimeline) {
    return (
      <>
        <Box
          ref={containerRef}
          sx={{
            height: '160dvh',
            position: 'relative',
          }}
        >
          <Box
            className="living-reel-dock-sticky"
            sx={{
              position: 'sticky',
              top: 0,
              height: '100dvh',
              '@supports (animation-timeline: view())': {
                '& .living-reel-dock-frame': {
                  animation: 'living-reel-dock linear both',
                  animationTimeline: 'view()',
                  animationRange: 'entry 0% exit 40%',
                },
                '@keyframes living-reel-dock': {
                  from: {
                    width: '100%',
                    height: '100%',
                    borderRadius: 0,
                    transform: 'scale(1)',
                  },
                  to: {
                    width: '82%',
                    height: '78%',
                    borderRadius: '24px',
                    transform: 'scale(0.72)',
                  },
                },
              },
            }}
          >
            <Box
              className="living-reel-dock-frame"
              sx={{
                mx: 'auto',
                overflow: 'hidden',
                height: '100%',
                width: '100%',
              }}
            >
              <HeroReel dockProgress={0} />
            </Box>
          </Box>
        </Box>
        {children}
      </>
    );
  }

  return (
    <>
      <Box ref={containerRef} sx={{ height: '160dvh', position: 'relative' }}>
        <Box component={motion.div} sx={{ position: 'sticky', top: 0, height: '100dvh' }}>
          <HeroReel dockProgress={progress} />
        </Box>
      </Box>
      {children}
    </>
  );
}
