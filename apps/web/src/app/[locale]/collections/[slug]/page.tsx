import { redirect } from 'next/navigation';

import { withPageLocale } from '@/i18n/app-locale/server';
import type { LocalePageProps } from '@/shared/page-props';
import { APP_ROUTES } from '@/shared/routes';

type CollectionPageProps = LocalePageProps<{ slug: string }>;

function CollectionPage(): never {
  redirect(APP_ROUTES.collections);
}

export default withPageLocale<CollectionPageProps>(CollectionPage);
