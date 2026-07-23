import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';

import { AdminListMetaDto, AdminListQueryDto, LocalizedStringDto } from '../common';

export class ListAdminCountriesQueryDto extends AdminListQueryDto {}

export class CreateCountryDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(10)
  code!: string;

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
  @MaxLength(8)
  flagEmoji?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  themeKey?: string | null;
}

export class UpdateCountryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(10)
  code?: string;

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
  @MaxLength(8)
  flagEmoji?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  themeKey?: string | null;
}

/** Admin projection of {@link Country} — exposes full `{ uk, en? }` name locales, not the resolved string. */
export class AdminCountryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ type: () => LocalizedStringDto })
  name!: LocalizedStringDto;

  @ApiPropertyOptional({ type: String, nullable: true })
  flagEmoji!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  themeKey!: string | null;
}

export class AdminCountriesListResponseDto {
  @ApiProperty({ type: () => [AdminCountryDto] })
  items!: AdminCountryDto[];

  @ApiProperty({ type: () => AdminListMetaDto })
  meta!: AdminListMetaDto;
}
