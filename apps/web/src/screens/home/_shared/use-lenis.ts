'use client';

import Lenis from 'lenis';
import { useEffect } from 'react';

import { useReducedMotion } from './use-reduced-motion';

export function useLenis() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    const lenis = new Lenis({
      autoRaf: true,
      smoothWheel: true,
    });

    return () => {
      lenis.destroy();
    };
  }, [reducedMotion]);
}
