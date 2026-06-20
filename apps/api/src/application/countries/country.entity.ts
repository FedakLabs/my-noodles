import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { LocalizedColumn, type LocalizedString } from '@/infrastructure/i18n';
import { TimestampEntity } from '@/infrastructure/persistence';

import { Product } from '../products/product.entity';

@Entity({ name: 'countries' })
export class Country extends TimestampEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', unique: true })
  code!: string;

  @Column({ type: 'text', unique: true })
  slug!: string;

  @LocalizedColumn()
  name!: LocalizedString;

  @Column({ name: 'flag_emoji', type: 'text', nullable: true })
  flagEmoji!: string | null;

  @Column({ name: 'theme_key', type: 'text', nullable: true })
  themeKey!: string | null;

  @OneToMany(() => Product, (product) => product.country)
  products!: Product[];
}
