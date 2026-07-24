'use client';

import { useRef, useState } from 'react';

import { useOpenSupportSession } from '@/api/support';

import { useTawkSupportChat } from './providers/tawk-support-chat';
import type { SupportChatPanelPhase } from './support-chat-panel';

type SupportChatSession = {
  visitorSessionId: string;
  sessionHash: string;
};

export type UseSupportChatResult = {
  isConfigured: boolean;
  /** Our shell open or provider chat maximized — drives FAB selected styling. */
  isActive: boolean;
  /** Independent open/close for the support shell (not tied to phase). */
  isOpen: boolean;
  panelPhase: SupportChatPanelPhase;
  toggle: () => void;
  close: () => void;
  retry: () => void;
};

/** Provider-agnostic support chat controller (session + connect + panel phases). */
export function useSupportChat(): UseSupportChatResult {
  const provider = useTawkSupportChat();
  const openSession = useOpenSupportSession();
  const [isOpen, setIsOpen] = useState(false);
  const [panelPhase, setPanelPhase] = useState<SupportChatPanelPhase>('loadingSession');
  const [chatReady, setChatReady] = useState(false);
  const sessionRef = useRef<SupportChatSession | null>(null);
  const runIdRef = useRef(0);

  const isActive = isOpen || provider.isOpen;
  const busy = panelPhase === 'loadingSession' || panelPhase === 'connecting';

  const close = () => {
    runIdRef.current += 1;
    setIsOpen(false);
  };

  const connectWithSession = async (session: SupportChatSession, runId: number) => {
    setPanelPhase('connecting');
    try {
      await provider.connect(session);
      if (runId !== runIdRef.current) {
        return;
      }
      provider.show();
      setChatReady(true);
      setIsOpen(false);
    } catch (error) {
      if (runId !== runIdRef.current) {
        return;
      }
      console.error('[support-chat] connect failed', error);
      setPanelPhase('connectError');
    }
  };

  const startOpenFlow = async () => {
    if (busy && isOpen) {
      return;
    }

    const runId = ++runIdRef.current;
    setIsOpen(true);
    setPanelPhase('loadingSession');

    try {
      const session = await openSession.openSupportSessionAsync();
      if (runId !== runIdRef.current) {
        return;
      }
      sessionRef.current = {
        visitorSessionId: session.visitorSessionId,
        sessionHash: session.sessionHash,
      };
      await connectWithSession(sessionRef.current, runId);
    } catch (error) {
      if (runId !== runIdRef.current) {
        return;
      }
      console.error('[support-chat] session failed', error);
      setPanelPhase('sessionError');
    }
  };

  const retry = () => {
    if (!isOpen || busy) {
      return;
    }

    if (panelPhase === 'connectError' && sessionRef.current) {
      const runId = ++runIdRef.current;
      void connectWithSession(sessionRef.current, runId);
      return;
    }

    void startOpenFlow();
  };

  const toggle = () => {
    if (isOpen) {
      close();
      return;
    }
    if (provider.isOpen) {
      provider.hide();
      return;
    }
    if (chatReady && sessionRef.current) {
      provider.show();
      return;
    }
    void startOpenFlow();
  };

  return {
    isConfigured: provider.isConfigured,
    isActive,
    isOpen,
    panelPhase,
    toggle,
    close,
    retry,
  };
}
