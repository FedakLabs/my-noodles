import type { DeliveryCity, DeliveryWarehouse } from '../delivery.types';

const STUB_CITIES: DeliveryCity[] = [
  { ref: 'city-kyiv', name: 'Київ' },
  { ref: 'city-lviv', name: 'Львів' },
  { ref: 'city-odesa', name: 'Одеса' },
  { ref: 'city-kharkiv', name: 'Харків' },
  { ref: 'city-dnipro', name: 'Дніпро' },
  { ref: 'city-vinnytsia', name: 'Вінниця' },
];

const WAREHOUSE_TEMPLATES = [
  { number: '1', name: 'Відділення №1', address: 'вул. Центральна, 1' },
  { number: '5', name: 'Відділення №5', address: 'просп. Перемоги, 12' },
  { number: '12', name: 'Відділення №12', address: 'вул. Садова, 7' },
  { number: '23', name: 'Відділення №23', address: 'вул. Шевченка, 45' },
  { number: '31', name: 'Поштомат №31', address: 'ТЦ «Променад»' },
];

export function buildStubWarehouses(cityRef: string, query?: string): DeliveryWarehouse[] {
  const prefix = cityRef.replace(/^city-/, '');
  let warehouses = WAREHOUSE_TEMPLATES.map((template, index) => ({
    ref: `wh-${prefix}-${index + 1}`,
    number: template.number,
    name: template.name,
    address: template.address,
  }));

  const normalizedQuery = query?.trim().toLowerCase();
  if (normalizedQuery) {
    warehouses = warehouses.filter(
      (warehouse) =>
        warehouse.number.includes(normalizedQuery) ||
        warehouse.name.toLowerCase().includes(normalizedQuery) ||
        warehouse.address?.toLowerCase().includes(normalizedQuery),
    );
  }

  return warehouses;
}

export function getPopularStubCities(limit = 5): DeliveryCity[] {
  return STUB_CITIES.slice(0, limit);
}

export function filterStubCities(query: string): DeliveryCity[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return getPopularStubCities();
  }

  return STUB_CITIES.filter((city) => city.name.toLowerCase().includes(normalizedQuery));
}
