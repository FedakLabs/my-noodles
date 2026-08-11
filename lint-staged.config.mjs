const quote = (files) => files.map((f) => `"${f}"`).join(' ');

/** Skip generated paths — oxlint/oxfmt ignore them and fail with "no files". */
const lintable = (files) => files.filter((f) => !f.includes('/generated/'));

const code =
  (dir) =>
  (files) => {
    const forTools = lintable(files);
    if (forTools.length === 0) {
      return [];
    }
    return [`pnpm -C ${dir} exec oxlint --fix ${quote(forTools)}`, `oxfmt ${quote(forTools)}`];
  };

export default {
  'apps/web/**/*.{ts,tsx}': code('apps/web'),
  'apps/admin/**/*.{ts,tsx}': code('apps/admin'),
  'apps/api/**/*.ts': code('apps/api'),
  'packages/ui/**/*.{ts,tsx}': code('packages/ui'),
  'packages/theme/**/*.{ts,tsx}': code('packages/theme'),
  'packages/api-clients/**/*.ts': code('packages/api-clients'),
  'packages/integration-api-clients/**/*.ts': code('packages/integration-api-clients'),
  'packages/utils/**/*.ts': code('packages/utils'),
  'libs/web/**/*.{ts,tsx}': code('libs/web'),
  'libs/api/**/*.ts': code('libs/api'),
  'libs/locale/**/*.ts': code('libs/locale'),
  'libs/translit/**/*.ts': code('libs/translit'),
  '**/*.{json,md,mdx,yml,yaml,css,html}': (files) => `oxfmt ${quote(files)}`,
};
