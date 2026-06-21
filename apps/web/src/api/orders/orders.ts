import {
  type CreateOrderDto,
  type OrderResponseDto,
  ordersControllerCreate,
} from '@my-noodles/api-clients/storefront';
import { requestData } from '@my-noodles/web-lib/react-query';

export const ordersQueryKeys = {
  all: ['orders'] as const,
};

export async function createOrder(input: CreateOrderDto): Promise<OrderResponseDto> {
  return requestData(ordersControllerCreate({ body: input }));
}
