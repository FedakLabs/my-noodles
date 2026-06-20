import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CountryDto {
  @ApiProperty()
  code!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ nullable: true })
  name!: string | null;

  @ApiPropertyOptional({ nullable: true })
  flagEmoji!: string | null;

  @ApiPropertyOptional({ nullable: true })
  themeKey!: string | null;
}
