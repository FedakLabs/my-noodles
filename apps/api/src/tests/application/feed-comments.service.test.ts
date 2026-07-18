import { LocaleContext, LocalizedString } from '@my-noodles/api-lib/locale';
import type { Repository } from 'typeorm';

import { FeedCommentsService, type FeedProductComment } from '@/application/feed';

import { jest } from '../jest-globals';

describe('FeedCommentsService', () => {
  let commentsFind: jest.Mock;
  let service: FeedCommentsService;

  beforeEach(() => {
    commentsFind = jest.fn().mockResolvedValue([
      {
        id: 'comment-1',
        authorName: 'Оля',
        comment: new LocalizedString({ uk: 'Смакота!', en: 'Delicious!' }),
      },
    ]);

    const repository = { find: commentsFind } as unknown as Repository<FeedProductComment>;
    service = new FeedCommentsService(repository);
  });

  it('resolves comment text to the active locale', async () => {
    const result = await LocaleContext.run('en', () => service.listForProduct('product-1'));

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: 'comment-1', authorName: 'Оля' });
    expect(LocalizedString.resolveFor(result[0]!.comment, 'en')).toBe('Delicious!');
  });

  it('uses the default locale text when active locale is Ukrainian', async () => {
    const result = await LocaleContext.run('uk', () => service.listForProduct('product-1'));

    expect(LocalizedString.resolveFor(result[0]!.comment, 'uk')).toBe('Смакота!');
  });
});
