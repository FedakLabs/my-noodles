import { type PaginatedResult, PaginationHelper } from '@my-noodles/api-lib/pagination';
import { DEFAULT_LOCALE, pickLocalized } from '@my-noodles/locale';
import { DEFAULT_CURRENCY, resolveCurrency } from '@my-noodles/utils';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type Repository } from 'typeorm';

import { CartItem, CartService } from '@/application/cart';
import { VisitorSession } from '@/application/visitor-session';

import { type AdminCartDetailDto, type AdminCartItemDto, type AdminCartListItemDto } from './admin-carts.dto';
import { AdminCartNotFoundException } from './admin-carts.exceptions';

type CartSummaryRow = {
  visitorSessionId: string;
  totalMinor: string | number;
  itemCount: string | number;
  currency: string | null;
};

@Injectable()
export class AdminCartsService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemsRepository: Repository<CartItem>,
    @InjectRepository(VisitorSession)
    private readonly visitorsRepository: Repository<VisitorSession>,
    @Inject(CartService) private readonly cartService: CartService,
  ) {}

  async list(query: {
    page: number;
    limit: number;
    visitorSessionId?: string;
  }): Promise<PaginatedResult<AdminCartListItemDto>> {
    const search = query.visitorSessionId?.trim();

    const qb = this.cartItemsRepository
      .createQueryBuilder('cart_item')
      .innerJoin('cart_item.product', 'product')
      .select('cart_item.visitor_session_id', 'visitorSessionId')
      .addSelect('COALESCE(SUM(product.price_minor * cart_item.qty), 0)', 'totalMinor')
      .addSelect('COALESCE(SUM(cart_item.qty), 0)', 'itemCount')
      .addSelect('MAX(product.currency)', 'currency')
      .groupBy('cart_item.visitor_session_id')
      .orderBy('MAX(cart_item.updated_at)', 'DESC');

    if (search) {
      qb.andWhere('CAST(cart_item.visitor_session_id AS text) ILIKE :prefix', {
        prefix: `${search}%`,
      });
    }

    const countQb = this.cartItemsRepository
      .createQueryBuilder('cart_item')
      .select('COUNT(DISTINCT cart_item.visitor_session_id)', 'count');

    if (search) {
      countQb.andWhere('CAST(cart_item.visitor_session_id AS text) ILIKE :prefix', {
        prefix: `${search}%`,
      });
    }

    const countResult = await countQb.getRawOne<{ count: string }>();
    const total = Number(countResult?.count ?? 0);

    const rows = await qb
      .offset((query.page - 1) * query.limit)
      .limit(query.limit)
      .getRawMany<CartSummaryRow>();

    let items = rows.map((row) => this.toListItem(row));

    // Search may match an empty cart — still return the session when it exists.
    if (search && items.length === 0) {
      const sessions = await this.visitorsRepository
        .createQueryBuilder('visitor')
        .where('CAST(visitor.id AS text) ILIKE :prefix', { prefix: `${search}%` })
        .orderBy('visitor.created_at', 'DESC')
        .take(query.limit)
        .getMany();

      items = sessions.map((visitor) => ({
        visitorSessionId: visitor.id,
        totalMinor: 0,
        currency: DEFAULT_CURRENCY,
        itemCount: 0,
      }));

      return PaginationHelper.formatResult(items, items.length, {
        page: query.page,
        limit: query.limit,
      });
    }

    return PaginationHelper.formatResult(items, total, {
      page: query.page,
      limit: query.limit,
    });
  }

  async getByVisitorSessionId(visitorSessionId: string): Promise<AdminCartDetailDto> {
    const visitor = await this.visitorsRepository.findOne({ where: { id: visitorSessionId } });
    if (!visitor) {
      throw new AdminCartNotFoundException(visitorSessionId);
    }

    const cart = await this.cartService.get(visitorSessionId);

    return {
      visitorSessionId: visitor.id,
      cartExpiresAt: visitor.cartExpiresAt,
      items: cart.items.map((item) => this.toCartItemDto(item)),
      totalMinor: cart.totalMinor,
      itemCount: cart.itemCount,
      currency: cart.currency,
    };
  }

  private toListItem(row: CartSummaryRow): AdminCartListItemDto {
    return {
      visitorSessionId: row.visitorSessionId,
      totalMinor: Number(row.totalMinor),
      itemCount: Number(row.itemCount),
      currency: resolveCurrency(row.currency),
    };
  }

  private toCartItemDto(item: CartItem): AdminCartItemDto {
    return {
      productId: item.productId,
      slug: item.product.slug,
      name: pickLocalized(item.product.nameLocale.toJSON(), DEFAULT_LOCALE),
      qty: item.qty,
      unitPriceMinor: item.product.priceMinor,
      lineTotalMinor: item.product.priceMinor * item.qty,
      currency: item.product.currency,
    };
  }
}
