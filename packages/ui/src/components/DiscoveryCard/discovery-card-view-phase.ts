/** Collapsed grid card vs in-place expanded overlay. */
export type DiscoveryCardViewPhase = 'summary' | 'expanded';

export function isView(view: DiscoveryCardViewPhase, phase: DiscoveryCardViewPhase): boolean {
  return view === phase;
}
