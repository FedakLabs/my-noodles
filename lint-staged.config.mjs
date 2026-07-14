const quote = (files) => files.map((f) => `"${f}"`).join(' ');

const code =
  (dir, typeAware = false) =>
  (files) => [
    `pnpm -C ${dir} exec oxlint ${typeAware ? '--type-aware ' : ''}--fix ${quote(files)}`,
    `oxfmt ${quote(files)}`,
  ];

export default {
  'apps/web/**/*.{ts,tsx}': code('apps/web', true),
  'apps/api/**/*.ts': code('apps/api', true),
  'packages/ui/**/*.{ts,tsx}': code('packages/ui'),
  'packages/theme/**/*.{ts,tsx}': code('packages/theme'),
  'packages/api-clients/**/*.ts': code('packages/api-clients'),
  'packages/utils/**/*.ts': code('packages/utils'),
  'libs/web/**/*.{ts,tsx}': code('libs/web'),
  'libs/api/**/*.ts': code('libs/api'),
  '**/*.{json,md,mdx,yml,yaml,css,html}': (files) => `oxfmt ${quote(files)}`,
};
