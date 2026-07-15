import type { ValueTransformer } from 'typeorm';

import type { LocalizedStringData } from './locale.config';
import { LocalizedString } from './localized-string';

export const localizedStringTransformer: ValueTransformer = {
  to(value: LocalizedString | LocalizedStringData | null): LocalizedStringData | null {
    if (value === null) {
      return null;
    }

    if (value instanceof LocalizedString) {
      return value.toJSON();
    }

    return value;
  },

  from(value: LocalizedStringData | null): LocalizedString | null {
    if (value === null) {
      return null;
    }

    return LocalizedString.from(value);
  },
};
