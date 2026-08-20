import { expect, test } from '@playwright/test';

import { CATALOG_VIEW_MODE_COOKIE } from '../src/components/catalog-view-mode/view-mode';
import { e2eLocale, uk } from './fixtures/uk-messages';

/** Mirrors `CONSENT_STORAGE_KEY` in `src/shared/analytics/consent.ts` (avoid importing that module — it pulls `@/` aliases Playwright can't resolve). */
const CONSENT_STORAGE_KEY = 'my-noodles-analytics-consent';

test.describe('discovery funnel', () => {
  test.beforeEach(async ({ context, request }) => {
    await request.post('http://localhost:3001/api/e2e/reset');
    await context.addCookies([
      {
        name: CATALOG_VIEW_MODE_COOKIE,
        value: 'infinite',
        url: 'http://localhost:3000',
      },
    ]);
    // Consent banner is fixed over the catalog ATC row in Desktop Chrome — preselect a choice so it stays out of the funnel path.
    await context.addInitScript((key) => {
      localStorage.setItem(key, 'denied');
    }, CONSENT_STORAGE_KEY);
  });

  test('catalog → cart → checkout → success → order', async ({ page }) => {
    const cartHydrated = page.waitForResponse(
      (response) =>
        response.url().includes('/api/cart') &&
        !response.url().includes('/api/cart/items') &&
        response.request().method() === 'GET' &&
        response.ok(),
    );
    await page.goto(`/${e2eLocale}/catalog`, { waitUntil: 'domcontentloaded' });
    await cartHydrated;

    await expect(page.getByRole('heading', { name: uk.catalog.title })).toBeVisible();
    await expect(page.getByRole('button', { name: /Pocky Matcha/ })).toBeVisible();

    const addToCartResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/api/cart/items') && response.request().method() === 'POST' && response.ok(),
    );
    await page.getByTestId('catalog-add-to-cart--pocky-matcha').click();
    await addToCartResponse;

    const cartDialog = page.getByRole('dialog');
    await expect(cartDialog.getByRole('heading', { name: uk.cart.title, exact: true })).toBeVisible();
    await expect(cartDialog.getByText('Pocky Matcha')).toBeVisible();

    await page.getByRole('button', { name: uk.cart.checkout }).click();
    await expect(page).toHaveURL(new RegExp(`\\/${e2eLocale}\\/checkout\\/[^/]+$`));
    await expect(page.getByRole('heading', { name: uk.checkout.title })).toBeVisible();

    await page.getByLabel(uk.checkout.fields.lastName).fill('Fedak');
    await page.getByLabel(uk.checkout.fields.firstName).fill('Andrii');
    await page.getByLabel(uk.checkout.fields.phone).fill('+380501112233');

    await page.getByLabel(uk.checkout.fields.city).fill('Київ');
    await page.getByRole('option', { name: 'Київ' }).click();

    await page.getByLabel(uk.checkout.fields.branch).fill('Від');
    await page.getByRole('option', { name: /Відділення №1/ }).click();

    await expect(page.getByText(uk.checkout.delivery.estimateLabel)).toBeVisible();

    await expect(page.getByTestId('checkout-submit')).toBeEnabled();
    await page.getByTestId('checkout-submit').click();

    await expect(page).toHaveURL(new RegExp(`\\/${e2eLocale}\\/checkout\\/[^/]+$`));
    await expect(page.getByRole('heading', { name: uk.checkout.success.title })).toBeVisible();

    const goToOrder = page.getByRole('link', { name: uk.checkout.success.goToOrder });
    await expect(goToOrder).toBeVisible();
    await expect(goToOrder).toHaveAttribute('href', new RegExp(`\\/${e2eLocale}\\/orders\\/`));

    await goToOrder.click();
    await expect(page).toHaveURL(new RegExp(`\\/${e2eLocale}\\/orders\\/[^/]+$`));
    await expect(page.getByRole('heading', { name: uk.checkout.success.orderDetails })).toBeVisible();
    await expect(page.getByText('+380501112233')).toBeVisible();
    await expect(page.getByText('Київ', { exact: true })).toBeVisible();
    await expect(page.getByText('Pocky Matcha')).toBeVisible();
  });
});
