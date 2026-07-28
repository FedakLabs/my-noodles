export const APP_ROUTES = {
  home: '/',
  catalog: '/catalog',
  feed: '/feed',
  collections: '/collections',
  contacts: '/contacts',
  product: (slug: string) => `/product/${slug}`,
} as const;

export function isFeedRoute(pathname: string): boolean {
  return pathname === '/feed' || pathname.startsWith('/feed/');
}
