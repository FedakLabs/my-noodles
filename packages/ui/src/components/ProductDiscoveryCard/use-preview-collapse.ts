'use client';

import { type RefObject, useEffect } from 'react';

export function usePreviewCollapse(
  isPreview: boolean,
  onCollapse: () => void,
  rootRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!isPreview) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      if (root && !root.contains(event.target as Node)) {
        onCollapse();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isPreview, onCollapse, rootRef]);
}
