'use client';

import Box from '@mui/material/Box';
import { motion } from 'motion/react';

import { useReducedMotion } from '../../_shared';

type LiquidBackdropProps = {
  accent: string;
};

export function LiquidBackdrop({ accent }: LiquidBackdropProps) {
  const reducedMotion = useReducedMotion();

  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        background: (theme) =>
          `radial-gradient(120% 80% at 50% 20%, ${accent}55, ${theme.palette.background.default} 60%)`,
        transition: reducedMotion ? undefined : 'background 400ms ease',
      }}
    >
      {!reducedMotion ? (
        <>
          <Box
            component={motion.div}
            animate={{ x: ['-10%', '12%', '-8%'], y: ['0%', '10%', '-6%'], scale: [1, 1.12, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            sx={{
              position: 'absolute',
              width: '70%',
              height: '70%',
              left: '5%',
              top: '10%',
              borderRadius: '45% 55% 60% 40%',
              background: `radial-gradient(circle at 30% 30%, ${accent}66, transparent 70%)`,
              filter: 'blur(28px)',
            }}
          />
          <Box
            component={motion.div}
            animate={{ x: ['8%', '-14%', '6%'], y: ['12%', '-4%', '10%'], scale: [1.05, 0.95, 1.08] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            sx={{
              position: 'absolute',
              width: '65%',
              height: '65%',
              right: '0%',
              bottom: '5%',
              borderRadius: '55% 45% 40% 60%',
              background: `radial-gradient(circle at 70% 60%, ${accent}44, transparent 72%)`,
              filter: 'blur(32px)',
            }}
          />
        </>
      ) : null}
    </Box>
  );
}
