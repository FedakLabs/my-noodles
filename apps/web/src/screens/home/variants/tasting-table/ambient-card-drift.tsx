'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { Product } from '@my-noodles/api-clients/storefront';
import { resolveSkin } from '@my-noodles/ui';
import { motion } from 'motion/react';

import { skinResultToGradient, useReducedMotion } from '../../_shared';

type AmbientCardDriftProps = {
  products: Product[];
};

const DRIFT = [
  { x: ['0%', '4%', '-2%', '0%'], y: ['0%', '-6%', '3%', '0%'], duration: 14 },
  { x: ['0%', '-5%', '3%', '0%'], y: ['0%', '5%', '-4%', '0%'], duration: 16 },
  { x: ['0%', '3%', '-4%', '0%'], y: ['0%', '-3%', '6%', '0%'], duration: 18 },
  { x: ['0%', '-2%', '5%', '0%'], y: ['0%', '4%', '-5%', '0%'], duration: 15 },
];

export function AmbientCardDrift({ products }: AmbientCardDriftProps) {
  const reducedMotion = useReducedMotion();
  const tiles = products.slice(0, 4);

  if (tiles.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: { xs: 220, md: 280 },
        mt: 3,
      }}
      aria-hidden
    >
      {tiles.map((product, index) => {
        const skin = resolveSkin({
          brand: product.brand?.slug,
          country: product.country.code,
          category: product.category.slug,
          slug: product.slug,
        });
        const drift = DRIFT[index % DRIFT.length]!;
        const left = `${10 + index * 20}%`;

        return (
          <Box
            key={product.id}
            component={reducedMotion ? 'div' : motion.div}
            {...(reducedMotion
              ? {}
              : {
                  animate: { x: drift.x, y: drift.y },
                  transition: {
                    duration: drift.duration,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                })}
            sx={{
              position: 'absolute',
              left,
              top: index % 2 === 0 ? '8%' : '28%',
              width: { xs: 96, md: 120 },
              height: { xs: 120, md: 150 },
              borderRadius: 3,
              overflow: 'hidden',
              backgroundImage: skinResultToGradient(skin),
              boxShadow: 2,
              display: 'flex',
              alignItems: 'flex-end',
              p: 1,
            }}
          >
            {product.images[0] ? (
              <Box
                component="img"
                src={product.images[0]}
                alt=""
                sx={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: 0.92,
                }}
              />
            ) : null}
            <Typography
              variant="caption"
              sx={{
                position: 'relative',
                color: 'common.white',
                textShadow: '0 1px 2px rgba(0,0,0,0.45)',
                fontWeight: 600,
              }}
            >
              {product.country.flagEmoji}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
