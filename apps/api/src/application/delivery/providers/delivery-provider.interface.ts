import type { DeliveryProvider } from '../../orders/order-delivery.dto';
import type {
  DeliveryCity,
  DeliveryEstimate,
  DeliveryEstimateInput,
  DeliveryWarehouse,
} from '../delivery.types';

export interface DeliveryProviderAdapter {
  readonly provider: DeliveryProvider;

  searchCities(query: string): Promise<DeliveryCity[]>;

  listPopularCities(): Promise<DeliveryCity[]>;

  searchWarehouses(cityRef: string, query?: string): Promise<DeliveryWarehouse[]>;

  estimate(input: DeliveryEstimateInput): Promise<DeliveryEstimate>;
}
