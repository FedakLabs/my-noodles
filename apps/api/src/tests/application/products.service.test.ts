import { LocaleContext, LocalizedString } from '@my-noodles/api-lib/locale';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Brand } from '@/application/brands/brand.entity';
import { Category } from '@/application/categories/category.entity';
import { Country } from '@/application/countries/country.entity';
import { Product, ProductNotFoundException, ProductsService } from '@/application/products';

import { jest } from '../jest-globals';

describe('ProductsService', () => {
  let service: ProductsService;
  let findOne: jest.Mock;
  let productsFind: jest.Mock;
  let categoriesFind: jest.Mock;
  let countriesFind: jest.Mock;
  let brandsFind: jest.Mock;

  beforeEach(async () => {
    findOne = jest.fn();
    productsFind = jest.fn();
    categoriesFind = jest.fn();
    countriesFind = jest.fn();
    brandsFind = jest.fn();

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
        {
          provide: getRepositoryToken(Brand),
          useValue: {
            find: brandsFind,
          },
        },
      ],
    }).compile();

    service = moduleRef.get(ProductsService);
  });

  it('returns product detail with localized fields', async () => {
    findOne.mockResolvedValue(
      Object.assign(new Product(), {
        slug: 'pocky',
        nameLocale: new LocalizedString({ uk: 'Pocky', en: 'Pocky EN' }),
        descriptionLocale: new LocalizedString({ uk: 'Опис', en: 'Description' }),
        storyLocale: new LocalizedString({ uk: 'Історія', en: 'Story' }),
        forWhomLocale: new LocalizedString({ uk: 'Для всіх', en: 'For everyone' }),
        priceMinor: 9_900,
        currency: 'UAH',
        images: [],
        videos: [],
        quantity: 3,
        isTriedByUs: true,
        sortWeight: 10,
        weight: '47g',
        flavor: { spice: 0, sweet: 3, texture: 'crispy' },
        allergens: ['milk'],
        brand: { slug: 'glico', name: 'Glico' },
        country: Object.assign(new Country(), {
          slug: 'taiwan',
          code: 'TW',
          nameLocale: new LocalizedString({ uk: 'Тайвань', en: 'Taiwan' }),
        }),
        category: Object.assign(new Category(), {
          slug: 'snacks',
          nameLocale: new LocalizedString({ uk: 'Снеки', en: 'Snacks' }),
        }),
        alternatives: [],
      }),
    );

    const result = await LocaleContext.run('uk', () => service.getBySlug('pocky'));

    expect(result.name).toBe('Pocky');
    expect(result.description).toBe('Опис');
    expect(result.quantity).toBeGreaterThan(0);
  });

  it('throws when product is missing', async () => {
    findOne.mockResolvedValue(null);

    await expect(service.getBySlug('missing')).rejects.toBeInstanceOf(ProductNotFoundException);
  });

  it('returns facet counts without applying that facet filter (multi-select within facet)', async () => {
    productsFind.mockImplementation(
      (options: {
        relations?: { category?: boolean; country?: boolean; brand?: boolean };
        select?: { id?: boolean; priceMinor?: boolean };
      }) => {
        if (options.relations?.category) {
          return Promise.resolve([{ category: { slug: 'snacks' } }, { category: { slug: 'drinks' } }]);
        }

        if (options.relations?.country) {
          return Promise.resolve([{ country: { slug: 'japan' } }]);
        }

        if (options.relations?.brand) {
          return Promise.resolve([{ brand: { slug: 'glico', name: 'Glico' } }]);
        }

        if (options.select?.priceMinor) {
          return Promise.resolve([{ priceMinor: 500 }, { priceMinor: 5_000 }]);
        }

        return Promise.resolve([
          {
            isTriedByUs: true,
            quantity: 2,
          },
        ]);
      },
    );
    categoriesFind.mockResolvedValue([
      Object.assign(new Category(), {
        slug: 'snacks',
        nameLocale: new LocalizedString({ uk: 'Снеки', en: 'Snacks' }),
      }),
      Object.assign(new Category(), {
        slug: 'drinks',
        nameLocale: new LocalizedString({ uk: 'Напої', en: 'Drinks' }),
      }),
    ]);
    countriesFind.mockResolvedValue([
      Object.assign(new Country(), {
        slug: 'japan',
        nameLocale: new LocalizedString({ uk: 'Японія', en: 'Japan' }),
      }),
      Object.assign(new Country(), {
        slug: 'korea',
        nameLocale: new LocalizedString({ uk: 'Корея', en: 'Korea' }),
      }),
    ]);
    brandsFind.mockResolvedValue([
      { slug: 'glico', name: 'Glico' },
      { slug: 'samyang', name: 'Samyang' },
    ]);

    const result = await LocaleContext.run('uk', () => service.getFacets({ category: ['snacks'] }));

    expect(result.total).toBe(1);
    expect(result.facets.category).toEqual([
      { value: 'snacks', label: 'Снеки', count: 1 },
      { value: 'drinks', label: 'Напої', count: 1 },
    ]);
    expect(result.facets.country).toEqual([
      { value: 'japan', label: 'Японія', count: 1 },
      { value: 'korea', label: 'Корея', count: 0 },
    ]);
    expect(result.facets.brand).toEqual([
      { value: 'glico', label: 'Glico', count: 1 },
      { value: 'samyang', label: 'Samyang', count: 0 },
    ]);
  });

  it('returns catalog-wide price bounds independent of other facet filters', async () => {
    productsFind.mockImplementation(
      (options: {
        select?: { priceMinor?: boolean };
        relations?: { category?: boolean; country?: boolean; brand?: boolean };
      }) => {
        if (options.select?.priceMinor && !options.relations) {
          return Promise.resolve([{ priceMinor: 500 }, { priceMinor: 5_000 }]);
        }

        if (options.relations?.category) {
          return Promise.resolve([{ category: { slug: 'snacks' } }]);
        }

        if (options.relations?.country) {
          return Promise.resolve([{ country: { slug: 'japan' } }]);
        }

        if (options.relations?.brand) {
          return Promise.resolve([]);
        }

        return Promise.resolve([
          {
            isTriedByUs: true,
            quantity: 2,
          },
        ]);
      },
    );
    categoriesFind.mockResolvedValue([]);
    countriesFind.mockResolvedValue([]);
    brandsFind.mockResolvedValue([]);

    const result = await LocaleContext.run('uk', () =>
      service.getFacets({ category: ['snacks'], priceMin: 900, priceMax: 1_100 }),
    );

    expect(result.facets.price).toEqual({ min: 500, max: 5_000 });
  });
});
