import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CollectionSummaryDto {
  @ApiProperty({ type: String })
  code!: string;

  @ApiProperty({ type: String })
  slug!: string;

  @ApiProperty({ type: String, nullable: true })
  name!: string | null;

  @ApiProperty({ type: String, nullable: true })
  description!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  heroImage!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  themeKey!: string | null;

  @ApiProperty({ type: Number })
  sortOrder!: number;
}

export class CollectionDetailDto extends CollectionSummaryDto {
  @ApiProperty({ type: [String] })
  productSlugs!: string[];
}
