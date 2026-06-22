import { ApiPropertyOptional } from '@nestjs/swagger';

export class CountryDto {
  code!: string;

  slug!: string;

  name!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  flagEmoji!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  themeKey!: string | null;
}
