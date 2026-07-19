import { TransformToInt } from '@my-noodles/api-lib/transformers';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

import { CartItem } from './cart-item.entity';

export class AddCartItemDto {
  /**
   * Product to add
   * @example 00000000-0000-4000-8000-000000000001
   */
  @IsUUID()
  productId!: string;

  /**
   * Quantity to add (defaults to 1)
   * @example 2
   */
  @IsOptional()
  @TransformToInt()
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ type: Number, minimum: 1, default: 1 })
  qty?: number;
}

export class SetCartItemQtyDto {
  /**
   * Absolute quantity to set for the cart line (0 removes the line)
   * @example 3
   */
  @TransformToInt()
  @IsInt()
  @Min(0)
  @ApiProperty({ type: Number, minimum: 0 })
  qty!: number;
}

export class CartResponseDto {
  @ApiProperty({ type: [CartItem] })
  items!: CartItem[];

  /**
   * Cart total in minor currency units
   * @example 19800
   */
  totalMinor!: number;

  /**
   * Sum of line quantities
   * @example 3
   */
  itemCount!: number;

  /**
   * ISO currency code for totals
   * @example UAH
   */
  currency!: string;
}
