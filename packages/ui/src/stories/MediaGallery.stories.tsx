import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { MediaGallery, type MediaGalleryItem } from '../components/MediaGallery';

/** Product detail column width on `md` layouts. */
const GALLERY_WIDTH_MD = 480;
/** DiscoveryCard gallery width at `xs` (2-up catalog grid). */
const GALLERY_WIDTH_COMPACT = 175;

function GalleryPreview({ children, width }: { children: ReactNode; width: number | string }) {
  return (
    <Box
      sx={{
        width,
        minWidth: 0,
        maxWidth: width,
        flex: typeof width === 'number' ? `0 0 ${width}px` : undefined,
      }}
    >
      {children}
    </Box>
  );
}

const sampleImages: MediaGalleryItem[] = [
  {
    type: 'image',
    url: 'https://picsum.photos/seed/noodles-front/800/800',
    alt: 'Buldak Carbonara front',
    viewTransitionName: 'product-image-demo',
  },
  {
    type: 'image',
    url: 'https://picsum.photos/seed/noodles-detail/800/800',
    alt: 'Buldak Carbonara detail',
  },
  {
    type: 'image',
    url: 'https://picsum.photos/seed/noodles-pack/800/800',
    alt: 'Buldak Carbonara packaging',
  },
];

const sampleVideoUrl = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

const meta = {
  title: 'Components/MediaGallery',
  component: MediaGallery,
  args: {
    density: 'comfortable',
    items: sampleImages,
  },
  argTypes: {
    density: { control: 'select', options: ['compact', 'comfortable'] },
  },
} satisfies Meta<typeof MediaGallery>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SingleImage: Story = {
  render: (args) => (
    <GalleryPreview width={GALLERY_WIDTH_MD}>
      <MediaGallery
        {...args}
        items={[
          {
            type: 'image',
            url: 'https://picsum.photos/seed/noodles-front/800/800',
            alt: 'Buldak Carbonara',
            viewTransitionName: 'product-image-demo',
          },
        ]}
      />
    </GalleryPreview>
  ),
};

export const MultipleImages: Story = {
  render: (args) => (
    <GalleryPreview width={GALLERY_WIDTH_MD}>
      <MediaGallery {...args} items={sampleImages} />
    </GalleryPreview>
  ),
};

export const WithVideo: Story = {
  render: (args) => (
    <GalleryPreview width={GALLERY_WIDTH_MD}>
      <MediaGallery
        {...args}
        items={[
          sampleImages[0]!,
          {
            type: 'video',
            url: sampleVideoUrl,
            alt: 'Buldak Carbonara tasting clip',
            posterUrl: sampleImages[0]!.url,
          },
          sampleImages[1]!,
        ]}
      />
    </GalleryPreview>
  ),
};

export const ProductPageLayout: Story = {
  render: (args) => (
    <Stack spacing={1} sx={{ maxWidth: GALLERY_WIDTH_MD }}>
      <Typography variant="caption" color="text.secondary">
        Comfortable density — product detail hero column
      </Typography>
      <GalleryPreview width="100%">
        <MediaGallery
          {...args}
          density="comfortable"
          items={[
            ...sampleImages.slice(0, 2),
            {
              type: 'video',
              url: sampleVideoUrl,
              alt: 'Product tasting clip',
              posterUrl: sampleImages[0]!.url,
            },
          ]}
        />
      </GalleryPreview>
    </Stack>
  ),
};

export const CompactDensity: Story = {
  render: (args) => (
    <Stack spacing={1}>
      <Typography variant="caption" color="text.secondary">
        Compact density — DiscoveryCard inline gallery
      </Typography>
      <GalleryPreview width={GALLERY_WIDTH_COMPACT}>
        <MediaGallery {...args} density="compact" items={sampleImages.slice(0, 2)} />
      </GalleryPreview>
    </Stack>
  ),
};

export const CustomLabels: Story = {
  render: (args) => (
    <GalleryPreview width={GALLERY_WIDTH_MD}>
      <MediaGallery
        {...args}
        items={sampleImages.slice(0, 2)}
        labels={{
          gallery: 'Галерея медіа',
          slide: (index, total) => `Слайд ${index} з ${total}`,
          video: {
            play: 'Відтворити відео',
            pause: 'Пауза',
            mute: 'Вимкнути звук',
            unmute: 'Увімкнути звук',
          },
        }}
      />
    </GalleryPreview>
  ),
};

export const EmptyItems: Story = {
  render: (args) => (
    <Stack spacing={1}>
      <MediaGallery {...args} items={[]} />
      <Typography variant="caption" color="text.secondary">
        Renders nothing when items is empty.
      </Typography>
    </Stack>
  ),
};

export const MissingImageFallback: Story = {
  render: (args) => (
    <Stack spacing={1} sx={{ maxWidth: GALLERY_WIDTH_MD }}>
      <Typography variant="caption" color="text.secondary">
        Broken image URL — MyNoodles logo placeholder
      </Typography>
      <GalleryPreview width="100%">
        <MediaGallery
          {...args}
          items={[
            {
              type: 'image',
              url: 'https://example.invalid/product-photo.jpg',
              alt: 'Missing product photo',
            },
          ]}
        />
      </GalleryPreview>
    </Stack>
  ),
};

export const VideoWithoutPoster: Story = {
  render: (args) => (
    <Stack spacing={1} sx={{ maxWidth: GALLERY_WIDTH_MD }}>
      <Typography variant="caption" color="text.secondary">
        Video with no posterUrl — branded placeholder until first play
      </Typography>
      <GalleryPreview width="100%">
        <MediaGallery
          {...args}
          items={[
            {
              type: 'video',
              url: sampleVideoUrl,
              alt: 'Product tasting clip',
            },
          ]}
        />
      </GalleryPreview>
    </Stack>
  ),
};
