/** Default grid card layout vs in-place preview overlay. */
export type DiscoveryCardViewPhase = 'summary' | 'preview';

export function isPreviewPhase(phase: DiscoveryCardViewPhase): boolean {
  return phase === 'preview';
}
