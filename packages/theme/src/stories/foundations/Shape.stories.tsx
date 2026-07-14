import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { spacingUnit } from '../../spacing';
import { MonoValue, TokenTableSection } from '../_components/TokenTable';
import { borderRadiusOrder, modalWidthOrder, spacingScaleOrder } from '../storyCatalog';

type RadiusRow = { token: string; px: number; role: string };
type SpacingRow = { step: number; px: string };
type ScaleRow = { token: string; step: number; px: string };
type ModalRow = { token: string; px: number };

const radiusRoles: Record<(typeof borderRadiusOrder)[number], string> = {
  none: 'Avoid on customer UI',
  utility: 'Chips, inputs, icon buttons',
  discovery: 'Product cards, tiles',
  sheet: 'Dialogs, drawers',
  pill: 'Primary / secondary buttons',
};

function ShapeAndSpacing() {
  const theme = useTheme();

  const radiusRows: RadiusRow[] = borderRadiusOrder.map((name) => ({
    token: name,
    px: theme.borderRadius[name],
    role: radiusRoles[name],
  }));

  const spacingRows: SpacingRow[] = [0, 1, 2, 3, 4, 5, 6, 8].map((step) => ({
    step,
    px: theme.spacing(step),
  }));

  const gapRows: ScaleRow[] = spacingScaleOrder.map((size) => ({
    token: `gap.${size}`,
    step: theme.customSpacing.gap[size],
    px: theme.spacing(theme.customSpacing.gap[size]),
  }));

  const paddingRows: ScaleRow[] = spacingScaleOrder.map((size) => ({
    token: `padding.${size}`,
    step: theme.customSpacing.padding[size],
    px: theme.spacing(theme.customSpacing.padding[size]),
  }));

  const modalRows: ModalRow[] = modalWidthOrder.map((name) => ({
    token: name,
    px: theme.modalWidths[name],
  }));

  return (
    <Stack spacing={4} sx={{ maxWidth: 960 }}>
      <TokenTableSection
        title="Border radius"
        description="Split personality — discovery vs utility vs action."
        columns={[
          {
            id: 'token',
            header: 'Token',
            width: 120,
            render: (row: RadiusRow) => <MonoValue>{row.token}</MonoValue>,
          },
          {
            id: 'px',
            header: 'px',
            width: 64,
            render: (row: RadiusRow) => <MonoValue>{String(row.px)}</MonoValue>,
          },
          {
            id: 'role',
            header: 'Use',
            width: 220,
            render: (row: RadiusRow) => (
              <Typography variant="caption" color="text.secondary">
                {row.role}
              </Typography>
            ),
          },
          {
            id: 'preview',
            header: 'Preview',
            render: (row: RadiusRow) => (
              <Box
                sx={{
                  bgcolor: 'primary.main',
                  borderRadius: row.px,
                  height: 40,
                  width: row.token === 'pill' ? 120 : 80,
                }}
              />
            ),
          },
        ]}
        rows={radiusRows}
        getRowKey={(row) => row.token}
      />

      <TokenTableSection
        title={`Spacing scale (${String(spacingUnit)}px unit)`}
        columns={[
          {
            id: 'step',
            header: 'Step',
            width: 72,
            render: (row: SpacingRow) => <MonoValue>{String(row.step)}</MonoValue>,
          },
          {
            id: 'px',
            header: 'Output',
            width: 96,
            render: (row: SpacingRow) => <MonoValue>{row.px}</MonoValue>,
          },
          {
            id: 'preview',
            header: 'Bar',
            render: (row: SpacingRow) => <Box sx={{ bgcolor: 'primary.main', height: row.px, width: 48 }} />,
          },
        ]}
        rows={spacingRows}
        getRowKey={(row) => String(row.step)}
      />

      <TokenTableSection
        title="customSpacing"
        columns={[
          {
            id: 'token',
            header: 'Token',
            width: 140,
            render: (row: ScaleRow) => <MonoValue>{row.token}</MonoValue>,
          },
          {
            id: 'step',
            header: 'Step',
            width: 72,
            render: (row: ScaleRow) => <MonoValue>{String(row.step)}</MonoValue>,
          },
          {
            id: 'px',
            header: 'Output',
            width: 96,
            render: (row: ScaleRow) => <MonoValue>{row.px}</MonoValue>,
          },
        ]}
        rows={[...gapRows, ...paddingRows]}
        getRowKey={(row) => row.token}
      />

      <TokenTableSection
        title="modalWidths"
        columns={[
          {
            id: 'token',
            header: 'Token',
            width: 120,
            render: (row: ModalRow) => <MonoValue>{row.token}</MonoValue>,
          },
          {
            id: 'px',
            header: 'px',
            width: 96,
            render: (row: ModalRow) => <MonoValue>{String(row.px)}</MonoValue>,
          },
          {
            id: 'preview',
            header: 'Width bar',
            render: (row: ModalRow) => (
              <Box
                sx={{
                  bgcolor: 'primary.main',
                  height: 8,
                  maxWidth: '100%',
                  width: Math.min(row.px, 720),
                }}
              />
            ),
          },
        ]}
        rows={modalRows}
        getRowKey={(row) => row.token}
      />
    </Stack>
  );
}

const meta = {
  title: 'Foundations/Shape & Spacing',
  component: ShapeAndSpacing,
} satisfies Meta<typeof ShapeAndSpacing>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllTokens: Story = {};
