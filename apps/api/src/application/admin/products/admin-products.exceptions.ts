import { BadRequestException, NotFoundException, SAMPLE_UUID } from '@my-noodles/api-lib/exceptions';

export class AdminProductNotFoundException extends NotFoundException {
  static readonly sample = new AdminProductNotFoundException(SAMPLE_UUID);

  constructor(productId: string) {
    super({
      code: 'product_not_found',
      message: 'Product not found',
      payload: { productId },
    });
  }
}

export class ProductBrandNotFoundException extends BadRequestException {
  static readonly sample = new ProductBrandNotFoundException(SAMPLE_UUID);

  constructor(brandId: string) {
    super({
      code: 'product_brand_not_found',
      message: 'Brand not found',
      payload: { brandId },
    });
  }
}

export class ProductCategoryNotFoundException extends BadRequestException {
  static readonly sample = new ProductCategoryNotFoundException(SAMPLE_UUID);

  constructor(categoryId: string) {
    super({
      code: 'product_category_not_found',
      message: 'Category not found',
      payload: { categoryId },
    });
  }
}

export class ProductCountryNotFoundException extends BadRequestException {
  static readonly sample = new ProductCountryNotFoundException(SAMPLE_UUID);

  constructor(countryId: string) {
    super({
      code: 'product_country_not_found',
      message: 'Country not found',
      payload: { countryId },
    });
  }
}

export class ProductSellerNotFoundException extends BadRequestException {
  static readonly sample = new ProductSellerNotFoundException(SAMPLE_UUID);

  constructor(sellerId: string) {
    super({
      code: 'product_seller_not_found',
      message: 'Seller not found',
      payload: { sellerId },
    });
  }
}
