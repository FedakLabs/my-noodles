import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { DiscoveryCard } from '../components/DiscoveryCard';
import { resolveSkin, skinVarsToStyle } from '../utils/skins';

/** Typical catalog column width at `xs` (2-up grid on ~390px viewport). */
const CARD_WIDTH_XS = 175;
/** Typical catalog column width at `md` (4-up grid). */
const CARD_WIDTH_MD = 240;

function CardPreview({ children, width }: { children: ReactNode; width: number }) {
  return <Box sx={{ width, minWidth: 0, maxWidth: width, flex: `0 0 ${width}px` }}>{children}</Box>;
}

const meta = {
  title: 'Components/DiscoveryCard',
  component: DiscoveryCard,
  args: {
    title: 'Buldak Carbonara',
    subtitle: 'South Korea',
    price: '₴189',
    image: {
      url: 'https://picsum.photos/seed/noodles/400/400',
      alt: 'Buldak Carbonara',
      viewTransitionName: 'product-image-demo',
    },
  },
  argTypes: {
    country: { control: 'select', options: ['', 'KR', 'TH', 'CN', 'US', 'CA', 'TW'] },
    brand: { control: 'select', options: ['', 'buldak', 'pocky', 'pringles'] },
    category: { control: 'select', options: ['', 'noodles', 'sweets', 'drinks'] },
    inStock: { control: 'boolean' },
  },
} satisfies Meta<
  typeof DiscoveryCard & {
    country?: string;
    brand?: string;
    category?: string;
    inStock?: boolean;
  }
>;

export default meta;

type Story = StoryObj<typeof meta>;

const addToCartAction = (
  <Button variant="contained" size="small" fullWidth>
    Add to cart
  </Button>
);

export const Default: Story = {
  render: (args) => {
    const { country, brand, category, inStock, ...cardArgs } = args as typeof args & {
      country?: string;
      brand?: string;
      category?: string;
      inStock?: boolean;
    };
    const skin = resolveSkin({
      country: country || null,
      brand: brand || null,
      category: category || null,
      slug: 'demo-product',
    });

    return (
      <CardPreview width={CARD_WIDTH_MD}>
        <DiscoveryCard
          {...cardArgs}
          skinStyle={skinVarsToStyle(skin.cssVars)}
          action={
            <Button variant="contained" size="small" fullWidth disabled={inStock === false}>
              {inStock === false ? 'Out of stock' : 'Add to cart'}
            </Button>
          }
        />
      </CardPreview>
    );
  },
  args: {
    country: 'KR',
    inStock: true,
  },
};

export const NoImage: Story = {
  render: (args) => (
    <CardPreview width={CARD_WIDTH_MD}>
      <DiscoveryCard {...args} image={null} action={addToCartAction} />
    </CardPreview>
  ),
};

export const HashFallbackSkin: Story = {
  render: (args) => {
    const skin = resolveSkin({ slug: 'mystery-mochi' });
    return (
      <CardPreview width={CARD_WIDTH_MD}>
        <DiscoveryCard
          {...args}
          title="Mystery Mochi"
          skinStyle={skinVarsToStyle(skin.cssVars)}
          action={addToCartAction}
        />
      </CardPreview>
    );
  },
};

export const LongText: Story = {
  render: (args) => (
    <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
      <CardPreview width={CARD_WIDTH_MD}>
        <DiscoveryCard
          {...args}
          title="Samyang Buldak Hot Chicken Ramen Carbonara Flavor Extra Spicy"
          subtitle="South Korea"
          action={addToCartAction}
        />
      </CardPreview>
      <CardPreview width={CARD_WIDTH_MD}>
        <DiscoveryCard {...args} title="Pocky" subtitle="Japan" action={addToCartAction} />
      </CardPreview>
    </Stack>
  ),
};

export const CatalogGridWidths: Story = {
  render: (args) => (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} useFlexGap>
        <CardPreview width={CARD_WIDTH_XS}>
          <DiscoveryCard
            {...args}
            title="Samyang Buldak Hot Chicken Ramen Carbonara Flavor Extra Spicy"
            subtitle="South Korea"
            action={addToCartAction}
          />
        </CardPreview>
        <CardPreview width={CARD_WIDTH_XS}>
          <DiscoveryCard {...args} title="Pocky" subtitle="Japan" action={addToCartAction} />
        </CardPreview>
      </Stack>
      <Stack direction="row" spacing={2} useFlexGap>
        <CardPreview width={CARD_WIDTH_MD}>
          <DiscoveryCard
            {...args}
            title="Samyang Buldak Hot Chicken Ramen Carbonara Flavor Extra Spicy"
            subtitle="South Korea"
            action={addToCartAction}
          />
        </CardPreview>
        <CardPreview width={CARD_WIDTH_MD}>
          <DiscoveryCard {...args} title="Pocky" subtitle="Japan" action={addToCartAction} />
        </CardPreview>
      </Stack>
    </Stack>
  ),
};
