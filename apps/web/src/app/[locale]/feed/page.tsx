import { getTranslations } from 'next-intl/server';

import { withPageLocale, withPageLocaleMetadata } from '@/i18n/app-locale/server';
import { FeedScreen } from '@/screens/feed';
import type { LocalePageProps } from '@/shared/page-props';
import { buildPageMetadata, NOINDEX_ROBOTS } from '@/shared/seo';

export const generateMetadata = withPageLocaleMetadata<LocalePageProps>(async ({ locale }) => {
  const t = await getTranslations({ locale, namespace: 'feed' });

  return buildPageMetadata({
    locale,
    pathname: '/feed',
    title: t('title'),
    description: t('metaDescription'),
    robots: NOINDEX_ROBOTS,
  });
});

function FeedPage() {
  return <FeedScreen />;
}

export default withPageLocale(FeedPage);
