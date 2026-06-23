'use client';

import Box from '@mui/material/Box';
import type { ProductSummaryDto } from '@my-noodles/api-clients/storefront';
import { Carousel, CarouselContent, CarouselSlide, railCarouselOptions } from '@my-noodles/ui';

import { ProductCard } from '@/components/catalog/product-card/product-card';

/** Matches typical catalog column widths (2-up on mobile, 4-up on desktop). */
const ALTERNATIVE_CARD_BASIS = {
  xs: '175px',
  md: '240px',
} as const;

export type AlternativesRailProps = {
  products: ProductSummaryDto[];
  ariaLabel: string;
};

export function AlternativesRail({ products, ariaLabel }: AlternativesRailProps) {
  if (products.length === 0) {
    return null;
  }

  if (products.length === 1) {
    return (
      <Box sx={{ width: ALTERNATIVE_CARD_BASIS, flexShrink: 0 }}>
        <ProductCard product={products[0]!} singleImage />
      </Box>
    );
  }

  return (
    <Carousel ariaLabel={ariaLabel} options={railCarouselOptions}>
      <CarouselContent gap={2}>
        {products.map((product, index) => (
          <CarouselSlide key={product.id} index={index} responsiveBasis={ALTERNATIVE_CARD_BASIS}>
            <ProductCard product={product} singleImage />
          </CarouselSlide>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
