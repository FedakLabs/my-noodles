import { IsDefined, IsString, MinLength } from 'class-validator';

import { config } from '@/config';

export class TawkSupportConfig {
  @IsDefined()
  @IsString()
  @MinLength(1)
  apiKey = process.env.TAWK_API_KEY;
}

export const tawkSupportConfig = config.validate(new TawkSupportConfig(), 'Tawk support configuration');
