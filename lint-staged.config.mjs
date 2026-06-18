export default {
  '*.{json,md,css,yml,yaml}': 'prettier --write',
  '{apps,packages}/**/*.{ts,tsx,js,jsx,mjs,cjs}': ['prettier --write', 'eslint --fix --no-warn-ignored'],
  '*.{mjs,cjs}': 'prettier --write',
  'configs/**/*.mjs': 'prettier --write',
};
