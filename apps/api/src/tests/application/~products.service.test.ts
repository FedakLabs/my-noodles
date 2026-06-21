import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Category } from '@/application/categories/category.entity';
import { Country } from '@/application/countries/country.entity';
import { Product, ProductNotFoundException, ProductsService } from '@/application/products';
import { LocaleContext, LocalizedString } from '@/infrastructure/i18n';

import { jest } from '../jest-globals';

describe('ProductsService', () => {
  let service: ProductsService;
  let findOne: jest.Mock;
  let productsFind: jest.Mock;
  let categoriesFind: jest.Mock;
  let countriesFind: jest.Mock;

  beforeEach(async () => {
    findOne = jest.fn();
    productsFind = jest.fn();
    categoriesFind = jest.fn();
    countriesFind = jest.fn();

    const moduleRef = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            findOne,
            findAndCount: jest.fn(),
            find: productsFind,
          },
        },
        {
          provide: getRepositoryToken(Category),
          useValue: {
            find: categoriesFind,
          },
        },
        {
          provide: getRepositoryToken(Country),
          useValue: {
            find: countriesFind,
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

  it('returns full category and country taxonomy with zero counts', async () => {
    productsFind.mockResolvedValue([
      {
        priceMinor: 1_000,
        isTriedByUs: true,
        quantity: 2,
        category: { slug: 'snacks' },
        country: { slug: 'japan' },
      },
    ]);
    categoriesFind.mockResolvedValue([
      {
        slug: 'snacks',
        name: new LocalizedString({ uk: 'Снеки', en: 'Snacks' }),
      },
      {
        slug: 'drinks',
        name: new LocalizedString({ uk: 'Напої', en: 'Drinks' }),
      },
    ]);
    countriesFind.mockResolvedValue([
      {
        slug: 'japan',
        name: new LocalizedString({ uk: 'Японія', en: 'Japan' }),
      },
      {
        slug: 'korea',
        name: new LocalizedString({ uk: 'Корея', en: 'Korea' }),
      },
    ]);

    const result = await LocaleContext.run('uk', () => service.getFacets({ category: ['snacks'] }));

    expect(result.total).toBe(1);
    expect(result.facets.category).toEqual([
      { value: 'snacks', label: 'Снеки', count: 1 },
      { value: 'drinks', label: 'Напої', count: 0 },
    ]);
    expect(result.facets.country).toEqual([
      { value: 'japan', label: 'Японія', count: 1 },
      { value: 'korea', label: 'Корея', count: 0 },
    ]);
  });

  it('returns catalog-wide price bounds independent of other facet filters', async () => {
    productsFind.mockImplementation((options: { select?: { priceMinor?: boolean }; relations?: unknown }) => {
      if (options.select?.priceMinor && !options.relations) {
        return Promise.resolve([{ priceMinor: 500 }, { priceMinor: 5_000 }]);
      }

      return Promise.resolve([
        {
          priceMinor: 1_000,
          isTriedByUs: true,
          quantity: 2,
          category: { slug: 'snacks' },
          country: { slug: 'japan' },
        },
      ]);
    });
    categoriesFind.mockResolvedValue([]);
    countriesFind.mockResolvedValue([]);

    const result = await LocaleContext.run('uk', () =>
      service.getFacets({ category: ['snacks'], priceMin: 900, priceMax: 1_100 }),
    );

    expect(result.facets.price).toEqual({ min: 500, max: 5_000 });
  });
});
