import { assertLocalesMatch } from '@my-noodles/api-lib/locale';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

/**
 * Full locale payload for admin create/update.
 * Every `SUPPORTED_LOCALES` key is required — no optional locales.
 */
export class LocalizedStringDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  uk!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  en!: string;
}

assertLocalesMatch<LocalizedStringDto>(true);
