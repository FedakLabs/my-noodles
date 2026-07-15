import { TimestampEntity, UuidV7PrimaryColumn } from '@my-noodles/api-lib/persistence';
import { Column, Entity, OneToMany } from 'typeorm';

import { Product } from '../products/product.entity';

@Entity({ name: 'brands' })
export class Brand extends TimestampEntity {
  @UuidV7PrimaryColumn()
  id!: string;

  @Column({ type: 'text', unique: true })
  slug!: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logoUrl!: string | null;

  @Column({ name: 'theme_key', type: 'text', nullable: true })
  themeKey!: string | null;

  @OneToMany(() => Product, (product) => product.brand)
  products!: Product[];
}
