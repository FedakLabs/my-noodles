'use client';

import {
  type BusyAreaState,
  SMOOTH_TRANSITION_EASING,
  SMOOTH_TRANSITION_MS,
  useBusyAreaState,
} from '@my-noodles/ui';
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
import { pathnameFromUrl } from '@/i18n/pathname-from-url';

type NavigationPendingActions = {
  registerTransitionPending: (pending: boolean) => void;
};

const NavigationPendingActionsContext = createContext<NavigationPendingActions | null>(null);
const NavigationSmoothContext = createContext<BusyAreaState | null>(null);
const NavigationRawPendingContext = createContext(false);

const LINK_PENDING_TIMEOUT_MS = 5_000;
const LINK_CLICK_DRAG_THRESHOLD_PX = 8;

function isInAppNavigationAnchor(anchor: HTMLAnchorElement, currentPathname: string): boolean {
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

  const destinationPathname = pathnameFromUrl(url);

  return !(
    destinationPathname === currentPathname &&
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

  useEffect(() => {
    if (linkOriginPathname === null) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setLinkOriginPathname(null), LINK_PENDING_TIMEOUT_MS);
    return () => window.clearTimeout(timeout);
  }, [linkOriginPathname]);

  useEffect(() => {
    let pointerOrigin: { x: number; y: number } | null = null;
    let pointerTravelPx = 0;

    const resetPointerTracking = () => {
      pointerOrigin = null;
      pointerTravelPx = 0;
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) {
        return;
      }

      pointerOrigin = { x: event.clientX, y: event.clientY };
      pointerTravelPx = 0;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!pointerOrigin) {
        return;
      }

      const travel = Math.hypot(event.clientX - pointerOrigin.x, event.clientY - pointerOrigin.y);
      pointerTravelPx = Math.max(pointerTravelPx, travel);
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) {
        resetPointerTracking();
        return;
      }

      if (pointerTravelPx > LINK_CLICK_DRAG_THRESHOLD_PX) {
        resetPointerTracking();
        return;
      }

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        resetPointerTracking();
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        resetPointerTracking();
        return;
      }

      const anchor = target.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement) || !isInAppNavigationAnchor(anchor, pathname)) {
        resetPointerTracking();
        return;
      }

      const destinationPathname = pathnameFromUrl(new URL(anchor.href, window.location.href));
      if (destinationPathname === pathname) {
        resetPointerTracking();
        return;
      }

      resetPointerTracking();
      setLinkOriginPathname(pathname);
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('pointermove', onPointerMove, true);
    document.addEventListener('pointercancel', resetPointerTracking, true);
    document.addEventListener('click', onClick, true);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('pointermove', onPointerMove, true);
      document.removeEventListener('pointercancel', resetPointerTracking, true);
      document.removeEventListener('click', onClick, true);
    };
  }, [pathname]);

  const rawPending = linkPending || transitionPending;
  const smoothBusy = useBusyAreaState(rawPending, {
    minVisibleMs: 0,
    transitionMs: SMOOTH_TRANSITION_MS,
    transitionEasing: SMOOTH_TRANSITION_EASING,
  });

  const actions = useMemo(() => ({ registerTransitionPending }), [registerTransitionPending]);

  return (
    <NavigationPendingActionsContext.Provider value={actions}>
      <NavigationRawPendingContext.Provider value={rawPending}>
        <NavigationSmoothContext.Provider value={smoothBusy}>{children}</NavigationSmoothContext.Provider>
      </NavigationRawPendingContext.Provider>
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

export function useNavigationSmoothBusy(): BusyAreaState {
  const context = useContext(NavigationSmoothContext);
  if (!context) {
    throw new Error('useNavigationSmoothBusy must be used within NavigationPendingProvider');
  }

  return context;
}

export function useNavigationRawPending(): boolean {
  const context = useContext(NavigationRawPendingContext);
  if (context === null) {
    throw new Error('useNavigationRawPending must be used within NavigationPendingProvider');
  }

  return context;
}
