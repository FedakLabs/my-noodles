'use client';

import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useCollectionDetail, useCollections } from '@/api/collections';
import { ProductCard } from '@/components/catalog/product-card/product-card';
import { PageContainer } from '@/components/layout/page-container';

/** Fixed horizontal travel distances per particle slot (px, right→left). */
const X_DISTANCES = [-80, -148, -216, -284, -352] as const;

/** Five evenly-spaced y slots centred on 0 — shuffled on each hover so order is unpredictable. */
const Y_SLOTS = [-24, -12, 0, 12, 24];

function shuffleYSlots(): number[] {
  const arr = [...Y_SLOTS];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

function CollectionProducts({ slug }: { slug: string }) {
  const t = useTranslations('collections');
  const { collection, collectionIsInitialLoad } = useCollectionDetail(slug);

  if (collectionIsInitialLoad) {
    return (
      <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
        {t('listLoading')}
      </Typography>
    );
  }

  if (!collection?.products?.length) {
    return (
      <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
        {t('listEmpty')}
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          mobile: 'repeat(2, 1fr)',
          sm: 'repeat(3, 1fr)',
          desktop: 'repeat(4, 1fr)',
        },
        gap: 2,
        py: 2,
      }}
    >
      {collection.products.map((product, index) => (
        <ProductCard key={product.id} product={product} gridIndex={index} gridColumns={4} />
      ))}
    </Box>
  );
}

function CollectionRow({
  name,
  description,
  longDescription,
  slug,
  emoji,
  color,
  particles,
  expanded,
  onToggle,
}: {
  name: string;
  description: string | null;
  longDescription: string | null;
  slug: string;
  emoji: string;
  color: string;
  particles: string[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [burstYOrder, setBurstYOrder] = useState<number[]>(() => shuffleYSlots());
  const active = expanded || hovered;

  return (
    <Box>
      <Box
        component="button"
        onClick={onToggle}
        onMouseEnter={() => {
          setBurstYOrder(shuffleYSlots());
          setHovered(true);
        }}
        onMouseLeave={(event) => {
          setHovered(false);
          // Click leaves focus on the button; clear it so closed tiles settle when the pointer leaves.
          event.currentTarget.blur();
        }}
        sx={{
          width: '100%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: { mobile: 2, desktop: 4 },
          px: { mobile: 3, desktop: 5 },
          py: { mobile: 3, desktop: 3.5 },
          borderRadius: expanded ? '16px 16px 0 0' : '16px',
          border: '1.5px solid',
          borderColor: active ? color : 'divider',
          borderLeft: `4px solid ${color}`,
          bgcolor: 'background.paper',
          color: 'text.primary',
          textAlign: 'left',
          cursor: 'pointer',
          overflow: 'hidden',
          outline: 'none',
          transform: active ? 'translateY(-2px)' : 'translateY(0)',
          boxShadow: active ? `0 8px 28px ${color}22` : 'none',
          transition:
            'transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease, border-radius 0.25s ease',
          '&:focus-visible': { outline: 'none' },
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(270deg, ${color}38 0%, ${color}1f 45%, transparent 92%)`,
            transform: active ? 'scaleX(1)' : 'scaleX(0)',
            transformOrigin: 'right center',
            opacity: 1,
            pointerEvents: 'none',
            transition: 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
          },
        }}
      >
        {/* Emoji tile */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            flexShrink: 0,
            width: { mobile: 48, desktop: 56 },
            height: { mobile: 48, desktop: 56 },
            borderRadius: 3,
            border: `2px solid ${color}40`,
            bgcolor: `${color}14`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: { mobile: '1.5rem', desktop: '1.75rem' },
          }}
        >
          {emoji}
        </Box>

        {/* Text */}
        <Box sx={{ position: 'relative', zIndex: 1, flex: 1, minWidth: 0 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              fontSize: { mobile: '1rem', desktop: '1.2rem' },
              color,
              mb: description ? 0.5 : 0,
            }}
          >
            {name}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55, maxWidth: 520 }}>
              {description}
            </Typography>
          )}
        </Box>

        {/* Particles — hidden at left; burst left→right on active; return when closed + leave */}
        {particles.map((p, i) => {
          const x = X_DISTANCES[i % X_DISTANCES.length]!;
          const y = burstYOrder[i % burstYOrder.length] ?? 0;
          const rotate = y / 3;
          const delayMs = active ? i * 40 : (particles.length - 1 - i) * 28;

          return (
            <Box
              key={i}
              component="span"
              aria-hidden
              sx={{
                position: 'absolute',
                top: '50%',
                right: { mobile: 16, desktop: 24 },
                marginTop: '-0.625rem',
                fontSize: '1.25rem',
                pointerEvents: 'none',
                userSelect: 'none',
                zIndex: 1,
                opacity: active ? 0.95 : 0,
                transform: active
                  ? `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(1.08)`
                  : 'translate(0, 0) rotate(0deg) scale(0.55)',
                transition: active
                  ? `transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms, opacity 0.18s ease ${delayMs}ms`
                  : `transform 0.32s cubic-bezier(0.4, 0, 0.2, 1) ${delayMs}ms, opacity 0.2s ease ${delayMs}ms`,
              }}
            >
              {p}
            </Box>
          );
        })}
      </Box>

      {/* Accordion products */}
      <Collapse in={expanded} unmountOnExit>
        <Box
          sx={{
            border: '1.5px solid',
            borderTop: 'none',
            borderColor: color,
            borderRadius: '0 0 16px 16px',
            bgcolor: 'background.paper',
            px: { mobile: 2, desktop: 3 },
            pb: 2,
          }}
        >
          {longDescription && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ pt: 2.5, pb: 1, lineHeight: 1.7, maxWidth: 680 }}
            >
              {longDescription}
            </Typography>
          )}
          <CollectionProducts slug={slug} />
        </Box>
      </Collapse>
    </Box>
  );
}

export function CollectionsScreen() {
  const t = useTranslations('collections');
  const { collections, collectionsIsInitialLoad } = useCollections();
  const [expandedSlugs, setExpandedSlugs] = useState<Set<string>>(new Set());

  function handleToggle(slug: string) {
    setExpandedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  return (
    <PageContainer>
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant="h4">{t('title')}</Typography>
          <Typography color="text.secondary">{t('description')}</Typography>
        </Stack>

        {collectionsIsInitialLoad ? (
          <Typography color="text.secondary">{t('listLoading')}</Typography>
        ) : collections?.length ? (
          <Stack spacing={2}>
            {collections.map((collection) => (
              <CollectionRow
                key={collection.slug}
                name={collection.name ?? collection.slug}
                description={collection.description}
                longDescription={collection.longDescription}
                slug={collection.slug}
                emoji={collection.emoji}
                color={collection.color}
                particles={collection.particles}
                expanded={expandedSlugs.has(collection.slug)}
                onToggle={() => handleToggle(collection.slug)}
              />
            ))}
          </Stack>
        ) : (
          <Typography color="text.secondary">{t('listEmpty')}</Typography>
        )}
      </Stack>
    </PageContainer>
  );
}
