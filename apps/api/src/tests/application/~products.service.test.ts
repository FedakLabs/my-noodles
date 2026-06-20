import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Product, ProductNotFoundException, ProductsService } from '@/application/products';
import { LocaleContext, LocalizedString } from '@/infrastructure/i18n';

import { jest } from '../jest-globals';

describe('ProductsService', () => {
  let service: ProductsService;
  let findOne: jest.Mock;

  beforeEach(async () => {
    findOne = jest.fn();

    const moduleRef = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            findOne,
            findAndCount: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(ProductsService);
  });

  it('returns product detail with localized fields', async () => {
    findOne.mockResolvedValue({
      slug: 'pocky',
      name: new LocalizedString({ uk: 'Pocky', en: 'Pocky EN' }),
      description: new LocalizedString({ uk: 'Опис', en: 'Description' }),
      story: new LocalizedString({ uk: 'Історія', en: 'Story' }),
      forWhom: new LocalizedString({ uk: 'Для всіх', en: 'For everyone' }),
      priceMinor: 9_900,
      currency: 'UAH',
      images: [],
      quantity: 3,
      isTriedByUs: true,
      sortWeight: 10,
      weight: '47g',
      flavor: { spice: 0, sweet: 3, texture: 'crispy' },
      allergens: ['milk'],
      brand: { slug: 'glico', name: 'Glico' },
      country: {
        slug: 'taiwan',
        code: 'TW',
        name: new LocalizedString({ uk: 'Тайвань', en: 'Taiwan' }),
      },
      category: {
        slug: 'snacks',
        name: new LocalizedString({ uk: 'Снеки', en: 'Snacks' }),
      },
      alternatives: [],
    });

    const result = await LocaleContext.run('uk', () => service.getBySlug('pocky'));

    expect(result.name).toBe('Pocky');
    expect(result.description).toBe('Опис');
    expect(result.inStock).toBe(true);
  });

  it('throws when product is missing', async () => {
    findOne.mockResolvedValue(null);

    await expect(service.getBySlug('missing')).rejects.toBeInstanceOf(ProductNotFoundException);
  });
});
