import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';

import { BusyArea, useBusyAreaState } from '../components/BusyArea';
import { StableLinearProgress } from '../components/StableLinearProgress';
import { DemoFilterPanel, DemoPanel, DemoProductGrid } from './_components/BusyAreaDemoContent';

const meta = {
  title: 'Components/BusyArea',
  component: BusyArea,
  args: {
    label: 'Loading…',
  },
  parameters: {
    docs: {
      description: {
        component:
          'One wrapper for busy regions. Configure with `dim`, `scrim`, and `show`. See **Docs** for dim vs scrim.',
      },
    },
  },
} satisfies Meta<typeof BusyArea>;

export default meta;

type Story = StoryObj<typeof meta>;

function ToggleButton({ busy, onToggle, label }: { busy: boolean; onToggle: () => void; label?: string }) {
  return (
    <Button variant="outlined" size="small" onClick={onToggle}>
      {busy ? 'Finish refetch' : (label ?? 'Simulate refetch')}
    </Button>
  );
}

const LAYER_DIAGRAM = `┌─────────────────────────────┐
│  SCRIM (invisible shield)   │  ← captures clicks; no tint
├─────────────────────────────┤
│  CONTENT (dimmed)           │  ← opacity fade on the wrapper
│  product tiles, text…       │
└─────────────────────────────┘`;

function ComparisonGuideIntro() {
  return (
    <Stack spacing={2.5}>
      <Stack spacing={0.75}>
        <Typography variant="h6">Two different mechanisms</Typography>
        <Typography variant="body2" color="text.secondary">
          When a region is busy, configure visual fade (`dim`) and click blocking (`scrim`) independently.
        </Typography>
      </Stack>

      <Box
        component="pre"
        sx={{
          m: 0,
          p: 2,
          borderRadius: 1.5,
          bgcolor: 'action.hover',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: '0.75rem',
          lineHeight: 1.5,
          overflow: 'auto',
          whiteSpace: 'pre',
        }}
      >
        {LAYER_DIAGRAM}
      </Box>

      <Stack spacing={2}>
        <Stack spacing={0.5}>
          <Typography variant="subtitle2">Dim</Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>What it is:</strong> The content itself is faded (<code>opacity: 0.65</code> on the
            wrapper).
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>In code:</strong> internal <code>BusyDim</code>, prop <code>dim</code>, token{' '}
            <code>BUSY_CONTENT_DIM_OPACITY</code>.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Effect:</strong> Text and images look washed out. No extra layer — you are changing the
            pixels that are already there. Clicks still reach the content underneath.
          </Typography>
        </Stack>

        <Stack spacing={0.5}>
          <Typography variant="subtitle2">Scrim</Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>What it is:</strong> An invisible click shield on top — no background tint.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>In code:</strong> internal <code>BusyScrim</code>, prop <code>scrim</code>.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Effect:</strong> Content keeps its opacity; pointer events are blocked. Carries{' '}
            <code>aria-busy</code> on the shield.
          </Typography>
        </Stack>

        <Stack spacing={0.5}>
          <Typography variant="subtitle2">Why both dim + scrim together?</Typography>
          <Typography variant="body2" color="text.secondary">
            On the catalog grid: <strong>dim</strong> — faded “searching” look; <strong>scrim</strong> —
            product tiles and links cannot be clicked during refetch.
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
}

function ComparisonDemoPanel({
  title,
  subtitle,
  whatToLookFor,
  lastClick,
  children,
}: {
  title: string;
  subtitle: string;
  whatToLookFor: string[];
  lastClick: string | null;
  children: ReactNode;
}) {
  return (
    <DemoPanel title={title} subtitle={subtitle} whatToLookFor={whatToLookFor}>
      <Stack spacing={1}>
        {children}
        <Typography variant="caption" color={lastClick ? 'text.primary' : 'text.secondary'}>
          {lastClick ? `Clicked: ${lastClick}` : 'Click a tile while busy — see whether clicks get through'}
        </Typography>
      </Stack>
    </DemoPanel>
  );
}

export const ComparisonGuide: Story = {
  name: 'Comparison guide',
  parameters: { layout: 'padded' },
  render: (args) => {
    const [busy, setBusy] = useState(false);
    const [dimClick, setDimClick] = useState<string | null>(null);
    const [scrimClick, setScrimClick] = useState<string | null>(null);
    const [bothClick, setBothClick] = useState<string | null>(null);
    const timing = useBusyAreaState(busy);

    return (
      <Stack spacing={3} sx={{ maxWidth: 1100 }}>
        <ComparisonGuideIntro />

        <Stack spacing={1}>
          <Typography variant="subtitle2">Live comparison</Typography>
          <Typography variant="body2" color="text.secondary">
            Same product grid, three prop combinations. Toggle busy, then click tiles in each column.
          </Typography>
          <ToggleButton busy={busy} onToggle={() => setBusy((v) => !v)} />
          <StableLinearProgress
            active={timing.active}
            transitionMs={timing.transitionMs}
            transitionEasing={timing.transitionEasing}
            aria-label={args.label ?? 'Loading…'}
          />
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, minmax(0, 1fr))' },
            gap: 2,
            alignItems: 'start',
          }}
        >
          <ComparisonDemoPanel
            title="dim only"
            subtitle="<BusyArea dim scrim={false} /> — opacity only"
            lastClick={dimClick}
            whatToLookFor={[
              'Wrapper opacity fades tiles — no extra layer.',
              'Pixels wash out; structure stays the same.',
              'Clicks still reach tiles (try while busy).',
            ]}
          >
            <BusyArea timing={timing} dim scrim={false} label={args.label ?? 'Loading…'}>
              <DemoProductGrid count={4} onTileClick={setDimClick} />
            </BusyArea>
          </ComparisonDemoPanel>

          <ComparisonDemoPanel
            title="scrim only"
            subtitle="<BusyArea scrim dim={false} /> — click shield only"
            lastClick={scrimClick}
            whatToLookFor={[
              'No opacity fade — tiles stay full strength.',
              'Invisible layer blocks all clicks.',
              'aria-busy on the shield while busy.',
            ]}
          >
            <BusyArea timing={timing} scrim dim={false} label={args.label ?? 'Loading…'}>
              <DemoProductGrid count={4} onTileClick={setScrimClick} />
            </BusyArea>
          </ComparisonDemoPanel>

          <ComparisonDemoPanel
            title="dim + scrim (default)"
            subtitle="<BusyArea /> — catalog grid"
            lastClick={bothClick}
            whatToLookFor={[
              'Dim fade + invisible click shield.',
              'Default catalog refetch pattern.',
              'Tiles not clickable while busy.',
            ]}
          >
            <BusyArea timing={timing} label={args.label ?? 'Loading…'}>
              <DemoProductGrid count={4} onTileClick={setBothClick} />
            </BusyArea>
          </ComparisonDemoPanel>
        </Box>
      </Stack>
    );
  },
};

