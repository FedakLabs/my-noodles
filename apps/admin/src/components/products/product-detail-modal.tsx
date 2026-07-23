import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { pickLocalized, SUPPORTED_LOCALES, type Locale } from '@my-noodles/locale';
import {
  CopyButton,
  MediaGallery,
  type MediaGalleryItem,
  Modal,
  SelectField,
  useModal,
} from '@my-noodles/ui';
import { Link } from '@tanstack/react-router';
import { type ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useProduct } from '@/api/products';
import { DEFAULT_LOCALE } from '@/i18n/locales';
import { productsSearchHref } from '@/screens/products/search-params';
import { formatCurrency } from '@/utils/format-currency';

export type ProductDetailModalContentProps = {
  productId: string;
  /** When set, header shows a back arrow and footer primary action uses it. */
  onBack?: () => void;
};

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  if (value == null || value === '') {
    return null;
  }

  return (
    <Stack spacing={0.25}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
        {value}
      </Typography>
    </Stack>
  );
}

export function ProductDetailModalContent({ productId, onBack }: ProductDetailModalContentProps) {
  const { t } = useTranslation(['products', 'common']);
  const { close } = useModal();
  const { product, productIsLoading, productIsError } = useProduct(productId);
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  const mediaItems = useMemo<MediaGalleryItem[]>(() => {
    if (!product) {
      return [];
    }

    const name = pickLocalized(product.name, locale);
    const images: MediaGalleryItem[] = product.images.map((url) => ({
      type: 'image',
      url,
      alt: name,
    }));
    const videos: MediaGalleryItem[] = product.videos.map((url) => ({
      type: 'video',
      url,
      alt: name,
    }));
    return [...images, ...videos];
  }, [locale, product]);

  const title =
    product != null
      ? pickLocalized(product.name, locale) || t('products:detail.title')
      : t('products:detail.title');

  function handleBack() {
    if (onBack) {
      onBack();
      return;
    }
    close();
  }

  return (
    <>
      <Modal.Header title={title} onBack={onBack} backLabel={t('common:actions.back')} />
      <Modal.Body scrollable>
        {productIsLoading ? <Typography>{t('common:states.loading')}</Typography> : null}
        {productIsError || (!productIsLoading && !product) ? (
          <Typography color="error">{t('products:detail.notFound')}</Typography>
        ) : null}

        {product ? (
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <SelectField
                label={t('products:detail.language')}
                size="small"
                width={120}
                value={locale}
                onChange={(event) => setLocale(event.target.value as Locale)}
              >
                {SUPPORTED_LOCALES.map((value) => (
                  <MenuItem key={value} value={value}>
                    {value.toUpperCase()}
                  </MenuItem>
                ))}
              </SelectField>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', minWidth: 0 }}>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                  {t('products:detail.id')}
                </Typography>
                <Typography
                  component={Link}
                  to={productsSearchHref({ slug: product.slug })}
                  variant="body2"
                  color="primary"
                  title={t('products:detail.openInProducts')}
                  sx={{
                    textDecoration: 'underline',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {`${product.id.slice(0, 8)}…`}
                </Typography>
                <CopyButton
                  value={product.id}
                  label={t('common:actions.copy')}
                  copiedLabel={t('common:actions.copied')}
                />
              </Stack>
            </Stack>

            {mediaItems.length > 0 ? (
              <Box sx={{ width: '100%', maxWidth: 420 }}>
                <MediaGallery
                  items={mediaItems}
                  labels={{
                    gallery: t('products:detail.mediaGallery'),
                    previousSlide: t('products:detail.previousSlide'),
                    nextSlide: t('products:detail.nextSlide'),
                    slide: (index, total) => t('products:detail.slide', { index: index + 1, total }),
                  }}
                />
              </Box>
            ) : (
              <Typography color="text.secondary">{t('products:detail.noMedia')}</Typography>
            )}

            <Stack spacing={1.5}>
              <DetailRow label={t('products:form.slug')} value={product.slug} />
              <DetailRow label={t('products:form.name')} value={pickLocalized(product.name, locale)} />
              <DetailRow
                label={t('products:form.description')}
                value={pickLocalized(product.description, locale)}
              />
              <DetailRow label={t('products:form.story')} value={pickLocalized(product.story, locale)} />
              <DetailRow label={t('products:form.forWhom')} value={pickLocalized(product.forWhom, locale)} />
              <DetailRow label={t('products:form.weight')} value={product.weight} />
              <DetailRow
                label={t('products:detail.price')}
                value={formatCurrency(product.priceMinor, product.currency)}
              />
              <DetailRow label={t('products:form.quantity')} value={String(product.quantity)} />
              <DetailRow label={t('products:form.sortWeight')} value={String(product.sortWeight)} />
              <DetailRow label={t('products:form.spice')} value={String(product.flavor.spice)} />
              <DetailRow label={t('products:form.sweet')} value={String(product.flavor.sweet)} />
              <DetailRow label={t('products:form.texture')} value={product.flavor.texture} />
              <DetailRow
                label={t('products:form.allergens')}
                value={
                  product.allergens.length > 0
                    ? product.allergens.join(', ')
                    : t('products:detail.emptyValue')
                }
              />
              <DetailRow
                label={t('products:form.isTriedByUs')}
                value={product.isTriedByUs ? t('products:detail.yes') : t('products:detail.no')}
              />
              <DetailRow
                label={t('products:form.brand')}
                value={product.brand?.name ?? t('products:form.noBrand')}
              />
              <DetailRow
                label={t('products:form.country')}
                value={pickLocalized(product.country.name, locale)}
              />
              <DetailRow
                label={t('products:form.category')}
                value={pickLocalized(product.category.name, locale)}
              />
            </Stack>
          </Stack>
        ) : null}
      </Modal.Body>
      <Modal.Footer align="end">
        <Button onClick={handleBack}>{t('common:actions.back')}</Button>
      </Modal.Footer>
    </>
  );
}
