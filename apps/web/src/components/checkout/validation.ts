import {
  type CreateOrderDeliveryDto,
  DeliveryMethod,
  DeliveryProvider,
  type UpdateCheckoutDeliveryDto,
} from '@my-noodles/api-clients/storefront';
import { isValidPhone } from '@my-noodles/web-lib/validators';
import { z } from 'zod';

export function createReceiverSchema(invalidPhoneMessage: string) {
  return z.object({
    firstName: z.string().trim().min(1),
    lastName: z.string().trim().min(1),
    phone: z.string().trim().refine(isValidPhone, { message: invalidPhoneMessage }),
  });
}

export function createDeliverySchema() {
  return z.discriminatedUnion('method', [
    z.object({
      method: z.literal(DeliveryMethod.WAREHOUSE),
      provider: z.nativeEnum(DeliveryProvider),
      cityName: z.string().trim().min(1),
      cityRef: z.string().trim().min(1),
      warehouseRef: z.string().trim().min(1),
      warehouseName: z.string().trim().min(1),
      warehouseNumber: z.string().trim().min(1),
      street: z.string(),
      building: z.string(),
      apartment: z.string(),
      notes: z.string(),
    }),
    z.object({
      method: z.literal(DeliveryMethod.COURIER),
      provider: z.nativeEnum(DeliveryProvider),
      cityName: z.string().trim().min(1),
      cityRef: z.string().trim().min(1),
      street: z.string().trim().min(1),
      building: z.string().trim().min(1),
      apartment: z.string().trim(),
      notes: z.string().trim(),
      warehouseRef: z.string(),
      warehouseName: z.string(),
      warehouseNumber: z.string(),
    }),
  ]);
}

export function createCheckoutSchemas(invalidPhoneMessage: string) {
  const receiverSchema = createReceiverSchema(invalidPhoneMessage);
  const deliverySchema = createDeliverySchema();

  return {
    receiverSchema,
    deliverySchema,
    checkoutSchema: receiverSchema.and(deliverySchema),
  };
}

export function createCheckoutSchema(invalidPhoneMessage: string) {
  return createCheckoutSchemas(invalidPhoneMessage).checkoutSchema;
}

export type CheckoutFormData = z.infer<ReturnType<typeof createCheckoutSchema>>;

export type CheckoutReceiverData = z.infer<ReturnType<typeof createReceiverSchema>>;

export type CheckoutDeliveryData = z.infer<ReturnType<typeof createDeliverySchema>>;

export type CheckoutReceiverSchema = ReturnType<typeof createReceiverSchema>;

export type CheckoutDeliverySchema = ReturnType<typeof createDeliverySchema>;

export function isCheckoutReceiverComplete(
  values: CheckoutReceiverData,
  receiverSchema: CheckoutReceiverSchema,
): boolean {
  return receiverSchema.safeParse(values).success;
}

export type CheckoutReceiverField = keyof CheckoutReceiverData;

export function toValidReceiverFieldPatch(
  field: CheckoutReceiverField,
  values: CheckoutReceiverData,
  receiverSchema: CheckoutReceiverSchema,
): Partial<CheckoutReceiverData> | null {
  const result = receiverSchema.shape[field].safeParse(values[field]);

  if (!result.success) {
    return null;
  }

  return { [field]: result.data };
}

export function toSubmitDeliveryDto(delivery: CheckoutDeliveryData): CreateOrderDeliveryDto {
  return mapDeliveryToDto(delivery);
}

function mapDeliveryToDto(delivery: CheckoutDeliveryData): CreateOrderDeliveryDto {
  const notes = delivery.notes.trim() || undefined;

  if (delivery.method === DeliveryMethod.WAREHOUSE) {
    return {
      provider: delivery.provider,
      method: delivery.method,
      city: delivery.cityName,
      cityRef: delivery.cityRef,
      warehouseName: delivery.warehouseName,
      warehouseRef: delivery.warehouseRef,
      warehouseNumber: delivery.warehouseNumber,
      notes,
    };
  }

  return {
    provider: delivery.provider,
    method: delivery.method,
    city: delivery.cityName,
    cityRef: delivery.cityRef,
    street: delivery.street,
    building: delivery.building,
    apartment: delivery.apartment.trim() || undefined,
    notes,
  };
}

export function toValidDeliveryPatch(
  values: CheckoutFormData,
  deliverySchema: CheckoutDeliverySchema,
): UpdateCheckoutDeliveryDto | null {
  const result = deliverySchema.safeParse(values);

  if (!result.success) {
    return null;
  }

  return mapDeliveryToDto(result.data);
}

export function isCheckoutFormValid(
  values: CheckoutFormData,
  schema: ReturnType<typeof createCheckoutSchema>,
): boolean {
  return schema.safeParse(values).success;
}
