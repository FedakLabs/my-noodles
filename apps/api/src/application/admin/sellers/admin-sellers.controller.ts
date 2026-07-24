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

import { Seller } from '../../sellers/seller.entity';
import {
  AdminSellersListResponseDto,
  CreateSellerDto,
  ListAdminSellersQueryDto,
  UpdateSellerDto,
} from './admin-sellers.dto';
import { SellerNotFoundException } from './admin-sellers.exceptions';
import { AdminSellersService } from './admin-sellers.service';

@ApiTags('Admin Sellers')
@ApiBearerAuth()
@ApiExtraModels(Seller, AdminSellersListResponseDto)
@UseGuards(AuthGuard)
@Controller('admin/sellers')
export class AdminSellersController {
  constructor(@Inject(AdminSellersService) private readonly adminSellersService: AdminSellersService) {}

  @Get()
  @ApiOkResponse({
    schema: {
      allOf: [{ $ref: getSchemaPath(AdminSellersListResponseDto) }],
    },
  })
  async list(@Query() query: ListAdminSellersQueryDto): Promise<AdminSellersListResponseDto> {
    return await this.adminSellersService.list(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: Seller })
  @ApiException(SellerNotFoundException)
  async getById(@Param('id', ParseUUIDPipe) id: string): Promise<Seller> {
    return await this.adminSellersService.getById(id);
  }

  @Post()
  async create(@Body() dto: CreateSellerDto): Promise<Seller> {
    return await this.adminSellersService.create(dto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: Seller })
  @ApiException(SellerNotFoundException)
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSellerDto): Promise<Seller> {
    return await this.adminSellersService.update(id, dto);
  }
}
