import { ApiProperty } from '@nestjs/swagger';
import { registerDecorator, type ValidationArguments, type ValidationOptions } from 'class-validator';

import { isValidPhone } from './phone';

export function IsPhone(validationOptions?: ValidationOptions): PropertyDecorator {
  return (target, propertyKey) => {
    ApiProperty({ type: String, example: '+380501112233' })(target, propertyKey);
    registerDecorator({
      name: 'IsPhone',
      target: target.constructor,
      propertyName: propertyKey as string,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return isValidPhone(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid phone number`;
        },
      },
    });
  };
}
