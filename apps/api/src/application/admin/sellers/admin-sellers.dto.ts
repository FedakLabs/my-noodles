import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

import { Seller } from '../../sellers/seller.entity';
import { AdminListMetaDto, AdminListQueryDto } from '../common';

export class ListAdminSellersQueryDto extends AdminListQueryDto {}

export class CreateSellerDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  slug!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsUrl({ require_tld: false })
  logoUrl?: string | null;
}

export class UpdateSellerDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsUrl({ require_tld: false })
  logoUrl?: string | null;
}

export class AdminSellersListResponseDto {
  @ApiProperty({ type: () => [Seller] })
  items!: Seller[];

  @ApiProperty({ type: () => AdminListMetaDto })
  meta!: AdminListMetaDto;
}
