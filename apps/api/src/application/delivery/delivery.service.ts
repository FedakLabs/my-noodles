import { APP_LOGGER } from '@my-noodles/api-lib/logging';
import { Inject, Injectable } from '@nestjs/common';
import type { Logger } from 'winston';

import type { Order } from '../orders/order.entity';
import { DeliveryMethod, DeliveryProvider } from '../orders/order-delivery.dto';
import type { OrderDelivery } from '../orders/order-delivery.entity';
import type {
  DeliveryAddressSnapshot,
  DeliveryCity,
  DeliveryEstimate,
  DeliveryWarehouse,
} from './delivery.types';
import { DeliveryCatalogCache } from './delivery-catalog.cache';
import { DeliveryProviderFactory } from './providers/delivery-provider.factory';

const PROVIDER_LABELS: Record<DeliveryProvider, string> = {
  [DeliveryProvider.NovaPoshta]: 'Нова Пошта',
  [DeliveryProvider.Ukrposhta]: 'Укрпошта',
  [DeliveryProvider.Meest]: 'Meest',
};

@Injectable()
export class DeliveryService {
  constructor(
    @Inject(DeliveryProviderFactory) private readonly providerFactory: DeliveryProviderFactory,
    @Inject(DeliveryCatalogCache) private readonly catalogCache: DeliveryCatalogCache,
    @Inject(APP_LOGGER) private readonly logger: Logger,
  ) {}

  listProviders(): { id: DeliveryProvider; label: string }[] {
    return this.providerFactory.list().map((adapter) => ({
      id: adapter.provider,
      label: PROVIDER_LABELS[adapter.provider],
    }));
  }

  async searchCities(provider: DeliveryProvider, query = ''): Promise<DeliveryCity[]> {
    const normalizedQuery = query.trim();
    const cacheQuery = normalizedQuery.length >= 2 ? normalizedQuery : '__popular__';

    const cached = this.catalogCache.getCities(provider, cacheQuery);
    if (cached) {
      return cached;
    }

    const cities =
      normalizedQuery.length >= 2
        ? await this.providerFactory.get(provider).searchCities(normalizedQuery)
        : await this.providerFactory.get(provider).listPopularCities();

    this.catalogCache.setCities(provider, cacheQuery, cities);
    return cities;
  }

  async searchWarehouses(
    provider: DeliveryProvider,
    cityRef: string,
    query?: string,
  ): Promise<DeliveryWarehouse[]> {
    const cached = this.catalogCache.getWarehouses(provider, cityRef, query);
    if (cached) {
      return cached;
    }

    const warehouses = await this.providerFactory.get(provider).searchWarehouses(cityRef, query);
    this.catalogCache.setWarehouses(provider, cityRef, warehouses, query);
    return warehouses;
  }

  canEstimate(delivery: DeliveryAddressSnapshot): boolean {
    if (!delivery.city?.trim()) {
      return false;
    }

    if (delivery.method === DeliveryMethod.Warehouse) {
      return Boolean(delivery.warehouseRef?.trim() || delivery.warehouseNumber?.trim());
    }

    return Boolean(delivery.street?.trim() && delivery.building?.trim());
  }

  async estimateForOrder(order: Order): Promise<DeliveryEstimate | null> {
    if (!order.delivery || !this.canEstimate(order.delivery)) {
      return null;
    }

    try {
      return await this.estimateFromDelivery(order.delivery, order.createdAt, order.items.length);
    } catch (error) {
      this.logger.warn({
        msg: 'delivery.estimate.failed',
        orderId: order.id,
        provider: order.delivery.provider,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  estimateFromDelivery(
    delivery: DeliveryAddressSnapshot,
    orderCreatedAt: Date,
    itemCount: number,
  ): Promise<DeliveryEstimate> {
    const adapter = this.providerFactory.get(delivery.provider);

    return adapter.estimate({
      provider: delivery.provider,
      method: delivery.method,
      cityRef: delivery.cityRef,
      cityName: delivery.city,
      warehouseRef: delivery.warehouseRef,
      warehouseNumber: delivery.warehouseNumber,
      street: delivery.street,
      building: delivery.building,
      orderCreatedAt,
      itemCount,
    });
  }

  applyEstimateSnapshot(
    delivery: Pick<
      OrderDelivery,
      'estimatedDeliveryAt' | 'estimatedDaysMin' | 'estimatedDaysMax' | 'shippingCostMinor'
    >,
    estimate: DeliveryEstimate,
  ): void {
    delivery.estimatedDeliveryAt = new Date(estimate.estimatedDeliveryAt);
    delivery.estimatedDaysMin = estimate.estimatedDaysMin;
    delivery.estimatedDaysMax = estimate.estimatedDaysMax;
    delivery.shippingCostMinor = estimate.shippingCostMinor;
  }
}
