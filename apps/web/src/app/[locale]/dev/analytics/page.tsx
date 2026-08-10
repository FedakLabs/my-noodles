import { notFound } from 'next/navigation';

import { withPageLocale } from '@/i18n/app-locale/server';
import { DevAnalyticsScreen } from '@/screens/dev-analytics';

function DevAnalyticsPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return <DevAnalyticsScreen />;
}

export default withPageLocale(DevAnalyticsPage);
