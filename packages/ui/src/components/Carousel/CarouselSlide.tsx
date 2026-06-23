'use client';

import Box from '@mui/material/Box';
import type { ReactNode } from 'react';

import { useCarouselContext } from './carousel-context';

export type CarouselResponsiveBasis = {
  xs?: string;
  sm?: string;
  md?: string;
  lg?: string;
};

export type CarouselSlideProps = {
  children: ReactNode;
  index: number;
  basis?: string;
  responsiveBasis?: CarouselResponsiveBasis;
  slideLabel?: string;
};

const RESPONSIVE_BASIS_BREAKPOINTS = [
  ['xs', 'xs'],
  ['sm', 'sm'],
  ['md', 'md'],
  ['lg', 'lg'],
] as const;

function buildResponsiveSize(responsiveBasis: CarouselResponsiveBasis): {
  flex: Record<string, string>;
  minWidth: Record<string, string>;
  width: Record<string, string>;
} {
  const flex: Record<string, string> = {};
  const minWidth: Record<string, string> = {};
  const width: Record<string, string> = {};

  for (const [breakpoint, key] of RESPONSIVE_BASIS_BREAKPOINTS) {
    const value = responsiveBasis[key];
    if (value) {
      flex[breakpoint] = `0 0 ${value}`;
      minWidth[breakpoint] = value;
      width[breakpoint] = value;
    }
  }

  return { flex, minWidth, width };
}

function buildFlexBasis(
  basis: string | undefined,
  responsiveBasis: CarouselResponsiveBasis | undefined,
): Record<string, string> | string {
  if (responsiveBasis) {
    const { flex } = buildResponsiveSize(responsiveBasis);

    if (Object.keys(flex).length > 0) {
      return flex;
    }
  }

  return `0 0 ${basis ?? '100%'}`;
}

export function CarouselSlide({
  children,
  index,
  basis = '100%',
  responsiveBasis,
  slideLabel,
}: CarouselSlideProps) {
  const { selectedIndex } = useCarouselContext();
  const isActive = index === selectedIndex;

  const flexBasis = buildFlexBasis(basis, responsiveBasis);
  const isFullWidthSlide = !responsiveBasis && basis === '100%';
  const fixedSlideSize = responsiveBasis ? buildResponsiveSize(responsiveBasis) : null;
  const fixedBasis = !responsiveBasis && basis !== '100%' ? basis : undefined;

  return (
    <Box
      role="group"
      aria-roledescription="slide"
      {...(slideLabel ? { 'aria-label': slideLabel } : {})}
      aria-hidden={!isActive}
      sx={{
        flex: flexBasis,
        flexShrink: fixedSlideSize || fixedBasis ? 0 : undefined,
        minWidth: fixedSlideSize?.minWidth ?? (isFullWidthSlide ? '100%' : (fixedBasis ?? 0)),
        width: fixedSlideSize?.width ?? (fixedBasis ? fixedBasis : undefined),
        height: responsiveBasis || basis !== '100%' ? 'auto' : '100%',
      }}
    >
      {children}
    </Box>
  );
}
