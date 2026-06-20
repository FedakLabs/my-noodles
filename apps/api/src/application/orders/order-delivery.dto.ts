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
