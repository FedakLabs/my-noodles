import { IsDefined, IsString, MinLength } from 'class-validator';

import { config } from '@/config';

export class TawkSupportConfig {
  @IsDefined()
  @IsString()
  @MinLength(1)
  apiKey = process.env.TAWK_API_KEY;

  @IsDefined()
  @IsString()
  @MinLength(1)
  propertyId = process.env.TAWK_PROPERTY_ID;

  @IsDefined()
  @IsString()
  @MinLength(1)
  widgetId = process.env.TAWK_WIDGET_ID;
}

export const tawkSupportConfig = config.validate(new TawkSupportConfig(), 'Tawk support configuration');
