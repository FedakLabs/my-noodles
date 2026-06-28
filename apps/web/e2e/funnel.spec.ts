import { expect, test } from '@playwright/test';

import { CATALOG_VIEW_MODE_COOKIE } from '../src/components/catalog-view-mode/view-mode';
import { testIds } from '../src/tests/test-ids';
import { e2eLocale, uk } from './fixtures/uk-messages';

test.describe('discovery funnel', () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: CATALOG_VIEW_MODE_COOKIE,
        value: 'infinite',
        url: 'http://localhost:3000',
      },
    ]);
  });

  test('catalog → cart → checkout → success', async ({ page }) => {
    await page.goto(`/${e2eLocale}/catalog`, { waitUntil: 'networkidle' });

    await expect(page.getByRole('heading', { name: uk.catalog.title })).toBeVisible();
    await expect(page.getByRole('link', { name: /Pocky Matcha/ }).first()).toBeVisible();

    await page.getByTestId(testIds.catalog.addToCart('pocky-matcha')).click();

    await expect(page.getByRole('heading', { name: uk.cart.title, exact: true })).toBeVisible();
    await expect(page.getByRole('dialog').getByText('Pocky Matcha')).toBeVisible();

    await page.getByRole('button', { name: uk.cart.checkout }).click();
    await expect(page).toHaveURL(new RegExp(`\\/${e2eLocale}\\/checkout\\/[^/]+$`));
    await expect(page.getByRole('heading', { name: uk.checkout.title })).toBeVisible();

    await page.getByLabel(uk.checkout.fields.lastName).fill('Fedak');
    await page.getByLabel(uk.checkout.fields.firstName).fill('Andrii');
    await page.getByLabel(uk.checkout.fields.phone).fill('+380501112233');

    await page.getByLabel(uk.checkout.fields.city).fill('Ки');
    await page.getByRole('option', { name: 'Київ' }).click();

    await page.getByLabel(uk.checkout.fields.branch).click();
    await page.getByRole('option', { name: /Відділення №1/ }).click();

    await expect(page.getByText(/Орієнтовна доставка/)).toBeVisible();

    await page.getByTestId(testIds.checkout.submit).click();

    await expect(page).toHaveURL(new RegExp(`\\/${e2eLocale}\\/checkout\\/success$`));
    await expect(page.getByRole('heading', { name: uk.checkout.success.title })).toBeVisible();
  });
});
