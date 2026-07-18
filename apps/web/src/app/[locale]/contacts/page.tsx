import { getTranslations } from 'next-intl/server';

import { withPageLocale, withPageLocaleMetadata } from '@/i18n/app-locale/server';
import { ContactsScreen } from '@/screens/contacts';
import type { LocalePageProps } from '@/shared/page-props';
import { buildPageMetadata } from '@/shared/seo';

export const generateMetadata = withPageLocaleMetadata<LocalePageProps>(async ({ locale }) => {
  const t = await getTranslations({ locale, namespace: 'contacts' });

  return buildPageMetadata({
    locale,
    pathname: '/contacts',
    title: t('title'),
    description: t('description'),
  });
});

function ContactsPage() {
  return <ContactsScreen />;
}

export default withPageLocale(ContactsPage);
