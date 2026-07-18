import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { LocalizedStorefrontController } from '@/utils/localized-storefront.controller';

import { CountriesService } from './countries.service';
import { Country } from './country.entity';

@ApiTags('Countries')
@Controller('countries')
export class CountriesController extends LocalizedStorefrontController {
  constructor(@Inject(CountriesService) private readonly countriesService: CountriesService) {
    super();
  }

  @Get()
  list(): Promise<Country[]> {
    return this.countriesService.list();
  }
}
