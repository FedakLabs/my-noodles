import { type INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';

import { Brand } from '@/application/brands/brand.entity';
import { Category } from '@/application/categories/category.entity';
import { Country } from '@/application/countries/country.entity';
import { Product, ProductsController, ProductsService } from '@/application/products';

import { sampleCategories, sampleCountries, sampleProduct } from '../fixtures/products';
import { apiHttpServer, createApiTestApp } from '../helpers/api-test-app';
import { afterAll, beforeAll, describe, expect, it, jest } from '../jest-globals';

describe('products (e2e)', () => {
  let app: INestApplication;
  let getManyAndCount: jest.Mock;
  let productsFind: jest.Mock;

  beforeAll(async () => {
    getManyAndCount = jest.fn().mockResolvedValue([[sampleProduct], 1]);
    productsFind = jest.fn().mockResolvedValue([
      {
        priceMinor: sampleProduct.priceMinor,
        isTriedByUs: sampleProduct.isTriedByUs,
        quantity: sampleProduct.quantity,
        category: sampleProduct.category,
        country: sampleProduct.country,
      },
    ]);

    const queryBuilder = {
      setFindOptions: jest.fn().mockReturnThis(),
      getManyAndCount,
    };

    app = await createApiTestApp({
      controllers: [ProductsController],
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
            find: productsFind,
          },
        },
        {
          provide: getRepositoryToken(Category),
          useValue: {
            find: jest.fn().mockResolvedValue(sampleCategories),
          },
        },
        {
          provide: getRepositoryToken(Country),
          useValue: {
            find: jest.fn().mockResolvedValue(sampleCountries),
          },
        },
        {
          provide: getRepositoryToken(Brand),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/products returns paginated catalog items', async () => {
    const server = apiHttpServer(app);

    const response = await request(server).get('/api/products?locale=uk&page=1&limit=12').expect(200);

    expect(response.body).toMatchObject({
      items: [
        {
          id: sampleProduct.id,
          slug: sampleProduct.slug,
          name: 'Pocky Matcha',
          priceMinor: 9_900,
          currency: 'UAH',
          inStock: true,
        },
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 12,
      },
    });
  });

  it('GET /api/products/facets returns filter options and counts', async () => {
    const server = apiHttpServer(app);

    const response = await request(server).get('/api/products/facets?locale=uk').expect(200);

    expect(response.body).toMatchObject({
      total: 1,
      facets: {
        category: [
          { value: 'snacks', label: 'Снеки', count: 1 },
          { value: 'drinks', label: 'Напої', count: 0 },
        ],
        country: [{ value: 'taiwan', label: 'Тайвань', count: 1 }],
        price: { min: 9_900, max: 9_900 },
      },
    });
  });

  it('GET /api/products/facets transforms query DTO values through the global validation pipe', async () => {
    const server = apiHttpServer(app);
    const getFacets = jest.spyOn(app.get(ProductsService), 'getFacets').mockResolvedValue({
      total: 0,
      facets: {
        category: [],
        country: [],
        brand: [],
        price: { min: 0, max: 0 },
        isTriedByUs: 0,
        inStock: 0,
      },
    });

    await request(server)
      .get('/api/products/facets?locale=uk&category=snacks&priceMin=100&inStock=true')
      .expect(200);

    expect(getFacets).toHaveBeenCalledWith(
      expect.objectContaining({
        locale: 'uk',
        category: ['snacks'],
        priceMin: 100,
        inStock: true,
      }),
    );

    getFacets.mockRestore();
  });

  it('GET /api/products rejects invalid filter query', async () => {
    const server = apiHttpServer(app);

    await request(server).get('/api/products?priceMin=-1').expect(400);
  });
});
