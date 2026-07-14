import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { baseColors } from '../../palette';
import { ColorSwatch, MonoValue, TokenTableSection } from '../_components/TokenTable';
import { colorGroupOrder, colorTokenOrder } from '../storyCatalog';

type ColorRow = {
  token: string;
  group: string;
  value: string;
};

type NamedColorRow = {
  name: string;
  value: string;
};

const semanticColumns = [
  {
    id: 'swatch',
    header: '',
    width: 48,
    align: 'center' as const,
    render: (row: ColorRow) => <ColorSwatch value={row.value} />,
  },
  {
    id: 'token',
    header: 'Token',
    width: 200,
    render: (row: ColorRow) => <MonoValue>{row.token}</MonoValue>,
  },
  {
    id: 'value',
    header: 'Value',
    width: 120,
    render: (row: ColorRow) => <MonoValue>{row.value}</MonoValue>,
  },
  {
    id: 'cssVar',
    header: 'CSS variable',
    render: (row: ColorRow) => <MonoValue>{`--colors-${row.token.replace('.', '-')}`}</MonoValue>,
  },
];

const namedColorColumns = [
  {
    id: 'swatch',
    header: '',
    width: 48,
    align: 'center' as const,
    render: (row: NamedColorRow) => <ColorSwatch value={row.value} size={20} />,
  },
  {
    id: 'name',
    header: 'Name',
    width: 160,
    render: (row: NamedColorRow) => <MonoValue>{row.name}</MonoValue>,
  },
  {
    id: 'value',
    header: 'Value',
    render: (row: NamedColorRow) => <MonoValue>{row.value}</MonoValue>,
  },
];

function SemanticColors() {
  const theme = useTheme();

  const paletteRows: NamedColorRow[] = [
    { name: 'primary.main', value: theme.palette.primary.main },
    { name: 'background.default', value: theme.palette.background.default ?? '—' },
    { name: 'background.paper', value: theme.palette.background.paper ?? '—' },
    { name: 'text.primary', value: theme.palette.text.primary },
    { name: 'text.secondary', value: theme.palette.text.secondary },
    { name: 'divider', value: theme.palette.divider },
  ];

  const baseColorRows: NamedColorRow[] = Object.entries(baseColors).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <Stack spacing={4} sx={{ maxWidth: 960 }}>
      <Typography variant="body2" color="text.secondary">
        Semantic tokens from <code>theme.colors</code>. Use roles in components — never raw{' '}
        <code>baseColors</code>.
      </Typography>

      {colorGroupOrder.map((group) => {
        const rows: ColorRow[] = colorTokenOrder[group].map((token) => ({
          group,
          token: `${group}.${token}`,
          value: String(theme.colors[group][token as keyof (typeof theme.colors)[typeof group]]),
        }));

        return (
          <TokenTableSection
            key={group}
            title={group}
            columns={semanticColumns}
            rows={rows}
            getRowKey={(row) => row.token}
          />
        );
      })}

      <TokenTableSection
        title="MUI palette bridge"
        description="Mapped from theme.colors — used by MUI components."
        columns={namedColorColumns}
        rows={paletteRows}
        getRowKey={(row) => row.name}
      />

      <TokenTableSection
        title="baseColors (dev only)"
        description="Raw palette source in palette.ts. Do not import in apps/web."
        columns={namedColorColumns}
        rows={baseColorRows}
        getRowKey={(row) => row.name}
      />
    </Stack>
  );
}

const meta = {
  title: 'Foundations/Colors',
  component: SemanticColors,
} satisfies Meta<typeof SemanticColors>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SemanticTokens: Story = {};
