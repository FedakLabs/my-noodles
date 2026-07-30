'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useOpenSupportSession } from '@/api/support';
import { usePathname } from '@/i18n/navigation';
import { getApiErrorCode } from '@/shared/api-error';

import { useTawkSupportChat, type TawkSupportChatSession } from './providers/tawk-support-chat';

export type SupportChatStatus = 'idle' | 'loading' | 'ready' | 'error';

export type UseSupportChatResult = {
  status: SupportChatStatus;
  retry: () => void;
};

type UseSupportChatOptions = {
  /** When false, conceal the Tawk widget (immersive routes). */
  enabled: boolean;
};

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 500;
const VISITOR_SESSION_RETRY_DELAY_MS = 1000;

/** Boots Tawk with support-session login; chip while loading / on error. */
export function useSupportChat({ enabled }: UseSupportChatOptions): UseSupportChatResult {
  const pathname = usePathname();
  const provider = useTawkSupportChat();
  const openSession = useOpenSupportSession();
  const [status, setStatus] = useState<SupportChatStatus>('idle');
  const [retryToken, setRetryToken] = useState(0);
  const sessionRef = useRef<TawkSupportChatSession | null>(null);
  const runIdRef = useRef(0);
  const bootstrappedRef = useRef(false);

  const retry = useCallback(() => {
    runIdRef.current += 1;
    bootstrappedRef.current = false;
    sessionRef.current = null;
    setRetryToken((token) => token + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      runIdRef.current += 1;
      provider.conceal();
      setStatus('idle');
      return;
    }

    if (bootstrappedRef.current && sessionRef.current) {
      provider.reveal();
      setStatus('ready');
      return;
    }

    const runId = ++runIdRef.current;
    setStatus('loading');

    const abortController = new AbortController();
    let delayTimeoutId: ReturnType<typeof setTimeout> | undefined;

    void (async () => {
      let lastError: unknown;

      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        if (runId !== runIdRef.current || abortController.signal.aborted) {
          return;
        }

        if (attempt > 0) {
          const isVisitorNotFound = getApiErrorCode(lastError) === 'visitor_session_not_found';
          const delay = isVisitorNotFound ? VISITOR_SESSION_RETRY_DELAY_MS : RETRY_DELAY_MS;
          await new Promise<void>((resolve) => {
            delayTimeoutId = setTimeout(resolve, delay);
          });
          if (runId !== runIdRef.current || abortController.signal.aborted) {
            return;
          }
        }

        try {
          const session = await openSession.openSupportSessionAsync();
          if (runId !== runIdRef.current || abortController.signal.aborted) {
            return;
          }

          sessionRef.current = {
            visitorSessionId: session.visitorSessionId,
            sessionHash: session.sessionHash,
            propertyId: session.propertyId,
            widgetId: session.widgetId,
          };

          await provider.connect(sessionRef.current, { signal: abortController.signal });
          if (runId !== runIdRef.current || abortController.signal.aborted) {
            return;
          }

          bootstrappedRef.current = true;
          setStatus('ready');
          return;
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') {
            return;
          }
          if (runId !== runIdRef.current || abortController.signal.aborted) {
            return;
          }
          lastError = error;
        }
      }

      console.error('[support-chat] bootstrap failed after', MAX_ATTEMPTS, 'attempts', lastError);
      bootstrappedRef.current = false;
      setStatus('error');
    })();

    return () => {
      abortController.abort();
      if (delayTimeoutId !== undefined) {
        clearTimeout(delayTimeoutId);
      }
      if (runId === runIdRef.current) {
        runIdRef.current += 1;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional enable/path/retry gate
  }, [enabled, pathname, retryToken]);

  return {
    status,
    retry,
  };
}
