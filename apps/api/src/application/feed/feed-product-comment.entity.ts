import { LocalizedColumn, type LocalizedString } from '@my-noodles/api-lib/locale';
import { TimestampEntity, UuidV7PrimaryColumn } from '@my-noodles/api-lib/persistence';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { Product } from '../products/product.entity';

/** Synthetic-but-honest "taste impression" attached to a product, shown in the feed comments panel. */
@Entity({ name: 'feed_product_comments' })
export class FeedProductComment extends TimestampEntity {
  @UuidV7PrimaryColumn()
  id!: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @ManyToOne(() => Product, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({ name: 'author_name', type: 'text' })
  authorName!: string;

  @LocalizedColumn()
  comment!: LocalizedString;
}
