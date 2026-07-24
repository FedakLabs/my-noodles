import { TransformToInt } from '@my-noodles/api-lib/transformers';
import { CURRENCY_CODES, type CurrencyCode } from '@my-noodles/utils';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

import { AdminListMetaDto } from '../common';

export class ListAdminCartsQueryDto {
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

  /** Prefix match on visitor session id (case-insensitive). */
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  visitorSessionId?: string;
}

export class AdminCartListItemDto {
  @ApiProperty({ format: 'uuid' })
  visitorSessionId!: string;

  @ApiProperty()
  totalMinor!: number;

  @ApiProperty({ enum: CURRENCY_CODES, enumName: 'CurrencyCode' })
  currency!: CurrencyCode;

  @ApiProperty()
  itemCount!: number;
}

export class AdminCartsListResponseDto {
  @ApiProperty({ type: () => [AdminCartListItemDto] })
  items!: AdminCartListItemDto[];

  @ApiProperty({ type: () => AdminListMetaDto })
  meta!: AdminListMetaDto;
}

export class AdminCartItemDto {
  @ApiProperty({ format: 'uuid' })
  productId!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  qty!: number;

  @ApiProperty()
  unitPriceMinor!: number;

  @ApiProperty()
  lineTotalMinor!: number;

  @ApiProperty({ enum: CURRENCY_CODES, enumName: 'CurrencyCode' })
  currency!: CurrencyCode;
}

export class AdminCartDetailDto {
  @ApiProperty({ format: 'uuid' })
  visitorSessionId!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  cartExpiresAt!: Date;

  @ApiProperty({ type: () => [AdminCartItemDto] })
  items!: AdminCartItemDto[];

  @ApiProperty()
  totalMinor!: number;

  @ApiProperty()
  itemCount!: number;

  @ApiProperty({ enum: CURRENCY_CODES, enumName: 'CurrencyCode' })
  currency!: CurrencyCode;
}
