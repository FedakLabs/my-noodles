import { LocalizedString } from '@my-noodles/api-lib/locale';

export const sampleProductId = '11111111-1111-4111-8111-111111111111';

export const sampleProduct = {
  id: sampleProductId,
  slug: 'pocky-matcha',
  nameLocale: new LocalizedString({ uk: 'Pocky Matcha', en: 'Pocky Matcha EN' }),
  descriptionLocale: new LocalizedString({ uk: 'Опис', en: 'Description' }),
  storyLocale: new LocalizedString({ uk: 'Історія', en: 'Story' }),
  forWhomLocale: new LocalizedString({ uk: 'Для всіх', en: 'For everyone' }),
  priceMinor: 9_900,
  currency: 'UAH',
  images: ['https://example.com/pocky.jpg'],
  videos: ['https://example.com/pocky.mp4'],
  quantity: 5,
  available: true,
  isTriedByUs: true,
  sortWeight: 10,
  weight: '47g',
  flavor: { spice: 0, sweet: 3, texture: 'crispy' },
  allergens: ['milk'],
  brand: { slug: 'glico', name: 'Glico' },
  seller: {
    id: '33333333-3333-4333-8333-333333333333',
    slug: 'my-noodles',
    name: 'MyNoodles',
    logoUrl: null,
  },
  sellerId: '33333333-3333-4333-8333-333333333333',
  country: {
    slug: 'taiwan',
    code: 'TW',
    nameLocale: new LocalizedString({ uk: 'Тайвань', en: 'Taiwan' }),
  },
  category: {
    slug: 'snacks',
    nameLocale: new LocalizedString({ uk: 'Снеки', en: 'Snacks' }),
  },
  alternatives: [],
};

export const sampleCategories = [
  {
    slug: 'snacks',
    nameLocale: new LocalizedString({ uk: 'Снеки', en: 'Snacks' }),
    sortOrder: 1,
  },
  {
    slug: 'drinks',
    nameLocale: new LocalizedString({ uk: 'Напої', en: 'Drinks' }),
    sortOrder: 2,
  },
];

export const sampleCountries = [
  {
    slug: 'taiwan',
    code: 'TW',
    nameLocale: new LocalizedString({ uk: 'Тайвань', en: 'Taiwan' }),
  },
];
