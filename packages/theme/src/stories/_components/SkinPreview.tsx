import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

import { resolveSkin, skinVarsToStyle, type SkinDefinition, type SkinInput } from '../../skins';
import { ColorSwatch, MonoValue, TokenTableSection } from './TokenTable';

export type SkinCardCopy = {
  sampleTitle: string;
  sampleMeta: string;
  keyLabel: string;
  hueLabel?: string;
};

export function SkinProductCard({
  input,
  copy,
  showMeta = true,
}: {
  input: SkinInput;
  copy: SkinCardCopy;
  showMeta?: boolean;
}) {
  const skin = resolveSkin(input);

  return (
    <Box style={skinVarsToStyle(skin.cssVars)} sx={{ width: 168 }}>
      <Card
        sx={{
          backgroundImage: 'var(--skin-card-gradient)',
          backgroundColor: 'background.paper',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            alignItems: 'center',
            bgcolor: 'grey.100',
            display: 'flex',
            height: 96,
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            photo
          </Typography>
        </Box>
        <CardContent sx={{ pt: 1.5 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            {copy.sampleTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {copy.sampleMeta}
          </Typography>
          <Button size="small" variant="contained" fullWidth>
            Спробувати
          </Button>
        </CardContent>
      </Card>
      {showMeta ? (
        <Stack spacing={0.25} sx={{ mt: 0.75, textAlign: 'center' }}>
          <Typography variant="caption">{copy.keyLabel}</Typography>
          {copy.hueLabel ? (
            <Typography variant="caption" color="text.secondary">
              {copy.hueLabel}
            </Typography>
          ) : null}
        </Stack>
      ) : null}
    </Box>
  );
}

type SkinRegistryRow = {
  key: string;
  label: string;
  mood: string;
  definition: SkinDefinition;
};

function formatHueLabel(definition: SkinDefinition): string {
  const secondary = definition.secondary ? ` · tag ${definition.secondary}` : '';
  return `hue ${String(definition.bgHueBrand)}° · ${definition.accent}${secondary}`;
}

export function SkinRegistryTable({
  title,
  description,
  rows,
}: {
  title: string;
  description?: string;
  rows: SkinRegistryRow[];
}) {
  return (
    <TokenTableSection
      title={title}
      description={description}
      columns={[
        {
          id: 'key',
          header: 'Key',
          width: 112,
          render: (row: SkinRegistryRow) => <MonoValue>{row.key}</MonoValue>,
        },
        {
          id: 'label',
          header: 'Label',
          width: 140,
          render: (row: SkinRegistryRow) => (
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {row.label}
            </Typography>
          ),
        },
        {
          id: 'mood',
          header: 'Mood',
          width: 200,
          render: (row: SkinRegistryRow) => (
            <Typography variant="caption" color="text.secondary">
              {row.mood}
            </Typography>
          ),
        },
        {
          id: 'hue',
          header: 'bgHueBrand',
          width: 88,
          align: 'center',
          render: (row: SkinRegistryRow) => <MonoValue>{`${String(row.definition.bgHueBrand)}°`}</MonoValue>,
        },
        {
          id: 'accent',
          header: 'Accent',
          width: 120,
          render: (row: SkinRegistryRow) => <MonoValue>{row.definition.accent}</MonoValue>,
        },
        {
          id: 'swatch',
          header: '',
          width: 48,
          align: 'center',
          render: (row: SkinRegistryRow) => <ColorSwatch value={row.definition.accent} />,
        },
        {
          id: 'secondary',
          header: 'Secondary',
          width: 120,
          render: (row: SkinRegistryRow) => <MonoValue>{row.definition.secondary ?? '—'}</MonoValue>,
        },
        {
          id: 'gradient',
          header: 'Gradient',
          render: (row: SkinRegistryRow) => (
            <Box
              sx={{
                background: `linear-gradient(90deg, ${row.definition.gradientStart}, ${row.definition.gradientEnd})`,
                border: 1,
                borderColor: 'divider',
                borderRadius: 0.5,
                height: 20,
                width: 96,
              }}
            />
          ),
        },
      ]}
      rows={rows}
      getRowKey={(row) => row.key}
    />
  );
}

export function SkinCardGrid({ children }: { children: ReactNode }) {
  return (
    <Stack direction="row" flexWrap="wrap" gap={2} useFlexGap>
      {children}
    </Stack>
  );
}

export function skinCardCopyFromDefinition(
  key: string,
  label: string,
  definition: SkinDefinition,
  sampleTitle: string,
  sampleMeta: string,
): SkinCardCopy {
  return {
    keyLabel: `${label} (${key})`,
    hueLabel: formatHueLabel(definition),
    sampleTitle,
    sampleMeta,
  };
}
