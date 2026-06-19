import { useTranslations } from 'next-intl';

export function HomeScreen() {
  const t = useTranslations('home');

  return (
    <main>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </main>
  );
}
