import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FeedProductComment } from './feed-product-comment.entity';
import type { FeedCommentDto } from './feed.dto';

@Injectable()
export class FeedCommentsService {
  constructor(
    @InjectRepository(FeedProductComment)
    private readonly commentsRepository: Repository<FeedProductComment>,
  ) {}

  async listForProduct(productId: string): Promise<FeedCommentDto[]> {
    const comments = await this.commentsRepository.find({
      where: { productId },
      order: { createdAt: 'ASC' },
    });

    return comments.map((comment) => ({
      id: comment.id,
      authorName: comment.authorName,
      comment: comment.comment.localized,
    }));
  }

  countForProduct(productId: string): Promise<number> {
    return this.commentsRepository.count({ where: { productId } });
  }
}
