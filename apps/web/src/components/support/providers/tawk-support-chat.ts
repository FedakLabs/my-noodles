'use client';

import { env } from '@/shared/env';

import { SUPPORT_CHAT_WIDGET_INSET } from '../support-chat-layout';

type TawkLoginPayload = {
  hash: string;
  userId: string;
  name?: string;
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
  customStyle?: TawkCustomStyle;
  showWidget?: () => void;
  hideWidget?: () => void;
  maximize?: () => void;
  minimize?: () => void;
  login?: (data: TawkLoginPayload, callback?: (error?: unknown) => void) => void;
  logout?: (callback?: (error?: unknown) => void) => void;
  onLoad?: () => void;
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

function applyTawkPlacement(api: TawkApi) {
  // Must be set before the embed script runs.
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

  const api = getTawkApi();
  applyTawkPlacement(api);

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
  // Stay hidden until secure login finishes — then reveal() shows the native bubble.
  ready.hideWidget?.();
  return ready;
}

function withTawkCallback(
  run: (callback: (error?: unknown) => void) => void,
  timeoutMs: number,
  timeoutMessage: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
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
      settleErr(new Error(timeoutMessage));
    }, timeoutMs);

    run((error) => {
      if (error) {
        settleErr(error);
        return;
      }
      settleOk();
    });
  });
}

/** Clear a prior visitor identity so a later `login` actually re-hits Tawk. */
async function logout(): Promise<void> {
  const api = getTawkApi();
  if (typeof api.logout !== 'function') {
    return;
  }

  try {
    await withTawkCallback(
      (callback) => {
        api.logout?.(callback);
      },
      TAWK_LOGIN_TIMEOUT_MS,
      'Tawk logout timed out',
    );
  } catch {
    // Visitor may never have been logged in after a failed first attempt.
  }
}

async function login(session: { visitorSessionId: string; sessionHash: string }): Promise<void> {
  const api = await ensureLoaded();

  if (typeof api.login !== 'function') {
    throw new Error('Tawk login is unavailable');
  }

  // Failed / stale login leaves Tawk in a state where a second `login()` is a no-op
  // (no network). Logout first so retry actually re-authenticates.
  await logout();

  await withTawkCallback(
    (callback) => {
      api.login?.(
        {
          userId: session.visitorSessionId,
          hash: session.sessionHash,
          name: session.visitorSessionId,
        },
        callback,
      );
    },
    TAWK_LOGIN_TIMEOUT_MS,
    'Tawk login timed out',
  );
}
/** Show the native bubble (unread / pending messages live here). */
function reveal(): void {
  getTawkApi().showWidget?.();
}

/** Hide entirely (e.g. immersive routes). */
function conceal(): void {
  const api = getTawkApi();
  api.minimize?.();
  api.hideWidget?.();
}

export type TawkSupportChat = {
  isConfigured: boolean;
  connect: (session: { visitorSessionId: string; sessionHash: string }) => Promise<void>;
  /** Show native launcher bubble after API + secure login are ready. */
  reveal: () => void;
  conceal: () => void;
};

/** Tawk provider surface — swap this hook in `use-support-chat.ts` to change vendors. */
export function useTawkSupportChat(): TawkSupportChat {
  return {
    isConfigured: isConfigured(),
    connect: login,
    reveal,
    conceal,
  };
}
