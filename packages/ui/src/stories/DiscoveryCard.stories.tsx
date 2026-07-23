import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { DiscoveryCard, type MediaGalleryItem } from '../components/DiscoveryCard';
import CartIcon from '../icons/cart.svg';
import ChevronRightIcon from '../icons/chevron-right.svg';
import { resolveSkin } from '../utils/skins';

/** Typical catalog column width at `xs` (2-up grid on ~390px viewport). */
const CARD_WIDTH_XS = 175;
/** Typical catalog column width at `md` (4-up grid). */
const CARD_WIDTH_MD = 240;

const demoMediaItems: MediaGalleryItem[] = [
  {
    type: 'image',
    url: 'https://picsum.photos/seed/noodles/400/400',
    alt: 'Buldak Carbonara',
    viewTransitionName: 'product-image-demo',
  },
];

function CardPreview({ children, width }: { children: ReactNode; width: number }) {
  return <Box sx={{ width, minWidth: 0, maxWidth: width, flex: `0 0 ${width}px` }}>{children}</Box>;
}

function DiscoveryCardText({
  title,
  subtitle,
  price,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  price: ReactNode;
}) {
  return (
    <>
      <Typography variant="subtitle1">{title}</Typography>
      {subtitle ? (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      ) : null}
      <Typography variant="subtitle2" sx={{ mt: 0.5 }}>
        {price}
      </Typography>
    </>
  );
}

