import { withPageLocale, type WithPageLocaleProps } from '@/i18n/app-locale/server';
import { permanentRedirect } from '@/i18n/navigation';
import type { LocalePageProps } from '@/shared/page-props';

function HomePage({ locale }: WithPageLocaleProps<LocalePageProps>) {
  return permanentRedirect({ href: '/catalog', locale });
}

export default withPageLocale(HomePage);
