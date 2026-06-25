import type { DiscoveryCardViewAnchor } from '@my-noodles/ui';

export function productCardPreviewAnchor(gridIndex: number, columns: number): DiscoveryCardViewAnchor {
  const position = gridIndex % columns;
  if (position === 0) {
    return 'start';
  }
  if (position === columns - 1) {
    return 'end';
  }
  return 'center';
}