const meta = {
  title: 'Components/DiscoveryCard',
  component: DiscoveryCard,
  args: {
    title: 'Buldak Carbonara',
    subtitle: 'South Korea',
    price: '₴189',
    mediaItems: demoMediaItems,
  },
  argTypes: {
    country: { control: 'select', options: ['', 'KR', 'TH', 'CN', 'US', 'CA', 'TW'] },
    brand: { control: 'select', options: ['', 'buldak', 'pocky', 'pringles'] },
    category: { control: 'select', options: ['', 'noodles', 'sweets', 'drinks'] },
    inStock: { control: 'boolean' },
  },
} satisfies Meta<
  typeof DiscoveryCard & {
    title?: string;
    subtitle?: string;
    price?: string;
    mediaItems?: MediaGalleryItem[];
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

const storyActionButtonSx = {
  color: 'action.active',
  minWidth: 0,
  overflow: 'hidden',
  whiteSpace: 'nowrap',
} as const;

function catalogQuickActions(isPreview: boolean) {
  return (
    <DiscoveryCard.Actions
      actions={[
        <Button
          key="cart"
          variant="text"
          color="inherit"
          size="small"
          sx={storyActionButtonSx}
          aria-label={isPreview ? undefined : 'Add to cart'}
        >
          <Stack direction="row" spacing={isPreview ? 1 : 0} sx={{ minWidth: 0, alignItems: 'center' }}>
            <CartIcon aria-hidden size={20} />
            <DiscoveryCard.Collapse expanded={isPreview} orientation="horizontal">
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
          aria-label={isPreview ? undefined : 'Go to details'}
        >
          <Stack direction="row" spacing={isPreview ? 1 : 0} sx={{ minWidth: 0, alignItems: 'center' }}>
            <ChevronRightIcon aria-hidden size={20} />
            <DiscoveryCard.Collapse expanded={isPreview} orientation="horizontal">
              Go
            </DiscoveryCard.Collapse>
          </Stack>
        </Button>,
      ]}
    />
  );
}

const quickActionsRow = catalogQuickActions(false);
const quickActionsRowExpanded = catalogQuickActions(true);

function DiscoveryCardFromArgs(
  args: Story['args'] & {
    country?: string;
    brand?: string;
    category?: string;
    inStock?: boolean;
    mediaItems?: MediaGalleryItem[];
  },
  action: ReactNode = addToCartAction,
) {
  const { country, brand, category, inStock, title, subtitle, price, mediaItems, ...rest } = args;
  const skin = resolveSkin({
    country: country || null,
    brand: brand || null,
    category: category || null,
    slug: 'demo-product',
  });

  return (
    <DiscoveryCard skin={skin} {...rest}>
      <DiscoveryCard.Media items={mediaItems} />
      <DiscoveryCard.Body>
        <DiscoveryCardText title={title} subtitle={subtitle} price={price} />
      </DiscoveryCard.Body>
      {inStock === false ? (
        <Button variant="contained" size="small" fullWidth disabled>
          Out of stock
        </Button>
      ) : (
        action
      )}
    </DiscoveryCard>
  );
}

export const Default: Story = {
  render: (args) => (
    <CardPreview width={CARD_WIDTH_MD}>
      <DiscoveryCardFromArgs {...args} />
    </CardPreview>
  ),
  args: {
    country: 'KR',
    inStock: true,
  },
};

export const NoImage: Story = {
  render: (args) => (
    <CardPreview width={CARD_WIDTH_MD}>
      <DiscoveryCardFromArgs {...args} mediaItems={[]} action={addToCartAction} />
    </CardPreview>
  ),
};

export const MultipleImages: Story = {
  render: (args) => (
    <CardPreview width={CARD_WIDTH_MD}>
      <DiscoveryCardFromArgs
        {...args}
        mediaItems={[
          {
            type: 'image',
            url: 'https://picsum.photos/seed/noodles-front/400/400',
            alt: 'Buldak Carbonara front',
          },
          {
            type: 'image',
            url: 'https://picsum.photos/seed/noodles-detail/400/400',
            alt: 'Buldak Carbonara detail',
          },
        ]}
        action={addToCartAction}
      />
    </CardPreview>
  ),
};

export const HashFallbackSkin: Story = {
  render: (args) => {
    const skin = resolveSkin({ slug: 'mystery-mochi' });
    return (
      <CardPreview width={CARD_WIDTH_MD}>
        <DiscoveryCard skin={skin}>
          <DiscoveryCard.Media items={args.mediaItems} />
          <DiscoveryCard.Body>
            <DiscoveryCardText title="Mystery Mochi" subtitle={args.subtitle} price={args.price} />
          </DiscoveryCard.Body>
          {addToCartAction}
        </DiscoveryCard>
      </CardPreview>
    );
  },
};

export const LongText: Story = {
  render: (args) => (
    <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
      <CardPreview width={CARD_WIDTH_MD}>
        <DiscoveryCardFromArgs
          {...args}
          title="Samyang Buldak Hot Chicken Ramen Carbonara Flavor Extra Spicy"
          subtitle="South Korea"
          action={addToCartAction}
        />
      </CardPreview>
      <CardPreview width={CARD_WIDTH_MD}>
        <DiscoveryCardFromArgs {...args} title="Pocky" subtitle="Japan" action={addToCartAction} />
      </CardPreview>
    </Stack>
  ),
};

export const ExpandPreviewCollapsed: Story = {
  render: (args) => {
    const skin = resolveSkin({ country: 'KR', brand: 'buldak', slug: 'demo-product' });
    const cardMeta = (
      <DiscoveryCard.Body>
        <DiscoveryCardText title={args.title} subtitle={args.subtitle} price={args.price} />
      </DiscoveryCard.Body>
    );

    return (
      <CardPreview width={CARD_WIDTH_MD}>
        <DiscoveryCard.View
          view="summary"
          anchor="center"
          skin={skin}
          media={<DiscoveryCard.Media unframed items={args.mediaItems} mode="static" />}
          meta={cardMeta}
          actions={quickActionsRow}
          onClick={() => undefined}
        />
      </CardPreview>
    );
  },
};

export const ExpandPreviewLoading: Story = {
  render: (args) => {
    const cardMeta = (
      <DiscoveryCard.Body>
        <DiscoveryCardText title={args.title} subtitle={args.subtitle} price={args.price} />
      </DiscoveryCard.Body>
    );

    return (
      <CardPreview width={CARD_WIDTH_MD}>
        <DiscoveryCard.View
          view="preview"
          details={{ loading: true, content: null }}
          anchor="end"
          skin={resolveSkin({ country: 'KR' })}
          media={<DiscoveryCard.Media unframed items={args.mediaItems} mode="static" />}
          meta={cardMeta}
          actions={quickActionsRowExpanded}
          onClick={() => undefined}
        />
      </CardPreview>
    );
  },
};

export const ExpandPreviewExpanded: Story = {
  render: (args) => {
    const cardMeta = (
      <DiscoveryCard.Body>
        <DiscoveryCardText title={args.title} subtitle={args.subtitle} price={args.price} />
      </DiscoveryCard.Body>
    );

    return (
      <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
        <CardPreview width={CARD_WIDTH_MD}>
          <DiscoveryCard.View
            view="preview"
            anchor="start"
            skin={resolveSkin({ country: 'TH' })}
            media={
              <Box sx={{ aspectRatio: '1', borderRadius: 1.5, overflow: 'hidden' }}>
                <img
                  src="https://picsum.photos/seed/noodles/400/400"
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            }
            meta={cardMeta}
            actions={quickActionsRowExpanded}
            onClick={() => undefined}
            details={{
              loading: false,
              content: (
                <Typography variant="body2" color="text.secondary">
                  A creamy carbonara twist on the classic fire noodles — still spicy, but friendlier for
                  first-timers.
                </Typography>
              ),
            }}
          />
        </CardPreview>
        <CardPreview width={CARD_WIDTH_MD}>
          <DiscoveryCard.View
            view="summary"
            anchor="center"
            skin={resolveSkin({ country: 'JP' })}
            media={
              <DiscoveryCard.Media
                unframed
                items={[
                  {
                    type: 'image',
                    url: 'https://picsum.photos/seed/pocky/400/400',
                    alt: 'Pocky',
                  },
                ]}
                mode="static"
              />
            }
            meta={
              <DiscoveryCard.Body>
                <DiscoveryCardText title="Pocky" subtitle="Japan" price="₴89" />
              </DiscoveryCard.Body>
            }
            actions={quickActionsRow}
            onClick={() => undefined}
          />
        </CardPreview>
      </Stack>
    );
  },
};

export const CatalogGridWidths: Story = {
  render: (args) => (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} useFlexGap>
        <CardPreview width={CARD_WIDTH_XS}>
          <DiscoveryCardFromArgs
            {...args}
            title="Samyang Buldak Hot Chicken Ramen Carbonara Flavor Extra Spicy"
            subtitle="South Korea"
            action={addToCartAction}
          />
        </CardPreview>
        <CardPreview width={CARD_WIDTH_XS}>
          <DiscoveryCardFromArgs {...args} title="Pocky" subtitle="Japan" action={addToCartAction} />
        </CardPreview>
      </Stack>
      <Stack direction="row" spacing={2} useFlexGap>
        <CardPreview width={CARD_WIDTH_MD}>
          <DiscoveryCardFromArgs
            {...args}
            title="Samyang Buldak Hot Chicken Ramen Carbonara Flavor Extra Spicy"
            subtitle="South Korea"
            action={addToCartAction}
          />
        </CardPreview>
        <CardPreview width={CARD_WIDTH_MD}>
          <DiscoveryCardFromArgs {...args} title="Pocky" subtitle="Japan" action={addToCartAction} />
        </CardPreview>
      </Stack>
    </Stack>
  ),
};
