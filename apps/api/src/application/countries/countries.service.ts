import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { CountryDto } from './countries.dto';
import { Country } from './country.entity';

@Injectable()
export class CountriesService {
  constructor(
    @InjectRepository(Country)
    private readonly countriesRepository: Repository<Country>,
  ) {}

  async list(): Promise<CountryDto[]> {
    const countries = await this.countriesRepository.find({ order: { slug: 'ASC' } });

    return countries.map((country) => ({
      code: country.code,
      slug: country.slug,
      name: country.name.localized,
      flagEmoji: country.flagEmoji,
      themeKey: country.themeKey,
    }));
  }
}
