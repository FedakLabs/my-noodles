import { IsDefined, IsNotEmpty, IsString, IsUrl } from 'class-validator';

import { config } from '@/config';

export class UkrposhtaConfig {
  @IsDefined()
  @IsUrl({ require_tld: false })
  apiBaseUrl = process.env.UKRPOSHTA_API_BASE_URL?.trim() || 'https://www.ukrposhta.ua/address-classifier-ws';

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  apiKey = process.env.UKRPOSHTA_API_KEY?.trim() ?? '';
}

export const ukrposhtaConfig = config.validate(new UkrposhtaConfig(), 'Ukrposhta configuration');
