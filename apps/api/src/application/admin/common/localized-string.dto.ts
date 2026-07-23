import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

/** Full locale payload for admin create/update (`uk` required). */
export class LocalizedStringDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  uk!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  en?: string;
}
