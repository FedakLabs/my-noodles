import { type PaginatedResult, PaginationHelper } from '@my-noodles/api-lib/pagination';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type FindOptionsWhere, ILike, type Repository } from 'typeorm';

import { Seller } from '../../sellers/seller.entity';
import type { CreateSellerDto, UpdateSellerDto } from './admin-sellers.dto';
import { SellerNotFoundException } from './admin-sellers.exceptions';

@Injectable()
export class AdminSellersService {
  constructor(
    @InjectRepository(Seller)
    private readonly sellersRepository: Repository<Seller>,
  ) {}

  async list(query: { page: number; limit: number; q?: string }): Promise<PaginatedResult<Seller>> {
    const term = query.q?.trim();
    let where: FindOptionsWhere<Seller> | FindOptionsWhere<Seller>[] = {};

    if (term) {
      const pattern = `%${term}%`;
      where = [{ slug: ILike(pattern) }, { name: ILike(pattern) }];
    }

    return await PaginationHelper.paginate(
      this.sellersRepository,
      { page: query.page, limit: query.limit },
      { where, order: { slug: 'ASC' } },
    );
  }

  async getById(id: string): Promise<Seller> {
    return await this.getSellerOrThrow(id);
  }

  async create(dto: CreateSellerDto): Promise<Seller> {
    const seller = this.sellersRepository.create({
      slug: dto.slug,
      name: dto.name,
      logoUrl: dto.logoUrl ?? null,
    });

    return await this.sellersRepository.save(seller);
  }

  async update(id: string, dto: UpdateSellerDto): Promise<Seller> {
    const seller = await this.getSellerOrThrow(id);

    if (dto.slug !== undefined) {
      seller.slug = dto.slug;
    }
    if (dto.name !== undefined) {
      seller.name = dto.name;
    }
    if (dto.logoUrl !== undefined) {
      seller.logoUrl = dto.logoUrl;
    }

    return await this.sellersRepository.save(seller);
  }

  private async getSellerOrThrow(id: string): Promise<Seller> {
    const seller = await this.sellersRepository.findOne({ where: { id } });
    if (!seller) {
      throw new SellerNotFoundException(id);
    }
    return seller;
  }
}
