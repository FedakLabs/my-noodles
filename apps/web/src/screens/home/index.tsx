'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { fontFamilies } from '@my-noodles/theme';
import CatalogIcon from '@my-noodles/ui/icons/catalog.svg';
import CheckIcon from '@my-noodles/ui/icons/check.svg';
import CollectionsIcon from '@my-noodles/ui/icons/collections.svg';
import SearchIcon from '@my-noodles/ui/icons/search.svg';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { useCollections } from '@/api/collections';
import { useCountries } from '@/api/countries';
import { SITE_HEADER_HEIGHT } from '@/components/layout/site-nav-config';
import { Link } from '@/i18n/navigation';
import { APP_ROUTES } from '@/shared/routes';

// ─── Animation helpers ──────────────────────────────────────────────────────

function ScrollReveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
      }}
    >
      {children}
    </div>
  );
}

function MountReveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      style={{
        transition: `opacity 0.7s ease, transform 0.7s ease`,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
      }}
    >
      {children}
    </div>
  );
}

// ─── Static data ─────────────────────────────────────────────────────────────

const EXPLORE_CARDS = [
  { key: 'catalog', href: APP_ROUTES.catalog, Icon: CatalogIcon },
  { key: 'feed', href: APP_ROUTES.feed, Icon: SearchIcon },
  { key: 'collections', href: APP_ROUTES.collections, Icon: CollectionsIcon },
] as const;

type ExploreKey = (typeof EXPLORE_CARDS)[number]['key'];

const WHY_ITEMS = [
  { key: 'honest', Icon: CheckIcon },
  { key: 'curated', Icon: CheckIcon },
  { key: 'delivery', Icon: CheckIcon },
] as const;

type WhyKey = (typeof WHY_ITEMS)[number]['key'];

