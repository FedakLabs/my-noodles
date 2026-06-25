import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { LocalizedStorefrontController } from '@/utils/localized-storefront.controller';

import { CountryDto } from './countries.dto';
import { CountriesService } from './countries.service';

@ApiTags('Countries')
@Controller('countries')
export class CountriesController extends LocalizedStorefrontController {
  constructor(@Inject(CountriesService) private readonly countriesService: CountriesService) {
    super();
  }

  @Get()
  @ApiOperation({ summary: 'List countries' })
  list(): Promise<CountryDto[]> {
    return this.countriesService.list();
  }
}
