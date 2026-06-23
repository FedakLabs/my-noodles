import { Column, Entity, OneToMany } from 'typeorm';

import { LocalizedColumn, type LocalizedString } from '@/infrastructure/i18n';
import { TimestampEntity, UuidV7PrimaryColumn } from '@/infrastructure/persistence';

import { Product } from '../products/product.entity';

@Entity({ name: 'categories' })
export class Category extends TimestampEntity {
  @UuidV7PrimaryColumn()
  id!: string;

  @Column({ type: 'text', unique: true })
  slug!: string;

  @LocalizedColumn()
  name!: LocalizedString;

  @Column({ type: 'text', nullable: true })
  icon!: string | null;

  @Column({ name: 'sort_order', type: 'int' })
  sortOrder!: number;

  @Column({ name: 'theme_key', type: 'text', nullable: true })
  themeKey!: string | null;

  @OneToMany(() => Product, (product) => product.category)
  products!: Product[];
}
