import { getTranslations } from 'next-intl/server';

import { withPageLocale, withPageLocaleMetadata, type WithPageLocaleProps } from '@/i18n/app-locale/server';
import { CheckoutScreen } from '@/screens/checkout';
import type { LocalePageProps } from '@/shared/page-props';
import { buildPageMetadata, NOINDEX_ROBOTS } from '@/shared/seo';

type CheckoutPageProps = LocalePageProps<{ checkoutId: string }>;

export const generateMetadata = withPageLocaleMetadata<CheckoutPageProps>(async ({ locale }) => {
  const t = await getTranslations({ locale, namespace: 'checkout' });

  return buildPageMetadata({
    locale,
    pathname: '/checkout',
    title: t('title'),
    robots: NOINDEX_ROBOTS,
  });
});

function CheckoutPage({ params }: WithPageLocaleProps<CheckoutPageProps>) {
  return <CheckoutScreen checkoutId={params.checkoutId} />;
}

export default withPageLocale(CheckoutPage);
