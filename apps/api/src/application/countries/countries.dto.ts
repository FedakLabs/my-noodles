import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CountryDto {
  @ApiProperty({ type: String })
  code!: string;

  @ApiProperty({ type: String })
  slug!: string;

  @ApiProperty({ type: String, nullable: true })
  name!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  flagEmoji!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  themeKey!: string | null;
}
