import { LocalizedColumn, type LocalizedString } from '@my-noodles/api-lib/locale';
import { TimestampEntity, UuidV7PrimaryColumn } from '@my-noodles/api-lib/persistence';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne } from 'typeorm';

import { Brand } from '../brands/brand.entity';
import { Category } from '../categories/category.entity';
import { Collection } from '../collections/collection.entity';
import { Country } from '../countries/country.entity';
import type { ProductFlavor } from './product.types';

@Entity({ name: 'products' })
export class Product extends TimestampEntity {
  @UuidV7PrimaryColumn()
  id!: string;

  @Column({ type: 'text', unique: true })
  slug!: string;

  @LocalizedColumn()
  name!: LocalizedString;

  @LocalizedColumn()
  description!: LocalizedString;

  @LocalizedColumn()
  story!: LocalizedString;

  @LocalizedColumn({ name: 'for_whom' })
  forWhom!: LocalizedString;

  @Column({ type: 'text', nullable: true })
  weight!: string | null;

  @Column({ name: 'price_minor', type: 'int' })
  priceMinor!: number;

  @Column({ type: 'text' })
  currency!: string;

  @Column({ type: 'jsonb' })
  flavor!: ProductFlavor;

  @Column({ type: 'text', array: true })
  allergens!: string[];

  @Column({ type: 'text', array: true })
  images!: string[];

  @Column({ type: 'text', array: true })
  videos!: string[];

  @Column({ name: 'is_tried_by_us', type: 'boolean' })
  isTriedByUs!: boolean;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ name: 'sort_weight', type: 'int' })
  sortWeight!: number;

  @Column({ name: 'brand_id', type: 'uuid', nullable: true })
  brandId!: string | null;

  @ManyToOne(() => Brand, (brand) => brand.products, {
    nullable: true,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'brand_id' })
  brand!: Brand | null;

  @Column({ name: 'country_id', type: 'uuid' })
  countryId!: string;

  @ManyToOne(() => Country, (country) => country.products, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'country_id' })
  country!: Country;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId!: string;

  @ManyToOne(() => Category, (category) => category.products, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_id' })
  category!: Category;

  @ManyToMany(() => Product, (product) => product.alternativeOf)
  @JoinTable({
    name: 'product_alternatives',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'alternative_id', referencedColumnName: 'id' },
  })
  alternatives!: Product[];

  @ManyToMany(() => Product, (product) => product.alternatives)
  alternativeOf!: Product[];

  @ManyToMany(() => Collection, (collection) => collection.products)
  collections!: Collection[];
}
