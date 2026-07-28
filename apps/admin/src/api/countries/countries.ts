import {
  adminCountriesControllerCreate,
  adminCountriesControllerGetById,
  adminCountriesControllerList,
  adminCountriesControllerUpdate,
  type Country,
  type CreateCountryDto,
  type UpdateCountryDto,
} from '@my-noodles/api-clients/admin';
import { mutationOptions, queryOptions } from '@tanstack/react-query';

export type CountriesListParams = {
  page: number;
  limit: number;
  q?: string;
};

export const countriesQueries = {
  rootKey: ['countries'] as const,
  /** Root key — for invalidate/remove; do not pass to useQuery. */
  all: () =>
    queryOptions({
      queryKey: countriesQueries.rootKey,
    }),
  list: (params: CountriesListParams) =>
    queryOptions({
      queryKey: [...countriesQueries.rootKey, 'list', params] as const,
      queryFn: () =>
        adminCountriesControllerList({
          query: {
            page: params.page,
            limit: params.limit,
            q: params.q,
          },
        }),
    }),
  detail: (countryId: string) =>
    queryOptions({
      queryKey: [...countriesQueries.rootKey, 'detail', countryId] as const,
      queryFn: () =>
        adminCountriesControllerGetById({
          path: { id: countryId },
        }) as Promise<Country>,
    }),
};

export const countriesMutations = {
  rootKey: countriesQueries.rootKey,
  create: () =>
    mutationOptions({
      mutationKey: [...countriesMutations.rootKey, 'create'] as const,
      mutationFn: (body: CreateCountryDto) => adminCountriesControllerCreate({ body }),
    }),
  update: (countryId: string) =>
    mutationOptions({
      mutationKey: [...countriesMutations.rootKey, 'update', countryId] as const,
      mutationFn: (body: UpdateCountryDto) =>
        adminCountriesControllerUpdate({
          path: { id: countryId },
          body,
        }),
    }),
};
