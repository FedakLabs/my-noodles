export type NovaPoshtaClientOptions = {
  apiBaseUrl: string;
  apiKey: string;
};

export type NovaPoshtaResponse<T = unknown> = {
  success: boolean;
  data: T;
  errors?: string[];
  warnings?: string[];
  info?: string[];
  messageCodes?: string[];
  errorCodes?: string[];
  warningCodes?: string[];
  infoCodes?: string[];
};

export type NovaPoshtaSettlementAddress = {
  Ref: string;
  Present: string;
  DeliveryCity: string;
  /** Settlement name without type/region, e.g. "Київка". */
  MainDescription?: string;
  /** Oblast name, e.g. "Херсонська". */
  Area?: string;
  /** Raion / district name, e.g. "Голопристанський". */
  Region?: string;
  /** Settlement type prefix, e.g. "с.", "м.". */
  SettlementTypeCode?: string;
};

export type NovaPoshtaSearchSettlementRow = {
  Addresses?: NovaPoshtaSettlementAddress[];
};

export type NovaPoshtaDirectoryCityRow = {
  Ref: string;
  Description: string;
  SettlementTypeDescription?: string;
  RegionsDescription?: string;
  AreaDescription?: string;
};

export type NovaPoshtaWarehouseRow = {
  Ref: string;
  Number: string;
  Description: string;
  ShortAddress?: string;
  CategoryOfWarehouse?: string;
  TypeOfWarehouse?: string;
};
