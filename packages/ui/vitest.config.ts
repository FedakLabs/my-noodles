import { createBaseVitestConfig } from '@my-noodles/vitest-config/base';

export default createBaseVitestConfig({
  test: {
    include: ['src/**/~*.test.ts'],
  },
});
