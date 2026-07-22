'use client';

import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';

import { useReducedMotion } from './use-reduced-motion';

type SectionRevealProps = {
  children: ReactNode;
  sx?: SxProps<Theme>;
  delay?: number;
};

export function SectionReveal({ children, sx, delay = 0 }: SectionRevealProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <Box sx={sx}>{children}</Box>;
  }

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      sx={sx}
    >
      {children}
    </Box>
  );
}
