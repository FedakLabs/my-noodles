import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min, MinLength, ValidateNested } from 'class-validator';

import { AdminListMetaDto, AdminListQueryDto, LocalizedStringDto } from '../common';

export class ListAdminCategoriesQueryDto extends AdminListQueryDto {}

export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  slug!: string;

  @ApiProperty({ type: () => LocalizedStringDto })
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  name!: LocalizedStringDto;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  icon?: string | null;

  @ApiProperty()
  @IsInt()
  @Min(0)
  sortOrder!: number;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  themeKey?: string | null;
}

export class UpdateCategoryDto {
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

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  icon?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  themeKey?: string | null;
}

/** Admin projection of {@link Category} — exposes full `{ uk, en? }` name locales, not the resolved string. */
export class AdminCategoryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ type: () => LocalizedStringDto })
  name!: LocalizedStringDto;

  @ApiPropertyOptional({ type: String, nullable: true })
  icon!: string | null;

  @ApiProperty()
  sortOrder!: number;

  @ApiPropertyOptional({ type: String, nullable: true })
  themeKey!: string | null;
}

export class AdminCategoriesListResponseDto {
  @ApiProperty({ type: () => [AdminCategoryDto] })
  items!: AdminCategoryDto[];

  @ApiProperty({ type: () => AdminListMetaDto })
  meta!: AdminListMetaDto;
}
