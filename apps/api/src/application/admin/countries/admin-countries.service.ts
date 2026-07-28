import { jsonbAnyLocaleIlike, LocalizedString } from '@my-noodles/api-lib/locale';
import { type PaginatedResult, PaginationHelper } from '@my-noodles/api-lib/pagination';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type FindOptionsWhere, ILike, type Repository } from 'typeorm';

import { Country } from '../../countries/country.entity';
import type { CreateCountryDto, UpdateCountryDto } from './admin-countries.dto';
import { CountryNotFoundException } from './admin-countries.exceptions';

@Injectable()
export class AdminCountriesService {
  constructor(
    @InjectRepository(Country)
    private readonly countriesRepository: Repository<Country>,
  ) {}

  async list(query: { page: number; limit: number; q?: string }): Promise<PaginatedResult<Country>> {
    const term = query.q?.trim();
    let where: FindOptionsWhere<Country> | FindOptionsWhere<Country>[] = {};

    if (term) {
      const pattern = `%${term}%`;
      where = [{ slug: ILike(pattern) }, { nameLocale: jsonbAnyLocaleIlike(pattern) }];
    }

    return await PaginationHelper.paginate(
      this.countriesRepository,
      { page: query.page, limit: query.limit },
      { where, order: { slug: 'ASC' } },
    );
  }

  async getById(id: string): Promise<Country> {
    return await this.getCountryOrThrow(id);
  }

  async create(dto: CreateCountryDto): Promise<Country> {
    const country = this.countriesRepository.create({
      code: dto.code,
      slug: dto.slug,
      nameLocale: new LocalizedString(dto.nameLocale),
      flagEmoji: dto.flagEmoji ?? null,
      themeKey: dto.themeKey ?? null,
    });

    return await this.countriesRepository.save(country);
  }

  async update(id: string, dto: UpdateCountryDto): Promise<Country> {
    const country = await this.getCountryOrThrow(id);

    if (dto.code !== undefined) {
      country.code = dto.code;
    }
    if (dto.slug !== undefined) {
      country.slug = dto.slug;
    }
    if (dto.nameLocale !== undefined) {
      country.nameLocale = new LocalizedString(dto.nameLocale);
    }
    if (dto.flagEmoji !== undefined) {
      country.flagEmoji = dto.flagEmoji;
    }
    if (dto.themeKey !== undefined) {
      country.themeKey = dto.themeKey;
    }

    return await this.countriesRepository.save(country);
  }

  private async getCountryOrThrow(id: string): Promise<Country> {
    const country = await this.countriesRepository.findOne({ where: { id } });
    if (!country) {
      throw new CountryNotFoundException(id);
    }
    return country;
  }
}
