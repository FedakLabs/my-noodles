'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { usePathname } from '@/i18n/navigation';

import { type SmoothBusyState, useSmoothBusyState } from './use-smooth-busy-state';

type NavigationPendingActions = {
  registerTransitionPending: (pending: boolean) => void;
};

const NavigationPendingActionsContext = createContext<NavigationPendingActions | null>(null);
const NavigationSmoothContext = createContext<SmoothBusyState | null>(null);

/** Safety net so an anchor click that never resolves to a new pathname (query-only/aborted) can't wedge the overlay. */
const LINK_PENDING_TIMEOUT_MS = 5_000;

function isInAppNavigationAnchor(anchor: HTMLAnchorElement): boolean {
  const href = anchor.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return false;
  }

  if (anchor.target === '_blank' || anchor.hasAttribute('download')) {
    return false;
  }

  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) {
    return false;
  }

  return !(
    url.pathname === window.location.pathname &&
    url.search === window.location.search &&
    url.hash === window.location.hash
  );
}

type NavigationPendingProviderProps = {
  children: ReactNode;
};

export function NavigationPendingProvider({ children }: NavigationPendingProviderProps) {
  const pathname = usePathname();
  const [linkOriginPathname, setLinkOriginPathname] = useState<string | null>(null);
  const [trackedPathname, setTrackedPathname] = useState(pathname);
  const transitionPendingCountRef = useRef(0);
  const [transitionPending, setTransitionPending] = useState(false);

  // Navigation resolved (route changed): clear the pending marker during render rather than in an
  // effect. This also prevents a stale origin from spuriously re-triggering on browser back/forward.
  if (pathname !== trackedPathname) {
    setTrackedPathname(pathname);
    if (linkOriginPathname !== null) {
      setLinkOriginPathname(null);
    }
  }

  const registerTransitionPending = useCallback((pending: boolean) => {
    transitionPendingCountRef.current = Math.max(0, transitionPendingCountRef.current + (pending ? 1 : -1));
    setTransitionPending(transitionPendingCountRef.current > 0);
  }, []);

  const linkPending = linkOriginPathname !== null && linkOriginPathname === pathname;

  // Safety net for navigations that never change the pathname (query-only/aborted) so the
  // blocking overlay can never wedge. The timeout callback keeps setState out of the effect body.
  useEffect(() => {
    if (linkOriginPathname === null) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setLinkOriginPathname(null), LINK_PENDING_TIMEOUT_MS);
    return () => window.clearTimeout(timeout);
  }, [linkOriginPathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement) || !isInAppNavigationAnchor(anchor)) {
        return;
      }

      setLinkOriginPathname(pathname);
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [pathname]);

  const rawPending = linkPending || transitionPending;
  const smoothBusy = useSmoothBusyState(rawPending);

  const actions = useMemo(() => ({ registerTransitionPending }), [registerTransitionPending]);

  return (
    <NavigationPendingActionsContext.Provider value={actions}>
      <NavigationSmoothContext.Provider value={smoothBusy}>{children}</NavigationSmoothContext.Provider>
    </NavigationPendingActionsContext.Provider>
  );
}

export function useNavigationPendingActions(): NavigationPendingActions {
  const context = useContext(NavigationPendingActionsContext);
  if (!context) {
    throw new Error('useNavigationPendingActions must be used within NavigationPendingProvider');
  }

  return context;
}

export function useNavigationSmoothBusy(): SmoothBusyState {
  const context = useContext(NavigationSmoothContext);
  if (!context) {
    throw new Error('useNavigationSmoothBusy must be used within NavigationPendingProvider');
  }

  return context;
}
