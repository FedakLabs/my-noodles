import { TransformToArray, TransformToInt } from '@my-noodles/api-lib/transformers';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';

import { IsOrderCancelledReason, OrderCancelledReason } from '@/application/orders/order-cancelled-reason';
import { OrderStatus } from '@/application/orders/order-status';
import { Order } from '@/application/orders/order.entity';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export class ListAdminOrdersQueryDto {
  @ApiProperty({ type: Number, minimum: 1, default: 1 })
  @TransformToInt()
  @IsInt()
  @Min(1)
  page!: number;

  @ApiProperty({ type: Number, minimum: 1, maximum: 100, default: 20 })
  @TransformToInt()
  @IsInt()
  @Min(1)
  @Max(100)
  limit!: number;

  @ApiPropertyOptional({ enum: OrderStatus, enumName: 'OrderStatus', isArray: true })
  @TransformToArray()
  @IsOptional()
  @IsArray()
  @IsEnum(OrderStatus, { each: true })
  status?: OrderStatus[];

  /** Matches order id prefix, full name prefix, or phone prefix. */
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;

  /** Inclusive UTC calendar day start (`YYYY-MM-DD`). */
  @ApiPropertyOptional({ type: String, format: 'date', example: '2026-01-01' })
  @IsOptional()
  @Matches(ISO_DATE, { message: 'createdFrom must be YYYY-MM-DD' })
  createdFrom?: string;

  /** Inclusive UTC calendar day end (`YYYY-MM-DD`). */
  @ApiPropertyOptional({ type: String, format: 'date', example: '2026-12-31' })
  @IsOptional()
  @Matches(ISO_DATE, { message: 'createdTo must be YYYY-MM-DD' })
  createdTo?: string;
}

export class CancelOrderDto {
  @IsOrderCancelledReason()
  cancelledReason!: OrderCancelledReason;
}

export class AdminOrderListMetaDto {
  @ApiProperty()
  total!: number;

  @ApiProperty()
  currentTotal!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;
}

export class AdminOrdersListResponseDto {
  @ApiProperty({ type: () => [Order] })
  items!: Order[];

  @ApiProperty({ type: () => AdminOrderListMetaDto })
  meta!: AdminOrderListMetaDto;
}
