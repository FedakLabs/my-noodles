export function isFeedRoute(pathname: string): boolean {
  return pathname === '/feed' || pathname.startsWith('/feed/');
}
