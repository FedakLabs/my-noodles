'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { ShareMenu } from '@/components/share-menu/share-menu';
import { useAppLocale } from '@/hooks/locale';
import { absoluteUrl, localePath } from '@/shared/seo/urls';

type ProductShareMenuProps = {
  productName: string;
  productSlug: string;
  iconSize?: number;
};

export function ProductShareMenu({ productName, productSlug, iconSize = 20 }: ProductShareMenuProps) {
  const t = useTranslations('product');
  const locale = useAppLocale();

  const shareUrl = useMemo(
    () => absoluteUrl(localePath(locale, `/product/${productSlug}`)),
    [locale, productSlug],
  );

  return (
    <ShareMenu
      shareUrl={shareUrl}
      shareTitle={productName}
      shareText={t('shareText', { name: productName })}
      ariaLabel={t('share')}
      iconSize={iconSize}
    />
  );
}