export function HomeScreen() {
  const t = useTranslations('home');
  const { collections } = useCollections({ limit: 4 });
  const { countries } = useCountries();

  return (
    <Box component="main">
      <Box
        sx={{
          minHeight: `calc(100dvh - ${SITE_HEADER_HEIGHT}px)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: (theme) =>
            `radial-gradient(ellipse 80% 60% at 50% 40%, ${theme.palette.action.hover} 0%, transparent 70%), ${theme.palette.background.default}`,
          px: 2,
          py: { mobile: 6, desktop: 10 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={3} sx={{ alignItems: 'center' }}>
            <MountReveal delay={80}>
              <Typography
                component="h1"
                sx={{
                  fontFamily: fontFamilies.display,
                  fontWeight: 800,
                  fontSize: { mobile: '2.25rem', sm: '3rem', desktop: '3.75rem' },
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                  color: 'text.primary',
                }}
              >
                {t('hero.headline')}
              </Typography>
            </MountReveal>

            <MountReveal delay={220}>
              <Typography
                variant="body1"
                sx={{
                  fontSize: { mobile: '1rem', desktop: '1.125rem' },
                  color: 'text.secondary',
                  maxWidth: 520,
                  lineHeight: 1.6,
                }}
              >
                {t('hero.sub')}
              </Typography>
            </MountReveal>

            <MountReveal delay={380}>
              <Stack direction={{ mobile: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 1 }}>
                <Button
                  component={Link}
                  href={APP_ROUTES.catalog}
                  variant="contained"
                  size="large"
                  sx={{ minWidth: 200 }}
                >
                  {t('hero.ctaCatalog')}
                </Button>
                <Button
                  component={Link}
                  href={APP_ROUTES.feed}
                  variant="outlined"
                  size="large"
                  sx={{ minWidth: 200 }}
                >
                  {t('hero.ctaFeed')}
                </Button>
              </Stack>
            </MountReveal>
          </Stack>
        </Container>
      </Box>

      <Box sx={{ py: { mobile: 7, desktop: 10 }, px: 2, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <ScrollReveal>
            <Typography
              component="h2"
              sx={{
                fontFamily: fontFamilies.display,
                fontWeight: 700,
                fontSize: { mobile: '1.5rem', desktop: '2rem' },
                textAlign: 'center',
                mb: 4,
                color: 'text.primary',
              }}
            >
              {t('countries.headline')}
            </Typography>
          </ScrollReveal>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center' }}>
            {(countries ?? []).map(({ flagEmoji, slug, name }, index) => (
              <ScrollReveal key={slug} delay={index * 50}>
                <Box
                  component={Link}
                  href={`${APP_ROUTES.catalog}?country=${slug}`}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2.5,
                    py: 1.25,
                    borderRadius: 9999,
                    border: '1.5px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.default',
                    color: 'text.primary',
                    textDecoration: 'none',
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    transition: 'border-color 0.2s, background-color 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: (theme) => `${theme.palette.primary.main}0d`,
                    },
                  }}
                >
                  {flagEmoji && <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{flagEmoji}</span>}
                  <span>{name}</span>
                </Box>
              </ScrollReveal>
            ))}
          </Box>
        </Container>
      </Box>

      <Box sx={{ py: { mobile: 7, desktop: 10 }, px: 2, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <ScrollReveal>
            <Typography
              component="h2"
              sx={{
                fontFamily: fontFamilies.display,
                fontWeight: 700,
                fontSize: { mobile: '1.5rem', desktop: '2rem' },
                textAlign: 'center',
                mb: 5,
                color: 'text.primary',
              }}
            >
              {t('explore.headline')}
            </Typography>
          </ScrollReveal>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { mobile: '1fr', sm: 'repeat(3, 1fr)' },
              gap: 2.5,
            }}
          >
            {EXPLORE_CARDS.map(({ key, href, Icon }, index) => (
              <ScrollReveal key={key} delay={index * 80}>
                <Box
                  component={Link}
                  href={href}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    p: 3,
                    borderRadius: 5,
                    border: '1.5px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    textDecoration: 'none',
                    height: '100%',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: (theme) => `0 8px 24px ${theme.palette.divider}`,
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 3,
                      bgcolor: (theme) => `${theme.palette.primary.main}14`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'primary.main',
                    }}
                  >
                    <Icon width={24} height={24} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.75, fontSize: '1.0625rem' }}>
                      {t(`explore.${key}.title` as `explore.${ExploreKey}.title`)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {t(`explore.${key}.body` as `explore.${ExploreKey}.body`)}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 'auto',
                      fontWeight: 600,
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    {t(`explore.${key}.title` as `explore.${ExploreKey}.title`)} →
                  </Typography>
                </Box>
              </ScrollReveal>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ── Collections preview ── */}
      {collections && collections.length > 0 && (
        <Box sx={{ py: { mobile: 7, desktop: 10 }, px: 2, bgcolor: 'background.paper' }}>
          <Container maxWidth="lg">
            <ScrollReveal>
              <Typography
                component="h2"
                sx={{
                  fontFamily: fontFamilies.display,
                  fontWeight: 700,
                  fontSize: { mobile: '1.5rem', desktop: '2rem' },
                  textAlign: 'center',
                  mb: 5,
                  color: 'text.primary',
                }}
              >
                {t('explore.collections.title')}
              </Typography>
            </ScrollReveal>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { mobile: 'repeat(2, 1fr)', desktop: 'repeat(4, 1fr)' },
                gap: 2,
              }}
            >
              {collections.map((collection, index) => {
                const accent = collection.color;
                return (
                  <ScrollReveal key={collection.slug} delay={index * 70}>
                    <Box
                      component={Link}
                      href={APP_ROUTES.collections}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        gap: 1.5,
                        p: { mobile: 2.5, desktop: 3 },
                        borderRadius: 5,
                        border: '1.5px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.default',
                        color: 'text.primary',
                        textDecoration: 'none',
                        transition: 'transform 0.2s ease, border-color 0.2s',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          borderColor: accent,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 3,
                          bgcolor: `${accent}18`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.75rem',
                        }}
                      >
                        {collection.emoji}
                      </Box>
                      <Box>
                        <Typography variant="h5" sx={{ color: accent, mb: collection.description ? 0.5 : 0 }}>
                          {collection.name}
                        </Typography>
                        {collection.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                            {collection.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </ScrollReveal>
                );
              })}
            </Box>
          </Container>
        </Box>
      )}

      {/* ── Why Us ── */}
      <Box sx={{ py: { mobile: 7, desktop: 10 }, px: 2, bgcolor: 'background.default' }}>
        <Container maxWidth="md">
          <ScrollReveal>
            <Typography
              component="h2"
              sx={{
                fontFamily: fontFamilies.display,
                fontWeight: 700,
                fontSize: { mobile: '1.5rem', desktop: '2rem' },
                textAlign: 'center',
                mb: 5,
                color: 'text.primary',
              }}
            >
              {t('why.headline')}
            </Typography>
          </ScrollReveal>

          <Stack spacing={3}>
            {WHY_ITEMS.map(({ key, Icon }, index) => (
              <ScrollReveal key={key} delay={index * 100}>
                <Stack direction="row" spacing={2.5} sx={{ alignItems: 'flex-start' }}>
                  <Box
                    sx={{
                      flexShrink: 0,
                      width: 44,
                      height: 44,
                      borderRadius: 3,
                      bgcolor: (theme) => `${theme.palette.primary.main}14`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'primary.main',
                      mt: 0.25,
                    }}
                  >
                    <Icon width={20} height={20} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, fontSize: '1rem' }}>
                      {t(`why.${key}.title` as `why.${WhyKey}.title`)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                      {t(`why.${key}.body` as `why.${WhyKey}.body`)}
                    </Typography>
                  </Box>
                </Stack>
              </ScrollReveal>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* ── Final CTA ── */}
      <Box
        sx={{
          py: { mobile: 8, desktop: 12 },
          px: 2,
          textAlign: 'center',
          bgcolor: 'background.paper',
        }}
      >
        <Container maxWidth="sm">
          <ScrollReveal>
            <Stack spacing={3} sx={{ alignItems: 'center' }}>
              <Typography
                component="h2"
                sx={{
                  fontFamily: fontFamilies.display,
                  fontWeight: 700,
                  fontSize: { mobile: '1.75rem', desktop: '2.25rem' },
                  color: 'text.primary',
                  lineHeight: 1.2,
                }}
              >
                {t('cta.headline')}
              </Typography>
              <Button
                component={Link}
                href={APP_ROUTES.catalog}
                variant="contained"
                size="large"
                sx={{ minWidth: 220, fontSize: '1rem' }}
              >
                {t('cta.button')}
              </Button>
            </Stack>
          </ScrollReveal>
        </Container>
      </Box>
    </Box>
  );
}
