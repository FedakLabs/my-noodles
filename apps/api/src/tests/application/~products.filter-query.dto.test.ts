import { ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import request from 'supertest';
import { In } from 'typeorm';

import { Brand } from '@/application/brands/brand.entity';
import { Category } from '@/application/categories/category.entity';
import { Country } from '@/application/countries/country.entity';
import { Product, ProductsController, ProductsService } from '@/application/products';
import { ProductFacetsQueryDto } from '@/application/products/products.dto';
import { buildProductWhere } from '@/application/products/products.filters';

import { sampleCategories, sampleCountries, sampleProduct } from '../fixtures/products';
import { apiHttpServer, createApiTestApp } from '../helpers/api-test-app';
import { beforeEach, describe, expect, it, jest } from '../jest-globals';

const validationPipe = new ValidationPipe({
  whitelist: true,
  transform: true,
  forbidNonWhitelisted: true,
});

describe('ProductFacetsQueryDto', () => {
  it('coerces a single category query value to string[]', async () => {
    const dto = plainToInstance(ProductFacetsQueryDto, { locale: 'uk', category: 'noodles' });

    expect(await validate(dto)).toEqual([]);
    expect(dto.category).toEqual(['noodles']);
  });

  it('coerces a single country query value to string[]', async () => {
    const dto = plainToInstance(ProductFacetsQueryDto, { locale: 'uk', country: 'canada' });

    expect(await validate(dto)).toEqual([]);
    expect(dto.country).toEqual(['canada']);
  });

  it('coerces a single country query value through ValidationPipe', async () => {
    const dto = (await validationPipe.transform(
      { locale: 'uk', country: 'canada' },
      { type: 'query', metatype: ProductFacetsQueryDto },
    )) as ProductFacetsQueryDto;

    expect(dto.country).toEqual(['canada']);
  });

  it('keeps repeated country query values as string[]', async () => {
    const dto = plainToInstance(ProductFacetsQueryDto, {
      locale: 'uk',
      country: ['canada', 'china'],
    });

    expect(await validate(dto)).toEqual([]);
    expect(dto.country).toEqual(['canada', 'china']);
  });
});

describe('buildProductWhere', () => {
  it('filters by country slug arrays from validated DTOs', () => {
    const where = buildProductWhere({ country: ['canada'] });

    expect(where.country).toEqual({ slug: In(['canada']) });
  });
});

describe('GET /api/products/facets filter query', () => {
  let productsFind: jest.Mock;

  beforeEach(() => {
    productsFind = jest
      .fn()
      .mockImplementation(
        (options: {
          relations?: { category?: boolean; country?: boolean; brand?: boolean };
          select?: { id?: boolean; priceMinor?: boolean };
        }) => {
          if (options.relations?.category) {
            return Promise.resolve([{ category: sampleProduct.category }]);
          }

          if (options.relations?.country) {
            return Promise.resolve([{ country: sampleProduct.country }]);
          }

          if (options.relations?.brand) {
            return Promise.resolve([]);
          }

          if (options.select?.priceMinor) {
            return Promise.resolve([{ priceMinor: sampleProduct.priceMinor }]);
          }

          return Promise.resolve([
            {
              isTriedByUs: sampleProduct.isTriedByUs,
              quantity: sampleProduct.quantity,
            },
          ]);
        },
      );
  });

  it('applies a single category query param as an In() slug list', async () => {
    const app = await createApiTestApp({
      controllers: [ProductsController],
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: { find: productsFind, findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(Category),
          useValue: { find: jest.fn().mockResolvedValue(sampleCategories) },
        },
        {
          provide: getRepositoryToken(Country),
          useValue: { find: jest.fn().mockResolvedValue(sampleCountries) },
        },
        {
          provide: getRepositoryToken(Brand),
          useValue: { find: jest.fn().mockResolvedValue([]) },
        },
      ],
    });

    const server = apiHttpServer(app);

    await request(server).get('/api/products/facets?locale=uk&category=noodles').expect(200);

    const filteredCall = productsFind.mock.calls.find(([options]: [{ select?: { id?: boolean } }]) =>
      Boolean(options.select?.id),
    ) as [{ where: ReturnType<typeof buildProductWhere> }] | undefined;

    expect(filteredCall?.[0].where).toEqual({
      category: { slug: In(['noodles']) },
    });

    await app.close();
  });

  it('applies a single country query param as an In() slug list', async () => {
    const app = await createApiTestApp({
      controllers: [ProductsController],
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: { find: productsFind, findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(Category),
          useValue: { find: jest.fn().mockResolvedValue(sampleCategories) },
        },
        {
          provide: getRepositoryToken(Country),
          useValue: { find: jest.fn().mockResolvedValue(sampleCountries) },
        },
        {
          provide: getRepositoryToken(Brand),
          useValue: { find: jest.fn().mockResolvedValue([]) },
        },
      ],
    });

    const server = apiHttpServer(app);

    await request(server).get('/api/products/facets?locale=uk&country=canada').expect(200);

    const filteredCall = productsFind.mock.calls.find(([options]: [{ select?: { id?: boolean } }]) =>
      Boolean(options.select?.id),
    ) as [{ where: ReturnType<typeof buildProductWhere> }] | undefined;

    expect(filteredCall?.[0].where).toEqual({
      country: { slug: In(['canada']) },
    });

    await app.close();
  });
});
