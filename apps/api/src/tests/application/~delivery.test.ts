import { APP_LOGGER } from '@my-noodles/api-lib/logging';
import { type INestApplication } from '@nestjs/common';
import request from 'supertest';

import { DeliveryController, DeliveryService } from '@/application/delivery';
import { DeliveryCatalogCache } from '@/application/delivery/delivery-catalog.cache';
import { DeliveryProviderFactory } from '@/application/delivery/providers/delivery-provider.factory';
import { MeestDeliveryAdapter } from '@/application/delivery/providers/meest.adapter';
import { NovaPoshtaDeliveryAdapter } from '@/application/delivery/providers/nova-poshta.adapter';
import { UkrposhtaDeliveryAdapter } from '@/application/delivery/providers/ukrposhta.adapter';
import { MeestService } from '@/infrastructure/external-apis/meest';
import { NovaPoshtaService } from '@/infrastructure/external-apis/nova-poshta';
import { UkrposhtaService } from '@/infrastructure/external-apis/ukrposhta';

import { apiHttpServer, createApiTestApp } from '../helpers/api-test-app';
import { afterAll, beforeAll, describe, expect, it, jest } from '../jest-globals';

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
        { provide: NovaPoshtaService, useValue: { isConfigured: () => false } },
        { provide: MeestService, useValue: { isConfigured: () => false } },
        { provide: UkrposhtaService, useValue: { isConfigured: () => false } },
        { provide: APP_LOGGER, useValue: { warn: jest.fn(), error: jest.fn(), info: jest.fn() } },
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

  it('GET /delivery/cities returns popular cities without q', async () => {
    const response = await request(apiHttpServer(app))
      .get('/api/delivery/cities')
      .query({ provider: 'nova-poshta' })
      .expect(200);

    const cities = response.body as { name: string }[];
    expect(cities).toHaveLength(5);
    expect(cities[0]?.name).toBe('Київ');
  });

  it('GET /delivery/cities returns matching cities when q is provided', async () => {
    const response = await request(apiHttpServer(app))
      .get('/api/delivery/cities')
      .query({ provider: 'nova-poshta', q: 'ки' })
      .expect(200);

    const cities = response.body as { name: string }[];
    expect(cities.some((city) => city.name === 'Київ')).toBe(true);
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
});
