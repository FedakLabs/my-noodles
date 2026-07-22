'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Carousel, CarouselContent, CarouselSlide, galleryCarouselOptions } from '@my-noodles/ui';
import Autoplay from 'embla-carousel-autoplay';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { Link } from '@/i18n/navigation';

import { useLandingHeroProducts, useReducedMotion } from '../../_shared';

export function DoorFeedReel() {
  const t = useTranslations('home.variants.a');
  const reducedMotion = useReducedMotion();
  const { products } = useLandingHeroProducts();
  const items = (products?.items ?? []).slice(0, 5);

  const plugins = useMemo(
    () => (reducedMotion ? undefined : [Autoplay({ delay: 2800, stopOnInteraction: false })]),
    [reducedMotion],
  );

  return (
    <Stack
      component={Link}
      href="/feed"
      spacing={1.5}
      sx={{ textDecoration: 'none', color: 'inherit', height: '100%' }}
    >
      <Typography variant="h6">{t('doorsFeedTitle')}</Typography>
      <Typography variant="body2" color="text.secondary">
        {t('doorsFeedBody')}
      </Typography>
      {items.length > 0 ? (
        <Carousel
          ariaLabel={t('doorsFeedTitle')}
          options={{ ...galleryCarouselOptions, loop: true }}
          plugins={plugins}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            height: 180,
            bgcolor: 'common.black',
          }}
        >
          <CarouselContent>
            {items.map((product, index) => (
              <CarouselSlide key={product.id} index={index}>
                <Box sx={{ position: 'relative', width: '100%', height: 180 }}>
                  {product.images[0] ? (
                    <Box
                      component="img"
                      src={product.images[0]}
                      alt=""
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : null}
                  <Typography
                    variant="caption"
                    sx={{
                      position: 'absolute',
                      left: 12,
                      bottom: 12,
                      color: 'common.white',
                      textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                    }}
                  >
                    {product.name}
                  </Typography>
                </Box>
              </CarouselSlide>
            ))}
          </CarouselContent>
        </Carousel>
      ) : null}
    </Stack>
  );
}
