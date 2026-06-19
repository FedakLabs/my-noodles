import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { cardShadow, sheetShadow } from '../../shadows';
import { MonoValue, TokenTableSection } from '../_components/TokenTable';

type ElevationRow = {
  level: string;
  use: string;
  shadow: string;
};

const elevationRows: ElevationRow[] = [
  {
    level: 'Flat + border',
    use: 'Reference only — not default',
    shadow: 'none',
  },
  {
    level: 'Soft lift — card',
    use: 'Product cards, catalog grid',
    shadow: cardShadow,
  },
  {
    level: 'Soft lift — sheet',
    use: 'Dialogs, drawers, sticky bars',
    shadow: sheetShadow,
  },
];

function ElevationComparison() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Stack spacing={3} sx={{ maxWidth: 960 }}>
      <TokenTableSection
        title="Elevation levels"
        description="Warm-tinted shadows — trays on a counter, not floating SaaS cards."
        columns={[
          {
            id: 'level',
            header: 'Level',
            width: 160,
            render: (row: ElevationRow) => <MonoValue>{row.level}</MonoValue>,
          },
          {
            id: 'use',
            header: 'Use',
            width: 220,
            render: (row: ElevationRow) => (
              <Typography variant="caption" color="text.secondary">
                {row.use}
              </Typography>
            ),
          },
          {
            id: 'shadow',
            header: 'Shadow',
            render: (row: ElevationRow) => <MonoValue>{row.shadow}</MonoValue>,
          },
          {
            id: 'preview',
            header: 'Preview',
            width: 180,
            render: (row: ElevationRow) => (
              <Card
                onClick={
                  row.level.includes('sheet')
                    ? () => {
                        setDialogOpen(true);
                      }
                    : undefined
                }
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  boxShadow: row.shadow,
                  cursor: row.level.includes('sheet') ? 'pointer' : 'default',
                }}
              >
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Typography variant="caption">
                    {row.level.includes('sheet') ? 'Click → dialog' : 'Sample'}
                  </Typography>
                </CardContent>
              </Card>
            ),
          },
        ]}
        rows={elevationRows}
        getRowKey={(row) => row.level}
      />

      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
        }}
      >
        <DialogTitle>Sheet elevation</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Dialog paper uses sheetShadow + border-first separation from backdrop.
          </Typography>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}

const meta = {
  title: 'Foundations/Elevation',
  component: ElevationComparison,
} satisfies Meta<typeof ElevationComparison>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllLevels: Story = {};
