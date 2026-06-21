import type { ProductFacetOptionDto } from '@my-noodles/api-clients/storefront';

/**
 * Pin options confirmed in the URL (applied search params) to the top in URL order.
 * Everything else keeps the API taxonomy order — draft-only picks do not move.
 */
export function sortFilterOptionsByAppliedUrl(
  options: ProductFacetOptionDto[],
  appliedFromUrl: readonly string[],
): ProductFacetOptionDto[] {
  if (appliedFromUrl.length === 0) {
    return options;
  }

  const appliedSet = new Set(appliedFromUrl);
  const appliedOptions = appliedFromUrl
    .map((value) => options.find((option) => option.value === value))
    .filter((option): option is ProductFacetOptionDto => option !== undefined);
  const restOptions = options.filter((option) => !appliedSet.has(option.value));

  return [...appliedOptions, ...restOptions];
}

export function isFilterOptionDisabled(option: ProductFacetOptionDto, draftSelected: string[]): boolean {
  return !draftSelected.includes(option.value) && option.count === 0;
}
