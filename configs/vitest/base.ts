import type { UserConfig } from 'vite';
import { defineConfig, mergeConfig } from 'vitest/config';

/** Default Vitest preset for packages — node env, co-located `*.test.ts` / `*.spec.ts`. */
export const packageVitestConfig = defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    passWithNoTests: true,
  },
});

export function createBaseVitestConfig(overrides: UserConfig = {}) {
  return mergeConfig(packageVitestConfig, overrides);
}
