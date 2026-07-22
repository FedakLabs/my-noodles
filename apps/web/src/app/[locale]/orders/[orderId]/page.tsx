import { getTranslations } from 'next-intl/server';

import { withPageLocale, withPageLocaleMetadata, type WithPageLocaleProps } from '@/i18n/app-locale/server';
import { OrderScreen } from '@/screens/orders';
import type { LocalePageProps } from '@/shared/page-props';
import { buildPageMetadata, NOINDEX_ROBOTS } from '@/shared/seo';

type OrderPageProps = LocalePageProps<{ orderId: string }>;

export const generateMetadata = withPageLocaleMetadata<OrderPageProps>(async ({ locale }) => {
  const t = await getTranslations({ locale, namespace: 'order' });

  return buildPageMetadata({
    locale,
    pathname: '/orders',
    title: t('title'),
    robots: NOINDEX_ROBOTS,
  });
});

function OrderPage({ params }: WithPageLocaleProps<OrderPageProps>) {
  return <OrderScreen orderId={params.orderId} />;
}

export default withPageLocale(OrderPage);
