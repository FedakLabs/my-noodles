import { type Locale } from '../locale';
import en from './discovery-card/en.json';
import uk from './discovery-card/uk.json';

export type DiscoveryCardMessages = typeof uk;

/** Shared discovery-card copy — wire into each app’s i18n framework (i18next / next-intl). */
export const discoveryCardMessages = {
  uk,
  en,
} as const satisfies Record<Locale, DiscoveryCardMessages>;
