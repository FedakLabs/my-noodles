/** Stable automation hooks for e2e — not a substitute for roles/labels in component tests. */
export const testIds = {
  catalog: {
    addToCart: (slug: string) => `catalog-add-to-cart--${slug}`,
  },
  checkout: {
    submit: 'checkout-submit',
  },
} as const;
