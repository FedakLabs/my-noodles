import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

import { LocalizedColumn, type LocalizedString } from '@/infrastructure/i18n';
import { TimestampEntity } from '@/infrastructure/persistence';

import { Product } from '../products/product.entity';

@Entity({ name: 'collections' })
export class Collection extends TimestampEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', unique: true })
  code!: string;

  @Column({ type: 'text', unique: true })
  slug!: string;

  @LocalizedColumn()
  name!: LocalizedString;

  @LocalizedColumn()
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
