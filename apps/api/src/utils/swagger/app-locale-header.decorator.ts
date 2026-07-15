import { APP_LOCALE_HEADER, SUPPORTED_LOCALES } from '@my-noodles/api-lib/locale';
import { applyDecorators } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';

/** Documents the optional storefront locale header in Swagger. */
export function SwaggerAppLocaleHeader(): MethodDecorator & ClassDecorator {
  return applyDecorators(
    ApiHeader({
      name: APP_LOCALE_HEADER,
      required: false,
      enum: SUPPORTED_LOCALES,
      description: 'Preferred response locale',
    }),
  );
}
