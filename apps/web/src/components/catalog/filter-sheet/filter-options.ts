import type { ProductFacetOptionDto } from '@my-noodles/api-clients/storefront';

export function isFilterOptionDisabled(option: ProductFacetOptionDto, selectedValues: string[]): boolean {
  return !selectedValues.includes(option.value) && option.count === 0;
}
