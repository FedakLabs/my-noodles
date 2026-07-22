import { getTranslations } from 'next-intl/server';

import { withPageLocale, withPageLocaleMetadata } from '@/i18n/app-locale/server';
import { HomeScreen } from '@/screens/home';
import type { LocalePageProps } from '@/shared/page-props';
import { buildPageMetadata } from '@/shared/seo';

export const generateMetadata = withPageLocaleMetadata<LocalePageProps>(async ({ locale }) => {
  const t = await getTranslations({ locale, namespace: 'home' });

  return buildPageMetadata({
    locale,
    title: t('title'),
    description: t('description'),
  });
});

function HomePage() {
  return <HomeScreen />;
}

export default withPageLocale(HomePage);
