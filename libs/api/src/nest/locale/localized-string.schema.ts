import { assertLocalesMatch } from '@my-noodles/locale';
import { ApiProperty } from '@nestjs/swagger';

/** OpenAPI shape for {@link LocalizedString} / JSONB locale columns — all locales required. */
export class LocalizedStringSchema {
  @ApiProperty()
  uk!: string;

  @ApiProperty()
  en!: string;
}

assertLocalesMatch<LocalizedStringSchema>(true);
