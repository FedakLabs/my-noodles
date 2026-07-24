import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { AdminListMetaDto, AdminListQueryDto, LocalizedStringDto } from '../common';

export class ListAdminCollectionsQueryDto extends AdminListQueryDto {}

export class CreateCollectionDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  slug!: string;

  @ApiProperty({ type: () => LocalizedStringDto })
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  name!: LocalizedStringDto;

  @ApiProperty({ type: () => LocalizedStringDto })
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  description!: LocalizedStringDto;

  @ApiProperty({ type: () => LocalizedStringDto })
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  longDescription!: LocalizedStringDto;

  @ApiProperty({ type: String })
  @IsString()
  emoji!: string;

  @ApiProperty({ type: String })
  @IsString()
  color!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  particles!: string[];

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  heroImage?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  themeKey?: string | null;

  @ApiProperty()
  @IsInt()
  @Min(0)
  sortOrder!: number;

  @ApiProperty()
  @IsBoolean()
  isActive!: boolean;
}

export class UpdateCollectionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  slug?: string;

  @ApiPropertyOptional({ type: () => LocalizedStringDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  name?: LocalizedStringDto;

  @ApiPropertyOptional({ type: () => LocalizedStringDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  description?: LocalizedStringDto;

  @ApiPropertyOptional({ type: () => LocalizedStringDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  longDescription?: LocalizedStringDto;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  emoji?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  particles?: string[];

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  heroImage?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  themeKey?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/** Admin projection of {@link Collection} — exposes full `{ uk, en? }` locales, not resolved strings. */
export class AdminCollectionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ type: () => LocalizedStringDto })
  name!: LocalizedStringDto;

  @ApiProperty({ type: () => LocalizedStringDto })
  description!: LocalizedStringDto;

  @ApiProperty({ type: () => LocalizedStringDto })
  longDescription!: LocalizedStringDto;

  @ApiProperty({ type: String })
  emoji!: string;

  @ApiProperty({ type: String })
  color!: string;

  @ApiProperty({ type: [String] })
  particles!: string[];

  @ApiPropertyOptional({ type: String, nullable: true })
  heroImage!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  themeKey!: string | null;

  @ApiProperty()
  sortOrder!: number;

  @ApiProperty()
  isActive!: boolean;
}

export class AdminCollectionsListResponseDto {
  @ApiProperty({ type: () => [AdminCollectionDto] })
  items!: AdminCollectionDto[];

  @ApiProperty({ type: () => AdminListMetaDto })
  meta!: AdminListMetaDto;
}
