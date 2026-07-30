'use client';

import { SUPPORT_CHAT_WIDGET_INSET } from '../support-chat-layout';

type TawkCallback = (error?: unknown) => void;

type TawkLoginPayload = {
  hash: string;
  userId: string;
};

type TawkVisibilityStyle = {
  position?: 'br' | 'bl' | 'cr' | 'cl' | 'tr' | 'tl';
  xOffset?: number | string;
  yOffset?: number | string;
};

type TawkCustomStyle = {
  zIndex?: number | string;
  visibility?: {
    desktop?: TawkVisibilityStyle;
    mobile?: TawkVisibilityStyle;
  };
};

type TawkApi = {
  autoStart?: boolean;
  login?: (data: TawkLoginPayload, callback?: TawkCallback) => void;
  minimize?: () => void;
  showWidget?: () => void;
  hideWidget?: () => void;
  onLoad?: () => void;
  customStyle?: TawkCustomStyle;
};

declare global {
  interface Window {
    Tawk_API?: TawkApi;
    Tawk_LoadStart?: Date;
  }
}

const TAWK_SCRIPT_ID = 'tawk-embed-script';
const TAWK_ONLOAD_TIMEOUT_MS = 15_000;
const TAWK_LOGIN_TIMEOUT_MS = 10_000;
const TAWK_LOGGED_IN_KEY = 'support-chat:logged-in-user';

export type TawkSupportChatSession = {
  visitorSessionId: string;
  sessionHash: string;
  propertyId: string;
  widgetId: string;
};

export type TawkSupportChatConnectOptions = {
  signal?: AbortSignal;
};

let loadPromise: Promise<void> | null = null;
let unloadMinimizeRegistered = false;

function getTawkApi(): TawkApi {
  window.Tawk_API ??= {};
  return window.Tawk_API;
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new DOMException('Tawk connect aborted', 'AbortError');
  }
}

function applyTawkPlacement(api: TawkApi) {
  api.customStyle = {
    ...api.customStyle,
    visibility: {
      desktop: {
        position: 'br',
        xOffset: SUPPORT_CHAT_WIDGET_INSET.right.desktop,
        yOffset: SUPPORT_CHAT_WIDGET_INSET.bottom.desktop,
      },
      mobile: {
        position: 'br',
        xOffset: SUPPORT_CHAT_WIDGET_INSET.right.mobile,
        yOffset: SUPPORT_CHAT_WIDGET_INSET.bottom.mobile,
      },
    },
  };
}

function registerUnloadMinimize(): void {
  if (unloadMinimizeRegistered) {
    return;
  }
  unloadMinimizeRegistered = true;

  const minimize = () => getTawkApi().minimize?.();
  window.addEventListener('pagehide', minimize);
  window.addEventListener('beforeunload', minimize);
}

function ensureLoaded(session: TawkSupportChatSession, signal?: AbortSignal): Promise<void> {
  if (loadPromise) {
    return loadPromise;
  }

  const api = getTawkApi();
  api.autoStart = true;
  applyTawkPlacement(api);
  registerUnloadMinimize();

  let scriptEl: HTMLScriptElement | null = null;

  loadPromise = new Promise<void>((resolve, reject) => {
    let settled = false;

    const cleanup = () => {
      window.clearTimeout(timeoutId);
      signal?.removeEventListener('abort', onAbort);
    };

    const succeed = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve();
    };

    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      cleanup();
      loadPromise = null;
      scriptEl?.remove();
      reject(error);
    };

    const onAbort = () => {
      fail(new DOMException('Tawk connect aborted', 'AbortError') as Error);
    };

    const timeoutId = window.setTimeout(() => {
      fail(new Error('Tawk widget failed to load'));
    }, TAWK_ONLOAD_TIMEOUT_MS);

    signal?.addEventListener('abort', onAbort, { once: true });
    if (signal?.aborted) {
      onAbort();
      return;
    }

    const previousOnLoad = api.onLoad;
    api.onLoad = () => {
      previousOnLoad?.();
      getTawkApi().minimize?.();
      succeed();
    };

    if (!document.getElementById(TAWK_SCRIPT_ID)) {
      window.Tawk_LoadStart = new Date();
      scriptEl = document.createElement('script');
      scriptEl.id = TAWK_SCRIPT_ID;
      scriptEl.async = true;
      scriptEl.src = `https://embed.tawk.to/${session.propertyId}/${session.widgetId}`;
      scriptEl.charset = 'UTF-8';
      scriptEl.setAttribute('crossorigin', '*');
      scriptEl.onerror = () => {
        fail(new Error('Tawk embed script failed to load'));
      };
      document.head.appendChild(scriptEl);
    }
  });

  return loadPromise;
}

function readPersistedUserId(): string | null {
  try {
    return localStorage.getItem(TAWK_LOGGED_IN_KEY);
  } catch {
    return null;
  }
}

function persistUserId(userId: string): void {
  try {
    localStorage.setItem(TAWK_LOGGED_IN_KEY, userId);
  } catch {
    // private-mode or storage quota
  }
}

function ensureLoggedIn(session: TawkSupportChatSession, signal?: AbortSignal): Promise<void> {
  if (readPersistedUserId() === session.visitorSessionId) {
    return Promise.resolve();
  }

  const api = getTawkApi();
  if (typeof api.login !== 'function') {
    return Promise.reject(new Error('Tawk login is unavailable'));
  }

  return new Promise((resolve, reject) => {
    let settled = false;

    const cleanup = () => {
      window.clearTimeout(timeoutId);
      signal?.removeEventListener('abort', onAbort);
    };

    const succeed = () => {
      if (settled) return;
      settled = true;
      cleanup();
      persistUserId(session.visitorSessionId);
      resolve();
    };

    const fail = (error: unknown) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error instanceof Error ? error : new Error(String(error)));
    };

    const onAbort = () => {
      fail(new DOMException('Tawk connect aborted', 'AbortError'));
    };

    const timeoutId = window.setTimeout(() => {
      fail(new Error('Tawk login timed out'));
    }, TAWK_LOGIN_TIMEOUT_MS);

    signal?.addEventListener('abort', onAbort, { once: true });
    if (signal?.aborted) {
      onAbort();
      return;
    }

    api.login?.({ userId: session.visitorSessionId, hash: session.sessionHash }, (error) => {
      if (error) {
        fail(error);
      } else {
        succeed();
      }
    });
  });
}

async function connect(
  session: TawkSupportChatSession,
  options?: TawkSupportChatConnectOptions,
): Promise<void> {
  const { signal } = options ?? {};
  await ensureLoaded(session, signal);
  throwIfAborted(signal);
  await ensureLoggedIn(session, signal);
  throwIfAborted(signal);
  const api = getTawkApi();
  api.minimize?.();
  api.showWidget?.();
}

function reveal(): void {
  const api = getTawkApi();
  api.minimize?.();
  api.showWidget?.();
}

function conceal(): void {
  const api = getTawkApi();
  api.minimize?.();
  api.hideWidget?.();
}

export type TawkSupportChat = {
  connect: (session: TawkSupportChatSession, options?: TawkSupportChatConnectOptions) => Promise<void>;
  reveal: () => void;
  conceal: () => void;
};

export function useTawkSupportChat(): TawkSupportChat {
  return {
    connect,
    reveal,
    conceal,
  };
}
