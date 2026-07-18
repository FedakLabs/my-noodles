import { getTranslations } from 'next-intl/server';

import { withPageLocale, withPageLocaleMetadata } from '@/i18n/app-locale/server';
import { CheckoutSuccessScreen } from '@/screens/checkout-success';
import type { LocalePageProps } from '@/shared/page-props';
import { buildPageMetadata, NOINDEX_ROBOTS } from '@/shared/seo';

export const generateMetadata = withPageLocaleMetadata<LocalePageProps>(async ({ locale }) => {
  const t = await getTranslations({ locale, namespace: 'checkout.success' });

  return buildPageMetadata({
    locale,
    pathname: '/checkout/success',
    title: t('title'),
    description: t('description'),
    robots: NOINDEX_ROBOTS,
  });
});

function CheckoutSuccessPage() {
  return <CheckoutSuccessScreen />;
}

export default withPageLocale(CheckoutSuccessPage);
