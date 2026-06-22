import { ApiPropertyOptional } from '@nestjs/swagger';

export class CollectionSummaryDto {
  code!: string;

  slug!: string;

  name!: string | null;

  description!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  heroImage!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  themeKey!: string | null;

  sortOrder!: number;
}

export class CollectionDetailDto extends CollectionSummaryDto {
  productSlugs!: string[];
}
