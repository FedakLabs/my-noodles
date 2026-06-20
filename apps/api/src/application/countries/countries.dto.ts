import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CountryDto {
  @ApiProperty()
  code!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ type: String, nullable: true })
  name!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  flagEmoji!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  themeKey!: string | null;
}