export const ToolbarDim: Story = {
  name: 'Toolbar — dim only',
  tags: ['!autodocs'],
  render: (args) => {
    const [busy, setBusy] = useState(false);
    const timing = useBusyAreaState(busy);

    return (
      <Stack spacing={2} sx={{ maxWidth: 480 }}>
        <ToggleButton busy={busy} onToggle={() => setBusy((v) => !v)} />
        <BusyArea timing={timing} dim scrim={false} label={args.label ?? 'Loading…'}>
          <Typography variant="body2" color="text.secondary">
            {timing.active ? 'Searching…' : '24 products · page 2 of 5'}
          </Typography>
        </BusyArea>
        <DemoProductGrid count={4} />
      </Stack>
    );
  },
};

export const NavigationProgressBar: Story = {
  name: 'Navigation — progress bar only',
  parameters: {
    docs: {
      description: {
        story:
          'Global route changes in apps/web use a primary progress bar below the app header — not a scrim. Scrim remains for in-page busy regions (catalog grid, filters).',
      },
    },
  },
  render: (args) => {
    const [busy, setBusy] = useState(false);
    const theme = useTheme();
    const timing = useBusyAreaState(busy, { minVisibleMs: 0 });
    const toolbarHeight = theme.mixins.toolbar.minHeight;
    const progressVisible = busy || timing.mounted;

    return (
      <Stack spacing={2} sx={{ maxWidth: 480 }}>
        <ToggleButton busy={busy} onToggle={() => setBusy((v) => !v)} label="Simulate navigation" />
        <Box
          sx={{
            height: toolbarHeight,
            borderRadius: 1,
            bgcolor: 'action.selected',
            display: 'flex',
            alignItems: 'flex-end',
          }}
        >
          <StableLinearProgress
            active={progressVisible}
            height={3}
            color="primary"
            transitionMs={timing.transitionMs}
            transitionEasing={timing.transitionEasing}
            aria-label={args.label ?? 'Loading…'}
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          Fixed at the header/content seam — visible reassurance during navigation without blocking the page.
        </Typography>
        <DemoProductGrid count={4} />
      </Stack>
    );
  },
};

export const FilterPanel: Story = {
  name: 'Filters — dim + scrim',
  tags: ['!autodocs'],
  render: (args) => {
    const [busy, setBusy] = useState(false);

    return (
      <Stack spacing={2} sx={{ maxWidth: 320 }}>
        <ToggleButton busy={busy} onToggle={() => setBusy((v) => !v)} />
        <BusyArea busy={busy} label={args.label ?? 'Loading…'} borderRadius={1.5}>
          <DemoFilterPanel />
        </BusyArea>
      </Stack>
    );
  },
};

export const CatalogRefetchStack: Story = {
  name: 'Catalog refetch stack',
  render: (args) => {
    const [busy, setBusy] = useState(false);
    const [hasProducts, setHasProducts] = useState(true);
    const timing = useBusyAreaState(busy, { minVisibleMs: 0, showDelayMs: 0 });
    const showGrid = busy && hasProducts;

    return (
      <Stack spacing={2} sx={{ maxWidth: 520 }}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          <ToggleButton busy={busy} onToggle={() => setBusy((v) => !v)} />
          <Button variant="text" size="small" onClick={() => setHasProducts((v) => !v)}>
            {hasProducts ? 'Empty grid' : 'Show products'}
          </Button>
        </Stack>

        <Stack spacing={0.75}>
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <BusyArea timing={timing} dim scrim={false} label={args.label ?? 'Loading…'}>
              <Typography variant="body2" color="text.secondary">
                {timing.active ? 'Searching…' : '24 products · page 1 of 3'}
              </Typography>
            </BusyArea>
            <Typography variant="body2" color="text.secondary">
              Sort · View
            </Typography>
          </Stack>
          <StableLinearProgress
            active={timing.active}
            transitionMs={timing.transitionMs}
            transitionEasing={timing.transitionEasing}
            aria-label={args.label ?? 'Loading…'}
          />
        </Stack>

        {hasProducts ? (
          <BusyArea timing={timing} show={showGrid} label={args.label ?? 'Loading…'}>
            <DemoProductGrid count={6} />
          </BusyArea>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            Empty grid — progress + toolbar dim still run; grid busy chrome hidden via show.
          </Typography>
        )}
      </Stack>
    );
  },
};
