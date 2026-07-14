import { IsDefined, IsNotEmpty, IsString, IsUrl } from 'class-validator';

import { config } from '@/config';

const DEFAULT_NOVA_POSHTA_API_BASE_URL = 'https://api.novaposhta.ua/v2.0/json/';

function normalizeNovaPoshtaBaseUrl(url: string): string {
  return url.endsWith('/') ? url : `${url}/`;
}

export class NovaPoshtaConfig {
  @IsDefined()
  @IsUrl({ require_tld: false })
  apiBaseUrl = normalizeNovaPoshtaBaseUrl(
    process.env.NOVA_POSHTA_API_BASE_URL?.trim() || DEFAULT_NOVA_POSHTA_API_BASE_URL,
  );

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  apiKey = process.env.NOVA_POSHTA_API_KEY?.trim() ?? '';
}

export const novaPoshtaConfig = config.validate(new NovaPoshtaConfig(), 'Nova Poshta configuration');
