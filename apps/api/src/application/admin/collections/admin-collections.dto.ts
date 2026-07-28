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

import { Collection } from '../../collections/collection.entity';
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
  nameLocale!: LocalizedStringDto;

  @ApiProperty({ type: () => LocalizedStringDto })
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  descriptionLocale!: LocalizedStringDto;

  @ApiProperty({ type: () => LocalizedStringDto })
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  longDescriptionLocale!: LocalizedStringDto;

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
  longDescriptionLocale?: LocalizedStringDto;

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

export class AdminCollectionsListResponseDto {
  @ApiProperty({ type: () => [Collection] })
  items!: Collection[];

  @ApiProperty({ type: () => AdminListMetaDto })
  meta!: AdminListMetaDto;
}
