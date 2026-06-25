'use client';

import { useCallback, useState } from 'react';

import { type DiscoveryCardViewPhase, isPreviewPhase } from './discovery-card-view-phase';

export function useDiscoveryCardView(initialView: DiscoveryCardViewPhase = 'summary') {
  const [view, setView] = useState<DiscoveryCardViewPhase>(initialView);
  const isPreview = isPreviewPhase(view);

  const toggleView = useCallback(() => {
    setView((current) => (isPreviewPhase(current) ? 'summary' : 'preview'));
  }, []);

  return {
    view,
    isPreview,
    toggleView,
    setView,
  };
}
