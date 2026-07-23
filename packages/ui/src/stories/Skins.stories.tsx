import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  brandSkins,
  categorySkins,
  countrySkins,
  resolveSkin,
  skinVarsToStyle,
  type SkinInput,
} from '../utils/skins';
import {
  SkinCardGrid,
  SkinProductCard,
  SkinRegistryTable,
  skinCardCopyFromDefinition,
} from './_components/SkinPreview';
import {
  brandSkinMeta,
  brandSkinOrder,
  categorySkinMeta,
  categorySkinOrder,
  countrySkinMeta,
  countrySkinOrder,
} from './skinStoryCatalog';

function SkinTierIntro({ tier, description }: { tier: string; description: string }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Resolution order: brand → country → category → hash(slug) → base. Tier shown: <strong>{tier}</strong>.
      </Typography>
    </Stack>
  );
}

function CountrySkinsGallery() {
  const registryRows = countrySkinOrder.map((key) => ({
    key,
    label: countrySkinMeta[key].label,
    mood: countrySkinMeta[key].mood,
    definition: countrySkins[key]!,
  }));

  return (
    <Stack spacing={3} sx={{ maxWidth: 960 }}>
      <SkinTierIntro
        tier="country"
        description="Origin feel for catalog countries. Overrides bgHueBrand, accent, gradient, and tag secondary."
      />
      <SkinRegistryTable
        title="Country registry"
        description="Keys match ISO 3166-1 alpha-2 codes on Product.country."
        rows={registryRows}
      />
      <SkinCardGrid>
        {countrySkinOrder.map((key) => {
          const meta = countrySkinMeta[key];
          return (
            <SkinProductCard
              key={key}
              input={{ country: key }}
              copy={skinCardCopyFromDefinition(
                key,
                meta.label,
                countrySkins[key]!,
                meta.sampleTitle,
                meta.sampleMeta,
              )}
            />
          );
        })}
      </SkinCardGrid>
    </Stack>
  );
}

const meta = {
  title: 'Skins',
  component: CountrySkinsGallery,
  parameters: {
    docs: {
      description: {
        component:
          'Catalog skin engine: brand → country → category → hash(slug) → base. Apply via `resolveSkin` + CSS vars on DiscoveryCard / ProductDiscoveryCard.',
      },
    },
  },
} satisfies Meta<typeof CountrySkinsGallery>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Countries: Story = {
  render: () => <CountrySkinsGallery />,
};

export const Brands: Story = {
  render: () => {
    const registryRows = brandSkinOrder.map((key) => ({
      key,
      label: brandSkinMeta[key].label,
      mood: brandSkinMeta[key].mood,
      definition: brandSkins[key]!,
    }));

    return (
      <Stack spacing={3} sx={{ maxWidth: 960 }}>
        <SkinTierIntro tier="brand" description="Brand-level skins win over country when both are present." />
        <SkinRegistryTable title="Brand registry" rows={registryRows} />
        <SkinCardGrid>
          {brandSkinOrder.map((key) => {
            const meta = brandSkinMeta[key];
            return (
              <SkinProductCard
                key={key}
                input={{ brand: key, country: 'KR' }}
                copy={skinCardCopyFromDefinition(
                  key,
                  meta.label,
                  brandSkins[key]!,
                  meta.sampleTitle,
                  meta.sampleMeta,
                )}
              />
            );
          })}
        </SkinCardGrid>
      </Stack>
    );
  },
};

export const Categories: Story = {
  render: () => {
    const registryRows = categorySkinOrder.map((key) => ({
      key,
      label: categorySkinMeta[key].label,
      mood: categorySkinMeta[key].mood,
      definition: categorySkins[key]!,
    }));

    return (
      <Stack spacing={3} sx={{ maxWidth: 960 }}>
        <SkinTierIntro tier="category" description="Category skins when brand and country do not match." />
        <SkinRegistryTable title="Category registry" rows={registryRows} />
        <SkinCardGrid>
          {categorySkinOrder.map((key) => {
            const meta = categorySkinMeta[key];
            return (
              <SkinProductCard
                key={key}
                input={{ category: key }}
                copy={skinCardCopyFromDefinition(
                  key,
                  meta.label,
                  categorySkins[key]!,
                  meta.sampleTitle,
                  meta.sampleMeta,
                )}
              />
            );
          })}
        </SkinCardGrid>
      </Stack>
    );
  },
};

export const BaseTheme: Story = {
  render: () => {
    const skin = resolveSkin({});
    return (
      <Stack spacing={1}>
        <Typography variant="overline" color="text.secondary">
          Base (no skin match)
        </Typography>
        <Box style={skinVarsToStyle(skin.cssVars)} sx={{ width: 168 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">Default terracotta</Typography>
              <Typography variant="caption" color="text.secondary">
                source: {skin.source}
              </Typography>
              <Button size="small" variant="contained" sx={{ mt: 1 }}>
                Спробувати
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Stack>
    );
  },
};

export const ResolutionOrder: Story = {
  render: () => (
    <Stack spacing={2} sx={{ maxWidth: 720 }}>
      {(
        [
          { input: { brand: 'BULDAK', country: 'KR' }, label: 'Brand wins over country' },
          { input: { brand: 'unknown', country: 'TH' }, label: 'Brand miss → country' },
          {
            input: { brand: 'unknown', country: 'ZZ', category: 'SWEETS' },
            label: 'Brand/country miss → category',
          },
          { input: { slug: 'spicy-noodles' }, label: 'Hash fallback' },
          { input: {}, label: 'Base theme' },
        ] satisfies { input: SkinInput; label: string }[]
      ).map(({ input, label }) => {
        const skin = resolveSkin(input);
        return (
          <Typography key={label} variant="body2">
            {label}: <strong>{skin.source}</strong>
            {skin.key !== skin.source ? ` (${skin.key})` : ''}
          </Typography>
        );
      })}
    </Stack>
  ),
};
