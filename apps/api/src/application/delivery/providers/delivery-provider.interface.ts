import type { DeliveryMethod, DeliveryProvider } from '../../orders/order-delivery.dto';
import type {
  DeliveryCity,
  DeliveryEstimate,
  DeliveryEstimateInput,
  DeliveryWarehouse,
} from '../delivery.types';

export interface DeliveryProviderAdapter {
  readonly provider: DeliveryProvider;

  searchCities(query: string, method: DeliveryMethod): Promise<DeliveryCity[]>;

  searchWarehouses(cityRef: string, query?: string): Promise<DeliveryWarehouse[]>;

  estimate(input: DeliveryEstimateInput): Promise<DeliveryEstimate>;
}
