'use client';

import { useEffect, useRef } from 'react';

import { useOpenSupportSession } from '@/api/support';

import { useTawkSupportChat } from './providers/tawk-support-chat';

type SupportChatSession = {
  visitorSessionId: string;
  sessionHash: string;
};

type UseSupportChatOptions = {
  /** When false, conceal the Tawk widget (home / immersive routes). */
  enabled: boolean;
};

/** Boots Tawk silently, then leaves the native widget as the only UI. */
export function useSupportChat({ enabled }: UseSupportChatOptions): void {
  const provider = useTawkSupportChat();
  const openSession = useOpenSupportSession();
  const sessionRef = useRef<SupportChatSession | null>(null);
  const runIdRef = useRef(0);
  const bootstrappedRef = useRef(false);
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (!provider.isConfigured) {
      return;
    }

    if (!enabled) {
      runIdRef.current += 1;
      inFlightRef.current = false;
      provider.conceal();
      return;
    }

    if (bootstrappedRef.current && sessionRef.current) {
      provider.reveal();
      return;
    }

    if (inFlightRef.current) {
      return;
    }

    const runId = ++runIdRef.current;
    inFlightRef.current = true;

    void (async () => {
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
      } catch (error) {
        if (runId !== runIdRef.current) {
          return;
        }
        console.error('[support-chat] bootstrap failed', error);
      } finally {
        if (runId === runIdRef.current) {
          inFlightRef.current = false;
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount/enable gate
  }, [enabled, provider.isConfigured]);
}
