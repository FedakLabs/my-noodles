import axios, { type AxiosInstance } from 'axios';

import { CollectionsApi } from '../../generated/storefront/api/collections-api';
import { CountriesApi } from '../../generated/storefront/api/countries-api';
import { HealthApi } from '../../generated/storefront/api/health-api';
import { OrdersApi } from '../../generated/storefront/api/orders-api';
import { ProductsApi } from '../../generated/storefront/api/products-api';
import { Configuration } from '../../generated/storefront/configuration';

export type StorefrontApiClients = {
  instance: AxiosInstance;
  collectionsApi: CollectionsApi;
  countriesApi: CountriesApi;
  healthApi: HealthApi;
  ordersApi: OrdersApi;
  productsApi: ProductsApi;
};

export function setupApiClients(baseURL: string): StorefrontApiClients {
  const normalizedBaseUrl = baseURL.replace(/\/+$/, '');
  const instance = axios.create({ baseURL: normalizedBaseUrl });
  const configuration = new Configuration({ basePath: normalizedBaseUrl });

  return {
    instance,
    collectionsApi: new CollectionsApi(configuration, normalizedBaseUrl, instance),
    countriesApi: new CountriesApi(configuration, normalizedBaseUrl, instance),
    healthApi: new HealthApi(configuration, normalizedBaseUrl, instance),
    ordersApi: new OrdersApi(configuration, normalizedBaseUrl, instance),
    productsApi: new ProductsApi(configuration, normalizedBaseUrl, instance),
  };
}
