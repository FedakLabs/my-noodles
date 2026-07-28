import { TransformToArray } from '@my-noodles/api-lib/transformers';
import { CURRENCY_CODES, type CurrencyCode } from '@my-noodles/utils';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { Product } from '../../products/product.entity';
import { AdminListMetaDto, AdminPaginationQueryDto, LocalizedStringDto } from '../common';

export class ListAdminProductsQueryDto extends AdminPaginationQueryDto {
  @ApiPropertyOptional({ description: 'Prefix match on product slug (case-insensitive).' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Prefix match on product name in the default locale (uk).' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ type: [String], format: 'uuid' })
  @TransformToArray()
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  categoryId?: string[];

  @ApiPropertyOptional({ type: [String], format: 'uuid' })
  @TransformToArray()
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  brandId?: string[];

  @ApiPropertyOptional({ type: [String], format: 'uuid' })
  @TransformToArray()
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  countryId?: string[];
}

export class AdminProductFlavorDto {
  @ApiProperty()
  @IsInt()
  @Min(0)
  @Max(5)
  spice!: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  @Max(5)
  sweet!: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  texture!: string;
}

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  slug!: string;

  @ApiProperty({ type: () => LocalizedStringDto })
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  nameLocale!: LocalizedStringDto;

  @ApiProperty({ type: () => LocalizedStringDto })
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  descriptionLocale!: LocalizedStringDto;

  @ApiProperty({ type: () => LocalizedStringDto })
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  storyLocale!: LocalizedStringDto;

  @ApiProperty({ type: () => LocalizedStringDto })
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  forWhomLocale!: LocalizedStringDto;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  weight?: string | null;

  @ApiProperty()
  @IsInt()
  @Min(0)
  priceMinor!: number;

  @ApiProperty({ enum: CURRENCY_CODES, enumName: 'CurrencyCode' })
  @IsIn(CURRENCY_CODES)
  currency!: CurrencyCode;

  @ApiProperty({ type: () => AdminProductFlavorDto })
  @ValidateNested()
  @Type(() => AdminProductFlavorDto)
  flavor!: AdminProductFlavorDto;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  allergens!: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  images!: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  videos!: string[];

  @ApiProperty()
  @IsBoolean()
  isTriedByUs!: boolean;

  @ApiProperty()
  @IsInt()
  @Min(0)
  quantity!: number;

  @ApiProperty({ default: true })
  @IsBoolean()
  available!: boolean;

  @ApiProperty()
  @IsInt()
  sortWeight!: number;

  @ApiPropertyOptional({ type: String, format: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  brandId?: string | null;

  @ApiProperty({ type: String, format: 'uuid' })
  @IsUUID()
  sellerId!: string;

  @ApiProperty({ type: String, format: 'uuid' })
  @IsUUID()
  countryId!: string;

  @ApiProperty({ type: String, format: 'uuid' })
  @IsUUID()
  categoryId!: string;
}

export class UpdateProductDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  slug?: string;

  @ApiPropertyOptional({ type: () => LocalizedStringDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  nameLocale?: LocalizedStringDto;

  @ApiPropertyOptional({ type: () => LocalizedStringDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  descriptionLocale?: LocalizedStringDto;

  @ApiPropertyOptional({ type: () => LocalizedStringDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  storyLocale?: LocalizedStringDto;

  @ApiPropertyOptional({ type: () => LocalizedStringDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  forWhomLocale?: LocalizedStringDto;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  weight?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  priceMinor?: number;

  @ApiPropertyOptional({ enum: CURRENCY_CODES, enumName: 'CurrencyCode' })
  @IsOptional()
  @IsIn(CURRENCY_CODES)
  currency?: CurrencyCode;

  @ApiPropertyOptional({ type: () => AdminProductFlavorDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdminProductFlavorDto)
  flavor?: AdminProductFlavorDto;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergens?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  videos?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isTriedByUs?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  available?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  sortWeight?: number;

  @ApiPropertyOptional({ type: String, format: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  brandId?: string | null;

  @ApiPropertyOptional({ type: String, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  sellerId?: string;

  @ApiPropertyOptional({ type: String, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  countryId?: string;

  @ApiPropertyOptional({ type: String, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}

export class AdminProductsListResponseDto {
  @ApiProperty({ type: () => [Product] })
  items!: Product[];

  @ApiProperty({ type: () => AdminListMetaDto })
  meta!: AdminListMetaDto;
}
