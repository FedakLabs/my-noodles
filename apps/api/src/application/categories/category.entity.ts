import { type LocalizedString } from '@my-noodles/api-lib/locale';
import { LocalizedColumn, LocalizedResolved } from '@my-noodles/api-lib/nest';
import { TimestampEntity, UuidV7PrimaryColumn } from '@my-noodles/api-lib/persistence';
import { ApiHideProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany } from 'typeorm';

import { Product } from '../products/product.entity';

@Entity({ name: 'categories' })
export class Category extends TimestampEntity {
  @UuidV7PrimaryColumn()
  id!: string;

  @Column({ type: 'text', unique: true })
  slug!: string;

  @ApiHideProperty()
  @LocalizedColumn({ name: 'name' })
  nameLocale!: LocalizedString;

  @LocalizedResolved()
  get name(): string | null {
    return this.nameLocale.localized;
  }

  @Column({ type: 'text', nullable: true })
  icon!: string | null;

  @Column({ name: 'sort_order', type: 'int' })
  sortOrder!: number;

  @Column({ name: 'theme_key', type: 'text', nullable: true })
  themeKey!: string | null;

  @OneToMany(() => Product, (product) => product.category)
  products!: Product[];
}
