import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { MonoValue, TokenTableSection } from '../_components/TokenTable';
import { type StoryTypographyVariant, typographySpecimens, typographyVariantOrder } from '../storyCatalog';

type TypographyRow = {
  variant: StoryTypographyVariant;
  usage: string;
  sample: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
};

function readTypographyMeta(
  variant: StoryTypographyVariant,
  theme: ReturnType<typeof useTheme>,
): Omit<TypographyRow, 'variant' | 'usage' | 'sample'> {
  const style = theme.typography[variant];
  if (typeof style !== 'object' || style === null) {
    return {
      fontFamily: String(theme.typography.fontFamily),
      fontSize: '—',
      fontWeight: '—',
    };
  }

  return {
    fontFamily: String('fontFamily' in style ? style.fontFamily : theme.typography.fontFamily),
    fontSize: String('fontSize' in style ? style.fontSize : '—'),
    fontWeight: String('fontWeight' in style ? style.fontWeight : 400),
  };
}

const typographyColumns = [
  {
    id: 'variant',
    header: 'Variant',
    width: 96,
    render: (row: TypographyRow) => <MonoValue>{row.variant}</MonoValue>,
  },
  {
    id: 'font',
    header: 'Font',
    width: 140,
    render: (row: TypographyRow) => <MonoValue>{row.fontFamily}</MonoValue>,
  },
  {
    id: 'size',
    header: 'Size',
    width: 72,
    render: (row: TypographyRow) => <MonoValue>{row.fontSize}</MonoValue>,
  },
  {
    id: 'weight',
    header: 'Weight',
    width: 72,
    align: 'center' as const,
    render: (row: TypographyRow) => <MonoValue>{row.fontWeight}</MonoValue>,
  },
  {
    id: 'usage',
    header: 'Usage',
    width: 220,
    render: (row: TypographyRow) => (
      <Typography variant="caption" color="text.secondary">
        {row.usage}
      </Typography>
    ),
  },
  {
    id: 'preview',
    header: 'Preview',
    render: (row: TypographyRow) => <Typography variant={row.variant}>{row.sample}</Typography>,
  },
];

function TypographyScale() {
  const theme = useTheme();
  const rows: TypographyRow[] = typographyVariantOrder.map((variant) => ({
    variant,
    usage: typographySpecimens[variant].usage,
    sample: typographySpecimens[variant].sample,
    ...readTypographyMeta(variant, theme),
  }));

  return (
    <Stack spacing={3} sx={{ maxWidth: 960 }}>
      <Typography variant="body2" color="text.secondary">
        All typography variants in display order. Unbounded on h1–h2 only; everything else Manrope.
      </Typography>
      <TokenTableSection
        title="Typography scale"
        columns={typographyColumns}
        rows={rows}
        getRowKey={(row) => row.variant}
      />
    </Stack>
  );
}

const meta = {
  title: 'Foundations/Typography',
  component: TypographyScale,
} satisfies Meta<typeof TypographyScale>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {};
