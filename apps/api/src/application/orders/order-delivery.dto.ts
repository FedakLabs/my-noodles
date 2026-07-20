import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum DeliveryProvider {
  NovaPoshta = 'nova-poshta',
  Ukrposhta = 'ukrposhta',
  Meest = 'meest',
}

export enum DeliveryMethod {
  Warehouse = 'warehouse',
  Courier = 'courier',
  Custom = 'custom',
}

export function IsDeliveryProvider(): PropertyDecorator {
  return (target, propertyKey) => {
    ApiProperty({ enum: DeliveryProvider, enumName: 'DeliveryProvider' })(target, propertyKey);
    IsEnum(DeliveryProvider)(target, propertyKey);
  };
}

export function IsDeliveryMethod(): PropertyDecorator {
  return (target, propertyKey) => {
    ApiProperty({ enum: DeliveryMethod, enumName: 'DeliveryMethod' })(target, propertyKey);
    IsEnum(DeliveryMethod)(target, propertyKey);
  };
}
