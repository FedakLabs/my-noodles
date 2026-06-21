export enum DeliveryProvider {
  NovaPoshta = 'nova-poshta',
  Ukrposhta = 'ukrposhta',
  Meest = 'meest',
}

export enum DeliveryMethod {
  Warehouse = 'warehouse',
  Courier = 'courier',
}

export const DELIVERY_PROVIDERS = [
  DeliveryProvider.NovaPoshta,
  DeliveryProvider.Ukrposhta,
  DeliveryProvider.Meest,
] as const;

export const DELIVERY_METHODS = [DeliveryMethod.Warehouse, DeliveryMethod.Courier] as const;

/** Shared OpenAPI enum schema — `enumName` must match generated client types. */
export const DELIVERY_PROVIDER_OPENAPI = {
  enum: DELIVERY_PROVIDERS,
  enumName: 'DeliveryProvider',
} as const;

export const DELIVERY_METHOD_OPENAPI = {
  enum: DELIVERY_METHODS,
  enumName: 'DeliveryMethod',
} as const;
