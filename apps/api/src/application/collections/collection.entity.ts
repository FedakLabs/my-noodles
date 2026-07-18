import { type LocalizedString } from '@my-noodles/api-lib/locale';
import { ApiLocalizedColumn } from '@my-noodles/api-lib/nest';
import { TimestampEntity, UuidV7PrimaryColumn } from '@my-noodles/api-lib/persistence';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';

import { Product } from '../products/product.entity';

@Entity({ name: 'collections' })
export class Collection extends TimestampEntity {
  @UuidV7PrimaryColumn()
  id!: string;

  @Column({ type: 'text', unique: true })
  code!: string;

  @Column({ type: 'text', unique: true })
  slug!: string;

  @ApiLocalizedColumn()
  name!: LocalizedString;

  @ApiLocalizedColumn()
  description!: LocalizedString;

  @Column({ name: 'hero_image', type: 'text', nullable: true })
  heroImage!: string | null;

  @Column({ name: 'theme_key', type: 'text', nullable: true })
  themeKey!: string | null;

  @Column({ name: 'sort_order', type: 'int' })
  sortOrder!: number;

  @Column({ name: 'is_active', type: 'boolean' })
  isActive!: boolean;

  @ManyToMany(() => Product, (product) => product.collections)
  @JoinTable({
    name: 'collection_products',
    joinColumn: { name: 'collection_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'product_id', referencedColumnName: 'id' },
  })
  products!: Product[];
}
