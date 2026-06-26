import { type Messages, ukMessages } from '../../src/i18n/messages';

/** Canonical locale fixture for Playwright smoke tests — import keys, not inline copy. */
export const uk = ukMessages satisfies Messages;

export const e2eLocale = 'uk' as const;
