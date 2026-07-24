import { ApiException } from '@my-noodles/api-lib/nest';
import { AuthGuard } from '@my-noodles/api-lib/nest/auth';
import { Controller, Get, Inject, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiOkResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';

import {
  AdminCartDetailDto,
  AdminCartListItemDto,
  AdminCartsListResponseDto,
  ListAdminCartsQueryDto,
} from './admin-carts.dto';
import { AdminCartNotFoundException } from './admin-carts.exceptions';
import { AdminCartsService } from './admin-carts.service';

@ApiTags('Admin Carts')
@ApiBearerAuth()
@ApiExtraModels(AdminCartListItemDto, AdminCartsListResponseDto, AdminCartDetailDto)
@UseGuards(AuthGuard)
@Controller('admin/carts')
export class AdminCartsController {
  constructor(@Inject(AdminCartsService) private readonly adminCartsService: AdminCartsService) {}

  @Get()
  @ApiOkResponse({
    schema: {
      allOf: [{ $ref: getSchemaPath(AdminCartsListResponseDto) }],
    },
  })
  async list(@Query() query: ListAdminCartsQueryDto): Promise<AdminCartsListResponseDto> {
    return await this.adminCartsService.list(query);
  }

  @Get(':visitorSessionId')
  @ApiOkResponse({ type: AdminCartDetailDto })
  @ApiException(AdminCartNotFoundException)
  async getByVisitorSessionId(
    @Param('visitorSessionId', ParseUUIDPipe) visitorSessionId: string,
  ): Promise<AdminCartDetailDto> {
    return await this.adminCartsService.getByVisitorSessionId(visitorSessionId);
  }
}
