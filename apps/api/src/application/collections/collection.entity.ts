import { type LocalizedString } from '@my-noodles/api-lib/locale';
import { LocalizedColumn, LocalizedResolved } from '@my-noodles/api-lib/nest';
import { TimestampEntity, UuidV7PrimaryColumn } from '@my-noodles/api-lib/persistence';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';

import { Product } from '../products/product.entity';

@Entity({ name: 'collections' })
export class Collection extends TimestampEntity {
  @UuidV7PrimaryColumn()
  id!: string;

  @Column({ type: 'text', unique: true })
  slug!: string;

  @LocalizedColumn({ name: 'name' })
  nameLocale!: LocalizedString;

  @LocalizedResolved()
  get name(): string {
    return this.nameLocale.localized;
  }

  @LocalizedColumn({ name: 'description' })
  descriptionLocale!: LocalizedString;

  @LocalizedResolved()
  get description(): string {
    return this.descriptionLocale.localized;
  }

  @LocalizedColumn({ name: 'long_description' })
  longDescriptionLocale!: LocalizedString;

  @LocalizedResolved()
  get longDescription(): string {
    return this.longDescriptionLocale.localized;
  }

  @Column({ type: 'text' })
  emoji!: string;

  @Column({ type: 'text' })
  color!: string;

  @Column({ type: 'jsonb' })
  particles!: string[];

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
