import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FeedProductComment } from './feed-product-comment.entity';

@Injectable()
export class FeedCommentsService {
  constructor(
    @InjectRepository(FeedProductComment)
    private readonly commentsRepository: Repository<FeedProductComment>,
  ) {}

  async listForProduct(productId: string): Promise<FeedProductComment[]> {
    return await this.commentsRepository.find({
      where: { productId },
      order: { createdAt: 'ASC' },
    });
  }

  countForProduct(productId: string): Promise<number> {
    return this.commentsRepository.count({ where: { productId } });
  }
}
