import { IsDefined, IsUrl } from 'class-validator';

import { config } from '@/config';

export class MeestConfig {
  @IsDefined()
  @IsUrl({ require_tld: false })
  apiBaseUrl = process.env.MEEST_API_BASE_URL?.trim() || 'https://publicapi.meest.com';
}

export const meestConfig = config.validate(new MeestConfig(), 'Meest configuration');
