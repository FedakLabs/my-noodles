import { resolve } from 'node:path';

import { config as loadDotenv } from 'dotenv';

export const NODE_ENVS = ['local', 'dev', 'prod'] as const;

export type NodeEnv = (typeof NODE_ENVS)[number];

export const DEFAULT_NODE_ENV: NodeEnv = 'local';

/**
 * Load env files in order (later overrides earlier):
 * 1. `.env` — shared defaults
 * 2. `.env.{NODE_ENV}` — e.g. `.env.local`, `.env.dev`, `.env.prod`
 * 3. `.env.local` — machine-specific secrets (gitignored)
 *
 * When `NODE_ENV=local`, steps 2 and 3 resolve to the same file (loaded once).
 */
export function loadAppEnv(cwd = process.cwd()): void {
  loadDotenv({ path: resolve(cwd, '.env') });

  const nodeEnv = process.env.NODE_ENV ?? DEFAULT_NODE_ENV;

  for (const filename of new Set([`.env.${nodeEnv}`, '.env.local'])) {
    loadDotenv({ path: resolve(cwd, filename), override: true });
  }
}
