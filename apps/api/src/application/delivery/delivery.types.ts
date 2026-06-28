import type { DeliveryMethod, DeliveryProvider } from '../orders/order-delivery.dto';

export type DeliveryCity = {
  ref: string;
  name: string;
};

export type DeliveryWarehouse = {
  ref: string;
  number: string;
  name: string;
  address?: string;
};

export type DeliveryEstimate = {
  estimatedDeliveryAt: string;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  shippingCostMinor: number;
};

export type DeliveryEstimateInput = {
  provider: DeliveryProvider;
  method: DeliveryMethod;
  cityRef?: string | null;
  cityName?: string | null;
  warehouseRef?: string | null;
  warehouseNumber?: string | null;
  street?: string | null;
  building?: string | null;
  orderCreatedAt: Date;
  itemCount: number;
};

export type DeliveryAddressSnapshot = {
  provider: DeliveryProvider;
  method: DeliveryMethod;
  city: string | null;
  cityRef?: string | null;
  warehouseNumber?: string | null;
  warehouseRef?: string | null;
  street?: string | null;
  building?: string | null;
};
