import type { LocalizedStringDto } from '@my-noodles/api-clients/admin';
import { assertLocalesMatch } from '@my-noodles/locale';

/** Compile-time check: admin API localized DTOs stay aligned with `SUPPORTED_LOCALES`. */
assertLocalesMatch<LocalizedStringDto>(true);
