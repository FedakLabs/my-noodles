'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useOpenSupportSession } from '@/api/support';
import { usePathname } from '@/i18n/navigation';
import { getApiErrorCode } from '@/shared/api-error';

import { useTawkSupportChat } from './providers/tawk-support-chat';

type SupportChatSession = {
  visitorSessionId: string;
  sessionHash: string;
};

export type SupportChatStatus = 'idle' | 'loading' | 'ready' | 'error';

export type UseSupportChatResult = {
  isConfigured: boolean;
  status: SupportChatStatus;
  retry: () => void;
};

type UseSupportChatOptions = {
  /** When false, conceal the Tawk widget (immersive routes). */
  enabled: boolean;
};

const VISITOR_SESSION_RETRY_MS = 1000;

/** Boots Tawk silently; exposes status for a calm corner chip while loading / on error. */
export function useSupportChat({ enabled }: UseSupportChatOptions): UseSupportChatResult {
  const pathname = usePathname();
  const provider = useTawkSupportChat();
  const openSession = useOpenSupportSession();
  const [status, setStatus] = useState<SupportChatStatus>('idle');
  const [retryToken, setRetryToken] = useState(0);
  const sessionRef = useRef<SupportChatSession | null>(null);
  const runIdRef = useRef(0);
  const bootstrappedRef = useRef(false);
  const inFlightRef = useRef(false);

  const retry = useCallback(() => {
    runIdRef.current += 1;
    bootstrappedRef.current = false;
    sessionRef.current = null;
    inFlightRef.current = false;
    setRetryToken((token) => token + 1);
  }, []);

  useEffect(() => {
    if (!provider.isConfigured) {
      setStatus('idle');
      return;
    }

    if (!enabled) {
      runIdRef.current += 1;
      inFlightRef.current = false;
      provider.conceal();
      setStatus('idle');
      return;
    }

    if (bootstrappedRef.current && sessionRef.current) {
      provider.reveal();
      setStatus('ready');
      return;
    }

    if (inFlightRef.current) {
      return;
    }

    const runId = ++runIdRef.current;
    inFlightRef.current = true;
    setStatus('loading');

    let retryTimeoutId: ReturnType<typeof setTimeout> | undefined;
    let settleRetryWait: (() => void) | undefined;

    const waitForVisitorSession = () =>
      new Promise<void>((resolve) => {
        settleRetryWait = resolve;
        retryTimeoutId = setTimeout(() => {
          settleRetryWait = undefined;
          resolve();
        }, VISITOR_SESSION_RETRY_MS);
      });

    void (async () => {
      try {
        for (;;) {
          try {
            const session = await openSession.openSupportSessionAsync();
            if (runId !== runIdRef.current) {
              return;
            }

            sessionRef.current = {
              visitorSessionId: session.visitorSessionId,
              sessionHash: session.sessionHash,
            };

            await provider.connect(sessionRef.current);
            if (runId !== runIdRef.current) {
              return;
            }

            provider.reveal();
            bootstrappedRef.current = true;
            setStatus('ready');
            return;
          } catch (error) {
            if (runId !== runIdRef.current) {
              return;
            }

            if (getApiErrorCode(error) === 'visitor_session_not_found') {
              await waitForVisitorSession();
              if (runId !== runIdRef.current) {
                return;
              }
              continue;
            }

            console.error('[support-chat] bootstrap failed', error);
            bootstrappedRef.current = false;
            setStatus('error');
            return;
          }
        }
      } finally {
        if (runId === runIdRef.current) {
          inFlightRef.current = false;
        }
      }
    })();

    return () => {
      if (retryTimeoutId !== undefined) {
        clearTimeout(retryTimeoutId);
      }
      settleRetryWait?.();
      if (runId === runIdRef.current) {
        runIdRef.current += 1;
        inFlightRef.current = false;
      }
    };
    // pathname / retryToken: re-attempt after navigation or explicit retry.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional enable/path/retry gate
  }, [enabled, pathname, provider.isConfigured, retryToken]);

  return {
    isConfigured: provider.isConfigured,
    status,
    retry,
  };
}
