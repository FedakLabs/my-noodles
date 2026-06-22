'use client';

import Button from '@mui/material/Button';
import type { ProductSummaryDto } from '@my-noodles/api-clients/storefront';
import { DiscoveryCard, resolveSkin, skinVarsToStyle } from '@my-noodles/ui';
import { useLocale, useTranslations } from 'next-intl';

import { useCartActions } from '@/hooks/cart';
import { Link } from '@/i18n/navigation';
import { testIds } from '@/shared/test-ids';
import { formatCurrency } from '@/utils/format-currency';

export type ProductCardProps = {
  product: ProductSummaryDto;
};

export function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations('catalog');
  const locale = useLocale();
  const { addItem } = useCartActions();
  const skin = resolveSkin({
    brand: product.brand?.slug,
    country: product.country.code,
    category: product.category.slug,
    slug: product.slug,
  });
  const imageUrl = product.images[0];

  return (
    <DiscoveryCard
      title={product.name}
      subtitle={product.country.name}
      price={formatCurrency(product.priceMinor, product.currency, locale)}
      imageUrl={imageUrl}
      imageAlt={product.name ?? product.slug}
      skinStyle={skinVarsToStyle(skin.cssVars)}
      linkComponent={Link}
      href={`/product/${product.slug}`}
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
              title: product.name ?? product.slug,
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
