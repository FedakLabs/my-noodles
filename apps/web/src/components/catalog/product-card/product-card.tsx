'use client';

import Button from '@mui/material/Button';
import type { ProductSummaryDto } from '@my-noodles/api-clients/storefront';
import { DiscoveryCard, resolveSkin, skinVarsToStyle } from '@my-noodles/ui';
import { useLocale, useTranslations } from 'next-intl';

import { useCartActions } from '@/hooks/cart';
import { useRoutePrefetch } from '@/hooks/smooth';
import { Link } from '@/i18n/navigation';
import { testIds } from '@/shared/test-ids';
import { formatCurrency } from '@/utils/format-currency';

export type ProductCardProps = {
  product: ProductSummaryDto;
  /** Eagerly prefetch the product route (above-the-fold cards). */
  priorityPrefetch?: boolean;
  /** Show only the hero image — avoids nested carousels (e.g. alternatives rail). */
  singleImage?: boolean;
};

export function ProductCard({ product, priorityPrefetch = false, singleImage = false }: ProductCardProps) {
  const t = useTranslations('catalog');
  const locale = useLocale();
  const { addItem } = useCartActions();
  const productHref = `/product/${product.slug}`;
  const { bindPrefetchOnIntent } = useRoutePrefetch(productHref);
  const skin = resolveSkin({
    brand: product.brand?.slug,
    country: product.country.code,
    category: product.category.slug,
    slug: product.slug,
  });
  const imageAlt = product.name ?? product.slug;
  const imageUrl = product.images[0];
  const cardImages = singleImage
    ? imageUrl
      ? [{ url: imageUrl, alt: imageAlt, viewTransitionName: `product-image-${product.slug}` }]
      : []
    : product.images.map((url, index) => ({
        url,
        alt: imageAlt,
        viewTransitionName: index === 0 ? `product-image-${product.slug}` : undefined,
      }));

  return (
    <DiscoveryCard
      title={product.name}
      subtitle={product.country.name}
      price={formatCurrency(product.priceMinor, product.currency, locale)}
      images={cardImages}
      imageMode={singleImage ? 'static' : 'carousel'}
      galleryLabels={
        singleImage
          ? undefined
          : {
              gallery: t('imageGallery'),
              slide: (index, total) => t('imageSlide', { index, total }),
            }
      }
      skinStyle={skinVarsToStyle(skin.cssVars)}
      link={{
        component: Link,
        href: productHref,
        props: {
          prefetch: priorityPrefetch ? true : undefined,
          ...bindPrefetchOnIntent,
        },
      }}
      action={
        <Button
          variant="contained"
          size="small"
          fullWidth
          disabled={!product.inStock}
          data-testid={testIds.catalog.addToCart(product.slug)}
          onClick={() =>
            addItem({
              productId: product.id,
              slug: product.slug,
              title: imageAlt,
              priceMinor: product.priceMinor,
              currency: product.currency,
              imageUrl,
            })
          }
        >
          {product.inStock ? t('addToCart') : t('outOfStock')}
        </Button>
      }
    />
  );
}
