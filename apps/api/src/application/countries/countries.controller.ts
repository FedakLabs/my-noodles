import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import type { CountryDto } from './countries.dto';
import { CountriesService } from './countries.service';

@ApiTags('Countries')
@Controller('countries')
export class CountriesController {
  constructor(@Inject(CountriesService) private readonly countriesService: CountriesService) {}

  @Get()
  @ApiOperation({ summary: 'List countries' })
  list(): Promise<CountryDto[]> {
    return this.countriesService.list();
  }
}
