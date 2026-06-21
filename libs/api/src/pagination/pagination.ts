import type { FindManyOptions, ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';

/** Page counting starts at 1. Use stable sorting when paginating. */
export type PaginationQuery = {
  page: number;
  limit: number;
};

export type PaginationMeta = {
  total: number;
  currentTotal: number;
  page: number;
  limit: number;
};

export type PaginatedResult<T> = {
  items: T[];
  meta: PaginationMeta;
};

export function buildPaginationMeta(
  query: PaginationQuery,
  total: number,
  currentTotal: number,
): PaginationMeta {
  return {
    total,
    currentTotal,
    page: query.page,
    limit: query.limit,
  };
}

export function paginationSkip(query: PaginationQuery): number {
  return (query.page - 1) * query.limit;
}

function withPaginationOptions<T extends ObjectLiteral>(
  options: FindManyOptions<T> | undefined,
  pagination: PaginationQuery,
): FindManyOptions<T> {
  return {
    ...options,
    skip: paginationSkip(pagination),
    take: pagination.limit,
  };
}

/**
 * TypeORM pagination via query builder + `setFindOptions`.
 * Prefer this over hand-rolled `findAndCount` skip/take in services.
 */
export class PaginationHelper<T extends ObjectLiteral> {
  constructor(
    private readonly repo: Repository<T>,
    private pagination?: PaginationQuery,
  ) {}

  setPagination(pagination: PaginationQuery): this {
    this.pagination = pagination;
    return this;
  }

  async execute(
    options?: FindManyOptions<T>,
    {
      alias = 'paginated',
      pagination,
      addToQueryBuilder,
    }: {
      alias?: string;
      pagination?: PaginationQuery;
      addToQueryBuilder?: (qb: SelectQueryBuilder<T>) => void;
    } = {},
  ): Promise<PaginatedResult<T>> {
    const resolvedPagination = pagination ?? this.pagination;
    if (!resolvedPagination) {
      throw new Error('PaginationHelper requires pagination');
    }

    this.pagination = resolvedPagination;

    const queryBuilder = this.repo
      .createQueryBuilder(alias)
      .setFindOptions(withPaginationOptions(options, resolvedPagination));

    addToQueryBuilder?.(queryBuilder);

    const [items, total] = await queryBuilder.getManyAndCount();

    return PaginationHelper.formatResult(items, total, resolvedPagination);
  }

  static paginate<Entity extends ObjectLiteral>(
    repo: Repository<Entity>,
    pagination: PaginationQuery,
    options?: FindManyOptions<Entity>,
    executeOptions?: {
      alias?: string;
      addToQueryBuilder?: (qb: SelectQueryBuilder<Entity>) => void;
    },
  ): Promise<PaginatedResult<Entity>> {
    return new PaginationHelper(repo, pagination).execute(options, {
      ...executeOptions,
      pagination,
    });
  }

  static formatResult<Entity>(
    items: Entity[],
    total: number,
    pagination: PaginationQuery,
  ): PaginatedResult<Entity> {
    return {
      items,
      meta: buildPaginationMeta(pagination, total, items.length),
    };
  }
}
