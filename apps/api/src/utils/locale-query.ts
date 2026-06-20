import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

import { type Locale, SUPPORTED_LOCALES } from '@/infrastructure/i18n';

export { type Locale, SUPPORTED_LOCALES };

export class LocaleQueryDto {
  @ApiPropertyOptional({
    enum: SUPPORTED_LOCALES,
    description:
      'Response locale for localized fields. Falls back to Accept-Language, then the default locale.',
  })
  @IsOptional()
  @IsIn(SUPPORTED_LOCALES)
  locale?: Locale;
}
