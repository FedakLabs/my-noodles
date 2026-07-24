import { type LocalizedString } from '@my-noodles/api-lib/locale';
import { LocalizedColumn, LocalizedResolved } from '@my-noodles/api-lib/nest';
import { TimestampEntity, UuidV7PrimaryColumn } from '@my-noodles/api-lib/persistence';
import { CURRENCY_CODES, type CurrencyCode } from '@my-noodles/utils';
import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne } from 'typeorm';

import { Brand } from '../brands/brand.entity';
import { Category } from '../categories/category.entity';
import { Collection } from '../collections/collection.entity';
import { Country } from '../countries/country.entity';
import { Seller } from '../sellers/seller.entity';
import type { ProductFlavor } from './product.types';

@Entity({ name: 'products' })
export class Product extends TimestampEntity {
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

  @ApiHideProperty()
  @LocalizedColumn({ name: 'description' })
  descriptionLocale!: LocalizedString;

  @LocalizedResolved()
  get description(): string | null {
    return this.descriptionLocale.localized;
  }

  @ApiHideProperty()
  @LocalizedColumn({ name: 'story' })
  storyLocale!: LocalizedString;

  @LocalizedResolved()
  get story(): string | null {
    return this.storyLocale.localized;
  }

  @ApiHideProperty()
  @LocalizedColumn({ name: 'for_whom' })
  forWhomLocale!: LocalizedString;

  @LocalizedResolved()
  get forWhom(): string | null {
    return this.forWhomLocale.localized;
  }

  @Column({ type: 'text', nullable: true })
  weight!: string | null;

  @Column({ name: 'price_minor', type: 'int' })
  priceMinor!: number;

  @ApiProperty({ enum: CURRENCY_CODES, enumName: 'CurrencyCode' })
  @Column({ type: 'text' })
  currency!: CurrencyCode;

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

  @ApiProperty()
  @Column({ type: 'boolean' })
  available!: boolean;

  @Column({ name: 'sort_weight', type: 'int' })
  sortWeight!: number;

  @Column({ name: 'brand_id', type: 'uuid', nullable: true })
  brandId!: string | null;

  @ManyToOne(() => Brand, (brand) => brand.products, {
    eager: true,
    nullable: true,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'brand_id' })
  brand!: Brand | null;

  @Column({ name: 'seller_id', type: 'uuid' })
  sellerId!: string;

  @ManyToOne(() => Seller, (seller) => seller.products, {
    eager: true,
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'seller_id' })
  seller!: Seller;

  @Column({ name: 'country_id', type: 'uuid' })
  countryId!: string;

  @ManyToOne(() => Country, (country) => country.products, {
    eager: true,
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'country_id' })
  country!: Country;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId!: string;

  @ManyToOne(() => Category, (category) => category.products, {
    eager: true,
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

  @Expose()
  @ApiProperty()
  get inStock(): boolean {
    return this.quantity > 0;
  }

  @ApiPropertyOptional()
  liked?: boolean;

  @ApiPropertyOptional()
  commentCount?: number;
}
