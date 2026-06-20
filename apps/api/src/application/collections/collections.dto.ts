import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CollectionSummaryDto {
  @ApiProperty()
  code!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ nullable: true })
  name!: string | null;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiPropertyOptional({ nullable: true })
  heroImage!: string | null;

  @ApiPropertyOptional({ nullable: true })
  themeKey!: string | null;

  @ApiProperty()
  sortOrder!: number;
}

export class CollectionDetailDto extends CollectionSummaryDto {
  @ApiProperty({ type: [String] })
  productSlugs!: string[];
}
