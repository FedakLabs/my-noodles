import { IsDefined, IsString, IsUrl } from 'class-validator';

import { config } from '@/config';

export class UkrposhtaConfig {
  @IsDefined()
  @IsUrl({ require_tld: false })
  apiBaseUrl = process.env.UKRPOSHTA_API_BASE_URL?.trim() || 'https://www.ukrposhta.ua/address-classifier-ws';

  @IsString()
  apiKey = process.env.UKRPOSHTA_API_KEY?.trim() ?? '';

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }
}

export const ukrposhtaConfig = config.validate(new UkrposhtaConfig(), 'Ukrposhta configuration');
