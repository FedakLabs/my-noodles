import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { DiscoveryCard, isView, type DiscoveryCardViewPhase } from '../components/DiscoveryCard';
import { ProductDiscoveryCard } from '../components/ProductDiscoveryCard';
import CartIcon from '../icons/cart.svg';
import ChevronRightIcon from '../icons/chevron-right.svg';

const CARD_WIDTH_MD = 240;

const demoMediaItems = [
  {
    type: 'image' as const,
    url: 'https://picsum.photos/seed/product-card/400/400',
    alt: 'Buldak Carbonara',
  },
  {
    type: 'image' as const,
    url: 'https://picsum.photos/seed/product-card-detail/400/400',
    alt: 'Buldak Carbonara detail',
  },
];

function CardPreview({ children, width }: { children: ReactNode; width: number }) {
  return <Box sx={{ width, minWidth: 0, maxWidth: width, flex: `0 0 ${width}px` }}>{children}</Box>;
}

const storyActionButtonSx = {
  color: 'action.active',
  minWidth: 0,
  overflow: 'hidden',
  whiteSpace: 'nowrap',
} as const;

function catalogActions({ view }: { view: DiscoveryCardViewPhase }) {
  const expanded = isView(view, 'expanded');
  return [
    <Button
      key="cart"
      variant="text"
      color="inherit"
      size="small"
      sx={storyActionButtonSx}
      aria-label={expanded ? undefined : 'Add to cart'}
    >
      <Stack direction="row" spacing={expanded ? 1 : 0} sx={{ minWidth: 0, alignItems: 'center' }}>
        <CartIcon aria-hidden size={20} />
        <DiscoveryCard.Collapse expanded={expanded} orientation="horizontal">
          Add
        </DiscoveryCard.Collapse>
      </Stack>
    </Button>,
    <Button
      key="details"
      variant="text"
      color="inherit"
      size="small"
      sx={storyActionButtonSx}
      aria-label={expanded ? undefined : 'Go to details'}
    >
      <Stack direction="row" spacing={expanded ? 1 : 0} sx={{ minWidth: 0, alignItems: 'center' }}>
        <ChevronRightIcon aria-hidden size={20} />
        <DiscoveryCard.Collapse expanded={expanded} orientation="horizontal">
          Go
        </DiscoveryCard.Collapse>
      </Stack>
    </Button>,
  ];
}

const meta = {
  title: 'Components/ProductDiscoveryCard',
  component: ProductDiscoveryCard,
  parameters: {
    docs: {
      description: {
        component:
          'Storefront product card: summary ↔ preview via `DiscoveryCard.View`, skin from `skinInput`, optional lazy details. Click the card to expand; click outside to collapse.',
      },
    },
  },
  args: {
    name: 'Buldak Carbonara',
    countryLabel: 'South Korea',
    priceLabel: '₴189',
    mediaItems: demoMediaItems,
    skinInput: { country: 'KR', brand: 'buldak', slug: 'buldak-carbonara' },
    gridIndex: 0,
    gridColumns: 2,
  },
} satisfies Meta<typeof ProductDiscoveryCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Default catalog usage — click to expand preview; outside click collapses.',
      },
    },
  },
  render: (args) => (
    <CardPreview width={CARD_WIDTH_MD}>
      <ProductDiscoveryCard
        {...args}
        actions={catalogActions}
        details={{
          loading: false,
          story: 'A creamy carbonara twist on the classic fire noodles — still spicy, but friendlier.',
          forWhom: 'Anyone who likes heat with a softer landing.',
          emptyMessage: 'No details yet.',
          storyLabel: 'Story',
          descriptionLabel: 'Description',
          forWhomLabel: 'For whom',
        }}
      />
    </CardPreview>
  ),
};

export const PreviewLocked: Story = {
  name: 'Locked preview (rail)',
  parameters: {
    docs: {
      description: {
        story:
          'Pass `view` without `onViewChange` to lock the phase (e.g. alternatives rail always in summary).',
      },
    },
  },
  render: (args) => (
    <CardPreview width={CARD_WIDTH_MD}>
      <ProductDiscoveryCard {...args} view="summary" actions={catalogActions} />
    </CardPreview>
  ),
};

export const DetailsLoading: Story = {
  render: (args) => (
    <CardPreview width={CARD_WIDTH_MD}>
      <ProductDiscoveryCard
        {...args}
        defaultView="expanded"
        actions={catalogActions}
        details={{
          loading: true,
          emptyMessage: 'No details yet.',
          storyLabel: 'Story',
          descriptionLabel: 'Description',
          forWhomLabel: 'For whom',
        }}
      />
    </CardPreview>
  ),
};

export const DetailsEmpty: Story = {
  render: (args) => (
    <CardPreview width={CARD_WIDTH_MD}>
      <ProductDiscoveryCard
        {...args}
        defaultView="expanded"
        actions={catalogActions}
        details={{
          loading: false,
          emptyMessage: 'No story for this snack yet — try another.',
          storyLabel: 'Story',
          descriptionLabel: 'Description',
          forWhomLabel: 'For whom',
        }}
      />
    </CardPreview>
  ),
};
