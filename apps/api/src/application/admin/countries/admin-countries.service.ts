import { LocalizedString } from '@my-noodles/api-lib/locale';
import { type PaginatedResult, PaginationHelper } from '@my-noodles/api-lib/pagination';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type FindOptionsWhere, ILike, Raw, type Repository } from 'typeorm';

import { Country } from '../../countries/country.entity';
import type { AdminCountryDto, CreateCountryDto, UpdateCountryDto } from './admin-countries.dto';
import { CountryNotFoundException } from './admin-countries.exceptions';

@Injectable()
export class AdminCountriesService {
  constructor(
    @InjectRepository(Country)
    private readonly countriesRepository: Repository<Country>,
  ) {}

  async list(query: { page: number; limit: number; q?: string }): Promise<PaginatedResult<AdminCountryDto>> {
    const term = query.q?.trim();
    let where: FindOptionsWhere<Country> | FindOptionsWhere<Country>[] = {};

    if (term) {
      const pattern = `%${term}%`;
      where = [{ slug: ILike(pattern) }, { nameLocale: nameLocaleRaw(pattern) }];
    }

    const result = await PaginationHelper.paginate(
      this.countriesRepository,
      { page: query.page, limit: query.limit },
      { where, order: { slug: 'ASC' } },
    );

    return {
      items: result.items.map((country) => this.toAdminCountryDto(country)),
      meta: result.meta,
    };
  }

  async getById(id: string): Promise<AdminCountryDto> {
    return this.toAdminCountryDto(await this.getCountryOrThrow(id));
  }

  async create(dto: CreateCountryDto): Promise<AdminCountryDto> {
    const country = this.countriesRepository.create({
      code: dto.code,
      slug: dto.slug,
      nameLocale: new LocalizedString(dto.name),
      flagEmoji: dto.flagEmoji ?? null,
      themeKey: dto.themeKey ?? null,
    });

    const saved = await this.countriesRepository.save(country);
    return this.toAdminCountryDto(saved);
  }

  async update(id: string, dto: UpdateCountryDto): Promise<AdminCountryDto> {
    const country = await this.getCountryOrThrow(id);

    if (dto.code !== undefined) {
      country.code = dto.code;
    }
    if (dto.slug !== undefined) {
      country.slug = dto.slug;
    }
    if (dto.name !== undefined) {
      country.nameLocale = new LocalizedString(dto.name);
    }
    if (dto.flagEmoji !== undefined) {
      country.flagEmoji = dto.flagEmoji;
    }
    if (dto.themeKey !== undefined) {
      country.themeKey = dto.themeKey;
    }

    const saved = await this.countriesRepository.save(country);
    return this.toAdminCountryDto(saved);
  }

  private async getCountryOrThrow(id: string): Promise<Country> {
    const country = await this.countriesRepository.findOne({ where: { id } });
    if (!country) {
      throw new CountryNotFoundException(id);
    }
    return country;
  }

  private toAdminCountryDto(country: Country): AdminCountryDto {
    return {
      id: country.id,
      code: country.code,
      slug: country.slug,
      name: country.nameLocale.toJSON(),
      flagEmoji: country.flagEmoji,
      themeKey: country.themeKey,
    };
  }
}

/** Matches the `name` JSONB column (property `nameLocale`) against either supported locale. */
function nameLocaleRaw(pattern: string) {
  return Raw((alias) => `(${alias}->>'uk' ILIKE :pattern OR ${alias}->>'en' ILIKE :pattern)`, { pattern });
}
