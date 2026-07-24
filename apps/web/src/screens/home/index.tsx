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

import { SITE_HEADER_HEIGHT } from '@/components/layout/site-nav-config';
import { Link } from '@/i18n/navigation';

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

const COUNTRY_PILLS = [
  { flag: '🇯🇵', slug: 'japan' },
  { flag: '🇰🇷', slug: 'korea' },
  { flag: '🇺🇸', slug: 'usa' },
  { flag: '🇹🇭', slug: 'thailand' },
  { flag: '🇨🇳', slug: 'china' },
  { flag: '🇰🇿', slug: 'kazakhstan' },
  { flag: '🇩🇪', slug: 'germany' },
  { flag: '🇨🇿', slug: 'czech' },
] as const;

type CountrySlug = (typeof COUNTRY_PILLS)[number]['slug'];

const MOOD_CARDS = [
  { key: 'tiktok', emoji: '🎵' },
  { key: 'world', emoji: '🌍' },
  { key: 'movie', emoji: '🎬' },
  { key: 'office', emoji: '💼' },
] as const;

type MoodKey = (typeof MOOD_CARDS)[number]['key'];

const EXPLORE_CARDS = [
  { key: 'catalog', href: '/catalog', Icon: CatalogIcon },
  { key: 'feed', href: '/feed', Icon: SearchIcon },
  { key: 'collections', href: '/collections', Icon: CollectionsIcon },
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

  return (
    <Box component="main">
      {/* ── Hero ── */}
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
                  href="/catalog"
                  variant="contained"
                  size="large"
                  sx={{ minWidth: 200 }}
                >
                  {t('hero.ctaCatalog')}
                </Button>
                <Button component={Link} href="/feed" variant="outlined" size="large" sx={{ minWidth: 200 }}>
                  {t('hero.ctaFeed')}
                </Button>
              </Stack>
            </MountReveal>
          </Stack>
        </Container>
      </Box>

      {/* ── Countries ── */}
      <Box
        sx={{
          py: { mobile: 7, desktop: 10 },
          px: 2,
          bgcolor: 'background.paper',
        }}
      >
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

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.5,
              justifyContent: 'center',
            }}
          >
            {COUNTRY_PILLS.map(({ flag, slug }, index) => (
              <ScrollReveal key={slug} delay={index * 50}>
                <Box
                  component={Link}
                  href={`/catalog?country=${slug}`}
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
                  <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{flag}</span>
                  <span>{t(`countries.${slug}` as `countries.${CountrySlug}`)}</span>
                </Box>
              </ScrollReveal>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ── Ways to Explore ── */}
      <Box
        sx={{
          py: { mobile: 7, desktop: 10 },
          px: 2,
          bgcolor: 'background.default',
        }}
      >
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

      {/* ── Mood Collections ── */}
      <Box
        sx={{
          py: { mobile: 7, desktop: 10 },
          px: 2,
          bgcolor: 'background.paper',
        }}
      >
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
              {t('moods.headline')}
            </Typography>
          </ScrollReveal>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { mobile: 'repeat(2, 1fr)', desktop: 'repeat(4, 1fr)' },
              gap: 2,
            }}
          >
            {MOOD_CARDS.map(({ key, emoji }, index) => (
              <ScrollReveal key={key} delay={index * 70}>
                <Box
                  component={Link}
                  href="/collections"
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
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <Typography sx={{ fontSize: '2.5rem', lineHeight: 1 }}>{emoji}</Typography>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.9375rem', mb: 0.25 }}>
                      {t(`moods.${key}.title` as `moods.${MoodKey}.title`)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: '0.8125rem', lineHeight: 1.5 }}
                    >
                      {t(`moods.${key}.sub` as `moods.${MoodKey}.sub`)}
                    </Typography>
                  </Box>
                </Box>
              </ScrollReveal>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ── Why Us ── */}
      <Box
        sx={{
          py: { mobile: 7, desktop: 10 },
          px: 2,
          bgcolor: 'background.default',
        }}
      >
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
                href="/catalog"
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
