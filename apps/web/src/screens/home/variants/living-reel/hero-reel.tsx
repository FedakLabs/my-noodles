'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Carousel, CarouselContent, CarouselSlide, galleryCarouselOptions } from '@my-noodles/ui';
import Autoplay from 'embla-carousel-autoplay';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { useLandingHeroProducts, useReducedMotion } from '../../_shared';

type HeroReelProps = {
  dockProgress?: number;
};

export function HeroReel({ dockProgress = 0 }: HeroReelProps) {
  const t = useTranslations('home.variants.c');
  const reducedMotion = useReducedMotion();
  const { products } = useLandingHeroProducts();
  const items = (products?.items ?? []).slice(0, 5);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const active = items[selectedIndex];

  const plugins = useMemo(
    () => (reducedMotion ? undefined : [Autoplay({ delay: 4200, stopOnInteraction: false })]),
    [reducedMotion],
  );

  const scale = 1 - dockProgress * 0.28;
  const radius = dockProgress * 24;
  const width = `${100 - dockProgress * 18}%`;

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        bgcolor: 'common.black',
      }}
    >
      <Box
        sx={{
          width,
          height: `${100 - dockProgress * 22}%`,
          maxWidth: 920,
          borderRadius: `${radius}px`,
          overflow: 'hidden',
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          boxShadow: dockProgress > 0.2 ? 8 : 0,
          transition: reducedMotion ? undefined : 'box-shadow 200ms ease',
        }}
      >
        {items.length > 0 ? (
          <Carousel
            ariaLabel={t('dockTitle')}
            options={{ ...galleryCarouselOptions, loop: true }}
            plugins={plugins}
            onSelect={setSelectedIndex}
            sx={{ height: '100%', width: '100%' }}
          >
            <CarouselContent>
              {items.map((product, index) => (
                <CarouselSlide key={product.id} index={index}>
                  <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                    {product.images[0] ? (
                      <Box
                        component={motion.img}
                        src={product.images[0]}
                        alt=""
                        initial={false}
                        animate={reducedMotion ? undefined : { scale: 1.06 }}
                        transition={{ duration: 4.2, ease: 'linear' }}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          viewTransitionName: `product-image-${product.slug}`,
                        }}
                      />
                    ) : (
                      <Box sx={{ width: '100%', height: '100%', bgcolor: 'grey.900' }} />
                    )}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background:
                          'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.75) 100%)',
                      }}
                    />
                  </Box>
                </CarouselSlide>
              ))}
            </CarouselContent>
          </Carousel>
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              background: (theme) =>
                `linear-gradient(160deg, ${theme.palette.grey[900]}, ${theme.palette.primary.dark})`,
            }}
          />
        )}
      </Box>

      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: { xs: 48, md: 64 },
          px: 3,
          textAlign: 'center',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{ color: 'common.white', textShadow: '0 2px 16px rgba(0,0,0,0.45)', mb: 1.5 }}
        >
          {active
            ? t('productLine', { name: active.name ?? active.slug, country: active.country.name ?? '' })
            : t('heroFallbackLine')}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
          {t('heroSwipeCue')}
        </Typography>
      </Box>
    </Box>
  );
}
