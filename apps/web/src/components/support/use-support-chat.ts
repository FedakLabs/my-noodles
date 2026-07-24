'use client';

import { useEffect, useRef, useState } from 'react';

import { useOpenSupportSession } from '@/api/support';
import { usePathname } from '@/i18n/navigation';

import { useTawkSupportChat } from './providers/tawk-support-chat';

type SupportChatSession = {
  visitorSessionId: string;
  sessionHash: string;
};

export type SupportChatStatus = 'idle' | 'loading' | 'ready' | 'error';

export type UseSupportChatResult = {
  isConfigured: boolean;
  status: SupportChatStatus;
};

type UseSupportChatOptions = {
  /** When false, conceal the Tawk widget (home / immersive routes). */
  enabled: boolean;
};

/** Boots Tawk silently; exposes error status for a calm corner indicator. */
export function useSupportChat({ enabled }: UseSupportChatOptions): UseSupportChatResult {
  const pathname = usePathname();
  const provider = useTawkSupportChat();
  const openSession = useOpenSupportSession();
  const [status, setStatus] = useState<SupportChatStatus>('idle');
  const sessionRef = useRef<SupportChatSession | null>(null);
  const runIdRef = useRef(0);
  const bootstrappedRef = useRef(false);
  const inFlightRef = useRef(false);

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
        setStatus('ready');
      } catch (error) {
        if (runId !== runIdRef.current) {
          return;
        }
        console.error('[support-chat] bootstrap failed', error);
        bootstrappedRef.current = false;
        setStatus('error');
      } finally {
        if (runId === runIdRef.current) {
          inFlightRef.current = false;
        }
      }
    })();
    // pathname: re-attempt after navigation; reload remounts and boots again.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional enable/path gate
  }, [enabled, pathname, provider.isConfigured]);

  return {
    isConfigured: provider.isConfigured,
    status,
  };
}
