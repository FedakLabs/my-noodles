import { IsDefined, IsUrl } from 'class-validator';

import { config } from '@/config';

export class UkrposhtaConfig {
  @IsDefined()
  @IsUrl({ require_tld: false })
  apiBaseUrl = process.env.UKRPOSHTA_API_BASE_URL?.trim() || 'https://ukrposhta.ua/address-classifier-ws';
}

export const ukrposhtaConfig = config.validate(new UkrposhtaConfig(), 'Ukrposhta configuration');
