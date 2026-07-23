import { ApiException } from '@my-noodles/api-lib/nest';
import { AuthGuard } from '@my-noodles/api-lib/nest/auth';
import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiOkResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';

import {
  AdminCountriesListResponseDto,
  AdminCountryDto,
  CreateCountryDto,
  ListAdminCountriesQueryDto,
  UpdateCountryDto,
} from './admin-countries.dto';
import { CountryNotFoundException } from './admin-countries.exceptions';
import { AdminCountriesService } from './admin-countries.service';

@ApiTags('Admin Countries')
@ApiBearerAuth()
@ApiExtraModels(AdminCountryDto, AdminCountriesListResponseDto)
@UseGuards(AuthGuard)
@Controller('admin/countries')
export class AdminCountriesController {
  constructor(@Inject(AdminCountriesService) private readonly adminCountriesService: AdminCountriesService) {}

  @Get()
  @ApiOkResponse({
    schema: {
      allOf: [{ $ref: getSchemaPath(AdminCountriesListResponseDto) }],
    },
  })
  async list(@Query() query: ListAdminCountriesQueryDto): Promise<AdminCountriesListResponseDto> {
    return await this.adminCountriesService.list(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: AdminCountryDto })
  @ApiException(CountryNotFoundException)
  async getById(@Param('id', ParseUUIDPipe) id: string): Promise<AdminCountryDto> {
    return await this.adminCountriesService.getById(id);
  }

  @Post()
  async create(@Body() dto: CreateCountryDto): Promise<AdminCountryDto> {
    return await this.adminCountriesService.create(dto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: AdminCountryDto })
  @ApiException(CountryNotFoundException)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCountryDto,
  ): Promise<AdminCountryDto> {
    return await this.adminCountriesService.update(id, dto);
  }
}
