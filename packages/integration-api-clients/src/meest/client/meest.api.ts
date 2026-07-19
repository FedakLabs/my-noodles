import { ApiClientException, FetchApiClient } from '@my-noodles/api-lib/api-client';

import { auth, citySearchPost, type AuthResponse, type CitySearchPostResponse } from './generated';
import type { Client } from './generated/client';
import { createClient } from './generated/client';

export type ClientMeestApiOptions = {
  /** Defaults to Meest openAPI host from the generated client. */
  apiBaseUrl?: string;
  /** Static token or resolver used for `token` apiKey security. */
  token?: string | (() => string | undefined | Promise<string | undefined>);
};

const DEFAULT_CLIENT_BASE_URL = 'https://api.meest.com/v3.0/openAPI';

export class ClientMeestApi extends FetchApiClient {
  readonly client: Client;

  constructor(private readonly settings: ClientMeestApiOptions = {}) {
    super();
    this.client = createClient({
      baseUrl: this.getBaseUrl(),
      fetch: this.fetch,
      auth: async () => {
        const token = this.settings.token;
        return typeof token === 'function' ? await token() : token;
      },
      headers: {
        Accept: 'application/json',
      },
    });
  }

  protected getBaseUrl(): string {
    return this.settings.apiBaseUrl?.trim() || DEFAULT_CLIENT_BASE_URL;
  }

  protected override assertResponseOk(body: unknown, status: number): void {
    if (typeof body !== 'object' || body === null || !('status' in body)) {
      return;
    }

    const responseStatus = String((body as { status?: unknown }).status).toLowerCase();
    if (responseStatus !== 'error') {
      return;
    }

    const payload = body as {
      info?: { message?: string; messageDetails?: string };
      message?: string;
      messageDetails?: string;
    };
    const message =
      payload.info?.message ||
      payload.message ||
      payload.info?.messageDetails ||
      payload.messageDetails ||
      'Meest Client API request failed';

    throw new ApiClientException(message, body, status);
  }

  /** POST /auth — exchange credentials for an API token. */
  async authenticate(username: string, password: string): Promise<AuthResponse> {
    const { data } = await auth({
      client: this.client,
      body: { username, password },
    });

    return data as AuthResponse;
  }

  /** POST /citySearch — example authenticated directory call. */
  async searchCities(cityDescr: string): Promise<CitySearchPostResponse> {
    const { data } = await citySearchPost({
      client: this.client,
      body: {
        filters: { cityDescr },
      },
    });

    return data as CitySearchPostResponse;
  }
}
