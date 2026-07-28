import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min, MinLength, ValidateNested } from 'class-validator';

import { Category } from '../../categories/category.entity';
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
  nameLocale!: LocalizedStringDto;

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
  nameLocale?: LocalizedStringDto;

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

export class AdminCategoriesListResponseDto {
  @ApiProperty({ type: () => [Category] })
  items!: Category[];

  @ApiProperty({ type: () => AdminListMetaDto })
  meta!: AdminListMetaDto;
}
