import { Expose, instanceToPlain, Transform, Type } from 'class-transformer';
import 'reflect-metadata';

import { LocalizedString } from './localized-string';

describe('LocalizedString serialization', () => {
  it('keeps nameLocale when sibling getter uses @Expose', () => {
    class Sample {
      @Type(() => LocalizedString)
      nameLocale = new LocalizedString({ uk: 'Локшина', en: 'Noodles' });

      @Expose()
      get name(): string {
        return this.nameLocale.localized;
      }
    }

    expect(instanceToPlain(new Sample())).toEqual({
      nameLocale: { uk: 'Локшина', en: 'Noodles' },
      name: 'Локшина',
    });
  });

  it('serializes via toJSON Transform + Expose', () => {
    class Sample {
      @Expose()
      @Transform(({ value }) => (value instanceof LocalizedString ? value.toJSON() : value), {
        toPlainOnly: true,
      })
      @Type(() => LocalizedString)
      nameLocale = new LocalizedString({ uk: 'Локшина', en: 'Noodles' });

      @Expose()
      get name(): string {
        return this.nameLocale.localized;
      }
    }

    expect(instanceToPlain(new Sample())).toEqual({
      nameLocale: { uk: 'Локшина', en: 'Noodles' },
      name: 'Локшина',
    });
  });
});
