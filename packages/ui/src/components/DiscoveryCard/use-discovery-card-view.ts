'use client';

import { useCallback, useState } from 'react';

import { type DiscoveryCardViewPhase, isView } from './discovery-card-view-phase';

export function useDiscoveryCardView(initialView: DiscoveryCardViewPhase = 'summary') {
  const [view, setView] = useState<DiscoveryCardViewPhase>(initialView);

  const toggleView = useCallback(() => {
    setView((current) => (isView(current, 'expanded') ? 'summary' : 'expanded'));
  }, []);

  return {
    view,
    toggleView,
    setView,
  };
}
