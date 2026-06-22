import { defineConfig, mergeConfig } from 'vitest/config';
import type { UserConfig } from 'vite';

/** Default Vitest preset for packages — node env, co-located + tilde-prefixed tests. */
export const packageVitestConfig = defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts', 'src/**/~*.test.ts'],
    passWithNoTests: true,
  },
});

export function createBaseVitestConfig(overrides: UserConfig = {}) {
  return mergeConfig(packageVitestConfig, overrides);
}
