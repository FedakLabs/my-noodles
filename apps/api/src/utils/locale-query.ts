import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

import { type Locale, LOCALE_OPENAPI, SUPPORTED_LOCALES } from '@/infrastructure/i18n';

export { type Locale, LOCALE_OPENAPI, SUPPORTED_LOCALES };

export class LocaleQueryDto {
  @ApiPropertyOptional({
    ...LOCALE_OPENAPI,
    description:
      'Response locale for localized fields. Falls back to Accept-Language, then the default locale.',
  })
  @IsOptional()
  @IsIn(LOCALE_OPENAPI.enum)
  locale?: Locale;
}
