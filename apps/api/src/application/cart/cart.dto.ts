import { TransformToInt } from '@my-noodles/api-lib/transformers';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class AddCartItemDto {
  @IsUUID()
  productId!: string;

  @IsOptional()
  @TransformToInt()
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ type: Number, minimum: 1, default: 1 })
  qty?: number;
}

export class SetCartItemQtyDto {
  @TransformToInt()
  @IsInt()
  @Min(1)
  qty!: number;
}

export class CartItemDto {
  @ApiProperty({ type: String, format: 'uuid' })
  productId!: string;

  slug!: string;

  title!: string;

  priceMinor!: number;

  currency!: string;

  imageUrl?: string;

  qty!: number;
}

export class CartResponseDto {
  items!: CartItemDto[];

  totalMinor!: number;

  itemCount!: number;

  currency!: string;
}
