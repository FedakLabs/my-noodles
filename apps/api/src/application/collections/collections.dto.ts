import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CollectionSummaryDto {
  @ApiProperty()
  code!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ type: String, nullable: true })
  name!: string | null;

  @ApiProperty({ type: String, nullable: true })
  description!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  heroImage!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  themeKey!: string | null;

  @ApiProperty()
  sortOrder!: number;
}

export class CollectionDetailDto extends CollectionSummaryDto {
  @ApiProperty({ type: [String] })
  productSlugs!: string[];
}
