import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselSlide,
  galleryCarouselOptions,
  railCarouselOptions,
} from '../components/Carousel';
import { DiscoveryCard, type MediaGalleryItem } from '../components/DiscoveryCard';
import { resolveSkin } from '../utils/skins';

const GALLERY_WIDTH = 480;
const RAIL_CARD_BASIS = { xs: '175px', md: '240px' } as const;

const gallerySlides = [
  { seed: 'carousel-a', label: 'Front' },
  { seed: 'carousel-b', label: 'Detail' },
  { seed: 'carousel-c', label: 'Packaging' },
];

const railProducts = [
  {
    title: 'Buldak Carbonara',
    subtitle: 'South Korea',
    price: '₴189',
    image: 'https://picsum.photos/seed/rail-buldak/400/400',
    skin: resolveSkin({ country: 'KR', brand: 'buldak', slug: 'buldak-carbonara' }),
  },
  {
    title: 'Pocky Matcha',
    subtitle: 'Japan',
    price: '₴89',
    image: 'https://picsum.photos/seed/rail-pocky/400/400',
    skin: resolveSkin({ country: 'JP', brand: 'pocky', slug: 'pocky-matcha' }),
  },
  {
    title: 'Pringles Sour Cream',
    subtitle: 'USA',
    price: '₴119',
    image: 'https://picsum.photos/seed/rail-pringles/400/400',
    skin: resolveSkin({ country: 'US', brand: 'pringles', slug: 'pringles-sour-cream' }),
  },
  {
    title: 'Mama Tom Yum',
    subtitle: 'Thailand',
    price: '₴79',
    image: 'https://picsum.photos/seed/rail-mama/400/400',
    skin: resolveSkin({ country: 'TH', slug: 'mama-tom-yum' }),
  },
];

const meta = {
  title: 'Components/Carousel',
  component: Carousel,
  args: {
    ariaLabel: 'Demo carousel',
  },
  parameters: {
    docs: {
      description: {
        component:
          'Embla carousel compound API. Use `galleryCarouselOptions` for full-bleed media and `railCarouselOptions` for partial-width product rails.',
      },
    },
  },
} satisfies Meta<typeof Carousel>;

export default meta;

type Story = StoryObj<typeof meta>;

function GallerySlide({ seed, label }: { seed: string; label: string }) {
  return (
    <Box
      component="img"
      src={`https://picsum.photos/seed/${seed}/800/800`}
      alt={label}
      sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  );
}

export const Gallery: Story = {
  render: (args) => (
    <Stack spacing={1} sx={{ maxWidth: GALLERY_WIDTH }}>
      <Typography variant="caption" color="text.secondary">
        Full-width slides with dot navigation — product media gallery (see MediaGallery)
      </Typography>
      <Carousel
        {...args}
        ariaLabel="Product photos"
        options={galleryCarouselOptions}
        sx={{
          aspectRatio: '1',
          borderRadius: 1.5,
          overflow: 'hidden',
          bgcolor: 'action.hover',
        }}
      >
        <CarouselContent>
          {gallerySlides.map((slide, index) => (
            <CarouselSlide
              key={slide.seed}
              index={index}
              slideLabel={`Slide ${index + 1} of ${gallerySlides.length}`}
            >
              <GallerySlide seed={slide.seed} label={slide.label} />
            </CarouselSlide>
          ))}
        </CarouselContent>
        <CarouselDots
          count={gallerySlides.length}
          slideLabel={(index, total) => `Slide ${index} of ${total}`}
        />
      </Carousel>
    </Stack>
  ),
};

export const ProductRail: Story = {
  render: (args) => (
    <Stack spacing={1}>
      <Typography variant="caption" color="text.secondary">
        Partial-width slides — alternatives rail on product detail
      </Typography>
      <Carousel {...args} ariaLabel="You might also like" options={railCarouselOptions}>
        <CarouselContent gap={2}>
          {railProducts.map((product, index) => (
            <CarouselSlide key={product.title} index={index} responsiveBasis={RAIL_CARD_BASIS}>
              <DiscoveryCard skin={product.skin}>
                <DiscoveryCard.Media
                  items={[
                    {
                      type: 'image',
                      url: product.image,
                      alt: product.title,
                    } satisfies MediaGalleryItem,
                  ]}
                  mode="static"
                />
                <DiscoveryCard.Body>
                  <Typography variant="subtitle1">{product.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {product.subtitle}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ mt: 0.5 }}>
                    {product.price}
                  </Typography>
                </DiscoveryCard.Body>
              </DiscoveryCard>
            </CarouselSlide>
          ))}
        </CarouselContent>
      </Carousel>
    </Stack>
  ),
};

export const SingleSlide: Story = {
  render: (args) => (
    <Stack spacing={1} sx={{ maxWidth: GALLERY_WIDTH }}>
      <Typography variant="caption" color="text.secondary">
        One slide — dots hidden, swipe inert
      </Typography>
      <Carousel
        {...args}
        ariaLabel="Single photo"
        options={galleryCarouselOptions}
        sx={{
          aspectRatio: '1',
          borderRadius: 1.5,
          overflow: 'hidden',
          bgcolor: 'action.hover',
        }}
      >
        <CarouselContent>
          <CarouselSlide index={0}>
            <GallerySlide seed="carousel-single" label="Hero" />
          </CarouselSlide>
        </CarouselContent>
        <CarouselDots count={1} slideLabel={(index, total) => `Slide ${index} of ${total}`} />
      </Carousel>
    </Stack>
  ),
};

export const ControlledSelection: Story = {
  render: (args) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    return (
      <Stack spacing={2} sx={{ maxWidth: GALLERY_WIDTH }}>
        <Stack direction="row" spacing={1}>
          {gallerySlides.map((slide, index) => (
            <Button
              key={slide.seed}
              size="small"
              variant={selectedIndex === index ? 'contained' : 'outlined'}
              onClick={() => setSelectedIndex(index)}
            >
              {slide.label}
            </Button>
          ))}
        </Stack>
        <Carousel
          {...args}
          ariaLabel="Controlled gallery"
          options={galleryCarouselOptions}
          onSelect={setSelectedIndex}
          sx={{
            aspectRatio: '1',
            borderRadius: 1.5,
            overflow: 'hidden',
            bgcolor: 'action.hover',
          }}
        >
          <CarouselContent>
            {gallerySlides.map((slide, index) => (
              <CarouselSlide key={slide.seed} index={index}>
                <GallerySlide seed={slide.seed} label={slide.label} />
              </CarouselSlide>
            ))}
          </CarouselContent>
          <CarouselDots
            count={gallerySlides.length}
            slideLabel={(index, total) => `Slide ${index} of ${total}`}
          />
        </Carousel>
        <Typography variant="body2" color="text.secondary">
          Selected index: {selectedIndex}
        </Typography>
      </Stack>
    );
  },
};
