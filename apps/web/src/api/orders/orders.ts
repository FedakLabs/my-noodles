import type { CreateOrderDto, OrderResponseDto } from '@my-noodles/api-clients/storefront';

import { getApiClients } from '../clients';

export const ordersQueryKeys = {
  all: ['orders'] as const,
};

export async function createOrder(input: CreateOrderDto): Promise<OrderResponseDto> {
  const { data } = await getApiClients().ordersApi.ordersControllerCreate({
    createOrderDto: input,
  });

  return data;
}
