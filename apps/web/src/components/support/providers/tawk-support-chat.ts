'use client';

import { useEffect, useState } from 'react';

import { env } from '@/shared/env';

type TawkLoginPayload = {
  hash: string;
  userId: string;
  name?: string;
};

type TawkApi = {
  hideWidget?: () => void;
  maximize?: () => void;
  minimize?: () => void;
  login?: (data: TawkLoginPayload, callback?: (error?: unknown) => void) => void;
  onLoad?: () => void;
  onChatMaximized?: () => void;
  onChatMinimized?: () => void;
};

declare global {
  interface Window {
    Tawk_API?: TawkApi;
    Tawk_LoadStart?: Date;
  }
}

const TAWK_SCRIPT_ID = 'tawk-embed-script';
const TAWK_READY_TIMEOUT_MS = 15_000;
const TAWK_LOGIN_TIMEOUT_MS = 3_000;

function getTawkApi(): TawkApi {
  window.Tawk_API ??= {};
  return window.Tawk_API;
}

function isConfigured(): boolean {
  return Boolean(env.NEXT_PUBLIC_TAWK_PROPERTY_ID && env.NEXT_PUBLIC_TAWK_WIDGET_ID);
}

function isTawkReady(api: TawkApi): boolean {
  return typeof api.login === 'function' && typeof api.maximize === 'function';
}

function waitForTawkReady(): Promise<TawkApi> {
  return new Promise((resolve, reject) => {
    const api = getTawkApi();
    if (isTawkReady(api)) {
      resolve(api);
      return;
    }

    const startedAt = Date.now();
    let settled = false;
    let pollId = 0;

    const finish = (readyApi: TawkApi) => {
      if (settled) {
        return;
      }
      settled = true;
      window.clearInterval(pollId);
      resolve(readyApi);
    };

    const fail = (error: Error) => {
      if (settled) {
        return;
      }
      settled = true;
      window.clearInterval(pollId);
      reject(error);
    };

    const previousOnLoad = api.onLoad;
    api.onLoad = () => {
      previousOnLoad?.();
      const readyApi = getTawkApi();
      if (isTawkReady(readyApi)) {
        finish(readyApi);
      }
    };

    pollId = window.setInterval(() => {
      const readyApi = getTawkApi();
      if (isTawkReady(readyApi)) {
        finish(readyApi);
        return;
      }

      if (Date.now() - startedAt > TAWK_READY_TIMEOUT_MS) {
        fail(new Error('Tawk widget failed to load'));
      }
    }, 50);
  });
}

async function ensureLoaded(): Promise<TawkApi> {
  if (!isConfigured()) {
    throw new Error('Tawk is not configured');
  }

  const propertyId = env.NEXT_PUBLIC_TAWK_PROPERTY_ID!;
  const widgetId = env.NEXT_PUBLIC_TAWK_WIDGET_ID!;

  getTawkApi();

  if (!document.getElementById(TAWK_SCRIPT_ID)) {
    window.Tawk_LoadStart = new Date();
    const script = document.createElement('script');
    script.id = TAWK_SCRIPT_ID;
    script.async = true;
    script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    document.head.appendChild(script);
  }

  const ready = await waitForTawkReady();
  ready.hideWidget?.();
  return ready;
}

async function login(session: { visitorSessionId: string; sessionHash: string }): Promise<void> {
  const api = await ensureLoaded();

  await new Promise<void>((resolve, reject) => {
    if (typeof api.login !== 'function') {
      reject(new Error('Tawk login is unavailable'));
      return;
    }

    let settled = false;
    const settleOk = () => {
      if (settled) {
        return;
      }
      settled = true;
      window.clearTimeout(timeoutId);
      resolve();
    };
    const settleErr = (error: unknown) => {
      if (settled) {
        return;
      }
      settled = true;
      window.clearTimeout(timeoutId);
      reject(error instanceof Error ? error : new Error(String(error)));
    };

    const timeoutId = window.setTimeout(() => {
      settleOk();
    }, TAWK_LOGIN_TIMEOUT_MS);

    api.login(
      {
        userId: session.visitorSessionId,
        hash: session.sessionHash,
        name: session.visitorSessionId,
      },
      (error) => {
        if (error) {
          settleErr(error);
          return;
        }
        settleOk();
      },
    );
  });

  api.hideWidget?.();
}

function show(): void {
  const api = getTawkApi();
  api.hideWidget?.();
  api.maximize?.();
}

function hide(): void {
  const api = getTawkApi();
  api.minimize?.();
  api.hideWidget?.();
}

export type TawkSupportChat = {
  isConfigured: boolean;
  isOpen: boolean;
  connect: (session: { visitorSessionId: string; sessionHash: string }) => Promise<void>;
  show: () => void;
  hide: () => void;
};

/** Tawk provider surface — swap this hook in `use-support-chat.ts` to change vendors. */
export function useTawkSupportChat(): TawkSupportChat {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const api = getTawkApi();
    const previousMaximized = api.onChatMaximized;
    const previousMinimized = api.onChatMinimized;

    api.onChatMaximized = () => {
      previousMaximized?.();
      setIsOpen(true);
    };
    api.onChatMinimized = () => {
      previousMinimized?.();
      setIsOpen(false);
    };

    return () => {
      api.onChatMaximized = previousMaximized;
      api.onChatMinimized = previousMinimized;
    };
  }, []);

  return {
    isConfigured: isConfigured(),
    isOpen,
    connect: login,
    show: () => {
      show();
      setIsOpen(true);
    },
    hide: () => {
      hide();
      setIsOpen(false);
    },
  };
}
