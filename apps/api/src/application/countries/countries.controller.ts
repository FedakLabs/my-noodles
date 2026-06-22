import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { LocaleQueryDto } from '@/utils/locale-query';

import { CountryDto } from './countries.dto';
import { CountriesService } from './countries.service';

@ApiTags('Countries')
@Controller('countries')
export class CountriesController {
  constructor(@Inject(CountriesService) private readonly countriesService: CountriesService) {}

  @Get()
  @ApiOperation({ summary: 'List countries' })
  list(@Query() _query: LocaleQueryDto): Promise<CountryDto[]> {
    return this.countriesService.list();
  }
}
