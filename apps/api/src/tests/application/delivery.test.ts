import { type INestApplication } from '@nestjs/common';
import request from 'supertest';

import { DeliveryController, DeliveryService } from '@/application/delivery';
import { DeliveryCatalogCache } from '@/application/delivery/delivery-catalog.cache';
import { DeliveryProviderFactory } from '@/application/delivery/providers/delivery-provider.factory';
import { MeestDeliveryAdapter } from '@/application/delivery/providers/meest.adapter';
import { NovaPoshtaDeliveryAdapter } from '@/application/delivery/providers/nova-poshta.adapter';
import { UkrposhtaDeliveryAdapter } from '@/application/delivery/providers/ukrposhta.adapter';
import { MeestService } from '@/application/meest';
import { NovaPoshtaService } from '@/application/nova-poshta';
import { UkrposhtaService } from '@/application/ukrposhta';

import { apiHttpServer, createApiTestApp } from '../helpers/api-test-app';
import { afterAll, beforeAll, describe, expect, it, jest } from '../jest-globals';

const stubCities = [
  { ref: 'city-kyiv', name: 'Київ' },
  { ref: 'city-lviv', name: 'Львів' },
];

const stubWarehouses = [
  { ref: 'wh-kyiv-1', number: '1', name: 'Відділення №1', address: 'вул. Центральна, 1' },
];

describe('delivery (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createApiTestApp({
      controllers: [DeliveryController],
      providers: [
        DeliveryService,
        DeliveryCatalogCache,
        DeliveryProviderFactory,
        NovaPoshtaDeliveryAdapter,
        MeestDeliveryAdapter,
        UkrposhtaDeliveryAdapter,
        {
          provide: NovaPoshtaService,
          useValue: {
            searchCities: jest.fn((query: string) =>
              Promise.resolve(
                stubCities.filter((city) => city.name.toLowerCase().includes(query.toLowerCase())),
              ),
            ),
            searchWarehouses: jest.fn(() => Promise.resolve(stubWarehouses)),
          },
        },
        {
          provide: MeestService,
          useValue: {
            searchCities: jest.fn(() => Promise.resolve(stubCities)),
            searchWarehouses: jest.fn(() => Promise.resolve(stubWarehouses)),
          },
        },
        {
          provide: UkrposhtaService,
          useValue: {
            searchCities: jest.fn(() => Promise.resolve(stubCities)),
            searchWarehouses: jest.fn(() => Promise.resolve(stubWarehouses)),
          },
        },
      ],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /delivery/providers returns all providers', async () => {
    const response = await request(apiHttpServer(app)).get('/api/delivery/providers').expect(200);

    expect(response.body).toEqual([
      { id: 'nova-poshta', label: 'Нова Пошта' },
      { id: 'meest', label: 'Meest' },
      { id: 'ukrposhta', label: 'Укрпошта' },
    ]);
  });

  it('GET /delivery/cities returns empty list without q', async () => {
    const response = await request(apiHttpServer(app))
      .get('/api/delivery/cities')
      .query({ provider: 'nova-poshta', method: 'warehouse' })
      .expect(200);

    expect(response.body).toEqual([]);
  });

  it('GET /delivery/cities returns matching cities when q is provided', async () => {
    const response = await request(apiHttpServer(app))
      .get('/api/delivery/cities')
      .query({ provider: 'nova-poshta', method: 'warehouse', q: 'ки' })
      .expect(200);

    const cities = response.body as { name: string }[];
    expect(cities.some((city) => city.name === 'Київ')).toBe(true);
  });

  it('GET /delivery/cities rejects a missing method', async () => {
    await request(apiHttpServer(app))
      .get('/api/delivery/cities')
      .query({ provider: 'nova-poshta', q: 'ки' })
      .expect(400);
  });

  it('GET /delivery/warehouses returns warehouses for cityRef', async () => {
    const response = await request(apiHttpServer(app))
      .get('/api/delivery/warehouses')
      .query({ provider: 'meest', cityRef: 'city-kyiv' })
      .expect(200);

    const warehouses = response.body as { ref: string; number: string; name: string }[];
    expect(warehouses.length).toBeGreaterThan(0);
    expect(warehouses[0]).toMatchObject({
      ref: expect.stringMatching(/^wh-kyiv-/),
      number: expect.any(String),
      name: expect.any(String),
    });
  });

  it('GET /delivery/cities rejects an unknown provider', async () => {
    await request(apiHttpServer(app))
      .get('/api/delivery/cities')
      .query({ provider: 'dhl', method: 'warehouse', q: 'ки' })
      .expect(400);
  });

  it('GET /delivery/warehouses rejects a missing cityRef', async () => {
    await request(apiHttpServer(app))
      .get('/api/delivery/warehouses')
      .query({ provider: 'meest' })
      .expect(400);
  });
});
