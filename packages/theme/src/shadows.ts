/** Warm-tinted soft lift for product cards. */
export const cardShadow = '0 2px 10px rgba(26, 22, 20, 0.07)';

/** Slightly stronger lift for sheets and sticky bars. */
export const sheetShadow = '0 -4px 24px rgba(26, 22, 20, 0.1)';

/** D-lite discovery wash — apply on hero/collection headers only. */
export function discoveryWash(hue: number, opacity = 0.04): string {
  return `linear-gradient(180deg, hsla(${hue}, 55%, 88%, ${opacity}) 0%, transparent 100%)`;
}

/** Product card top ~20% skin gradient (Flavor intensity). */
export function skinCardGradient(start: string, end: string): string {
  return `linear-gradient(180deg, ${start} 0%, ${end} 45%, transparent 45%)`;
}
