import { ApiClient } from '@my-noodles/api-lib/api-client';
import type { Logger } from 'winston';

export type MeestClientOptions = {
  apiBaseUrl: string;
};

type MeestApiResponse<T> = {
  status?: number | string;
  msg?: string | null;
  result?: T;
};

export type MeestLocalityData = {
  n_ua: string;
  n_ru?: string;
  t_ua?: string;
  city_id: string;
  reg?: string;
  dis?: string;
};

export type MeestLocalityRow = MeestLocalityData | { data: MeestLocalityData };

export type MeestBranchRow = {
  br_id: string;
  num_showcase?: number | string;
  type_public?: { ua?: string; ru?: string; en?: string };
  city?: { ua?: string; ru?: string; en?: string };
  street?: { ua?: string; ru?: string; en?: string };
  street_number?: string;
  zip?: string;
};

export class MeestApi extends ApiClient {
  constructor(
    private readonly settings: MeestClientOptions,
    logger: Logger,
  ) {
    super(logger);
  }

  protected getBaseUrl(): string {
    return this.settings.apiBaseUrl;
  }

  async searchLocalities(query: string): Promise<MeestLocalityData[]> {
    const response = await this.get<MeestApiResponse<MeestLocalityRow[]> | MeestLocalityRow[]>({
      url: '/geo_localities',
      params: { search_beginning: query },
      headers: this.defaultHeaders(),
    });

    return this.unwrapLocalities(response);
  }

  async getBranches(cityRef: string): Promise<MeestBranchRow[]> {
    const response = await this.get<MeestApiResponse<MeestBranchRow[]> | MeestBranchRow[]>({
      url: '/branches',
      params: { city: cityRef, lang: 'ua' },
      headers: this.defaultHeaders(),
    });

    return this.unwrapBranches(response);
  }

  private defaultHeaders() {
    return {
      Accept: 'application/json',
      'User-Agent': 'my-noodles-delivery/1.0',
    };
  }

  private unwrapLocalities(
    payload: MeestApiResponse<MeestLocalityRow[]> | MeestLocalityRow[],
  ): MeestLocalityData[] {
    const rows = this.unwrapResult(payload);

    return rows
      .map((row) => ('data' in row ? row.data : row))
      .filter((locality): locality is MeestLocalityData => Boolean(locality.city_id && locality.n_ua));
  }

  private unwrapBranches(payload: MeestApiResponse<MeestBranchRow[]> | MeestBranchRow[]): MeestBranchRow[] {
    return this.unwrapResult(payload).filter((branch): branch is MeestBranchRow => Boolean(branch.br_id));
  }

  private unwrapResult<T>(payload: MeestApiResponse<T[]> | T[] | undefined): T[] {
    if (!payload) {
      return [];
    }

    if (Array.isArray(payload)) {
      return payload;
    }

    return Array.isArray(payload.result) ? payload.result : [];
  }
}
