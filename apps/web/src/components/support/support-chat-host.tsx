'use client';

import { isImmersiveRoute } from '@/components/layout/site-nav-config';
import { usePathname } from '@/i18n/navigation';
import { APP_ROUTES } from '@/shared/routes';

import { useSupportChat } from './use-support-chat';

function isSupportRoute(pathname: string): boolean {
  return !isImmersiveRoute(pathname) && pathname !== APP_ROUTES.home;
}

/** Mounts Tawk bootstrap on support routes — native widget is the only UI. */
export function SupportChatHost() {
  const pathname = usePathname();
  useSupportChat({ enabled: isSupportRoute(pathname) });
  return null;
}
