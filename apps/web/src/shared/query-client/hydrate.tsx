'use client';

import { type DehydratedState, HydrationBoundary } from '@tanstack/react-query';
import type { ReactNode } from 'react';

type QueryHydrateProps = {
  state: DehydratedState;
  children: ReactNode;
};

export function QueryHydrate({ state, children }: QueryHydrateProps) {
  return <HydrationBoundary state={state}>{children}</HydrationBoundary>;
}
