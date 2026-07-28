import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';

import { Country } from '../../countries/country.entity';
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
  nameLocale!: LocalizedStringDto;

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
  nameLocale?: LocalizedStringDto;

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

export class AdminCountriesListResponseDto {
  @ApiProperty({ type: () => [Country] })
  items!: Country[];

  @ApiProperty({ type: () => AdminListMetaDto })
  meta!: AdminListMetaDto;
}
