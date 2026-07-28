import { ApiEnum } from '@my-noodles/api-lib/nest';
import { TransformToArray, TransformToInt } from '@my-noodles/api-lib/transformers';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';

import { OrderCancelledReason } from '@/application/orders/order-cancelled-reason';
import { OrderStatus } from '@/application/orders/order-status';

import { AdminOrder } from './admin-order.entity';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export enum AdminOrdersSortBy {
  CreatedAt = 'createdAt',
  Status = 'status',
  TotalMinor = 'totalMinor',
  Id = 'id',
  Phone = 'phone',
}

export enum AdminOrdersSortOrder {
  Asc = 'asc',
  Desc = 'desc',
}

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

  /** Matches order id prefix, first/last name prefix, or phone prefix. */
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;

  /** Inclusive UTC calendar day start (`YYYY-MM-DD`) on `createdAt`. */
  @ApiPropertyOptional({ type: String, format: 'date', example: '2026-01-01' })
  @IsOptional()
  @Matches(ISO_DATE, { message: 'createdFrom must be YYYY-MM-DD' })
  createdFrom?: string;

  /** Inclusive UTC calendar day end (`YYYY-MM-DD`) on `createdAt`. */
  @ApiPropertyOptional({ type: String, format: 'date', example: '2026-12-31' })
  @IsOptional()
  @Matches(ISO_DATE, { message: 'createdTo must be YYYY-MM-DD' })
  createdTo?: string;

  @ApiPropertyOptional({ enum: AdminOrdersSortBy, enumName: 'AdminOrdersSortBy' })
  @IsOptional()
  @IsEnum(AdminOrdersSortBy)
  sortBy?: AdminOrdersSortBy;

  @ApiPropertyOptional({ enum: AdminOrdersSortOrder, enumName: 'AdminOrdersSortOrder' })
  @IsOptional()
  @IsEnum(AdminOrdersSortOrder)
  sortOrder?: AdminOrdersSortOrder;
}

export class CancelOrderDto {
  @ApiEnum(OrderCancelledReason, 'OrderCancelledReason')
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
  @ApiProperty({ type: () => [AdminOrder] })
  items!: AdminOrder[];

  @ApiProperty({ type: () => AdminOrderListMetaDto })
  meta!: AdminOrderListMetaDto;
}
