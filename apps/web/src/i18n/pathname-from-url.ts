import { routing } from './routing';

/** Locale-stripped pathname — matches `usePathname()` from `@/i18n/navigation`. */
export function pathnameFromUrl(url: URL): string {
  const segments = url.pathname.split('/').filter(Boolean);
  const locale = segments[0];

  if (locale && (routing.locales as readonly string[]).includes(locale)) {
    const rest = segments.slice(1).join('/');
    return rest ? `/${rest}` : '/';
  }

  return url.pathname;
}
