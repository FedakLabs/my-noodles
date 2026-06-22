import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

import { type Locale, SUPPORTED_LOCALES } from '@/infrastructure/i18n';

function LocaleQueryParam(): PropertyDecorator {
  return (target, propertyKey) => {
    ApiPropertyOptional({ enum: SUPPORTED_LOCALES, enumName: 'Locale' })(target, propertyKey);
    IsOptional()(target, propertyKey);
    IsIn(SUPPORTED_LOCALES)(target, propertyKey);
  };
}

export class LocaleQueryDto {
  @LocaleQueryParam()
  locale?: Locale;
}
