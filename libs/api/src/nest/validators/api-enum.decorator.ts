import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

/** OpenAPI enum schema + class-validator `IsEnum` for DTO / query fields. */
export function ApiEnum(enumObject: object, enumName: string): PropertyDecorator {
  return (target, propertyKey) => {
    ApiProperty({ enum: enumObject, enumName })(target, propertyKey);
    IsEnum(enumObject)(target, propertyKey);
  };
}
