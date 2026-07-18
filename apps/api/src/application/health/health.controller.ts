import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { HealthStatusDto } from './health.dto';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(@Inject(HealthService) private readonly healthService: HealthService) {}

  @Get('live')
  getLive(): HealthStatusDto {
    return { status: 'ok' };
  }

  @Get('ready')
  async getReady(): Promise<HealthStatusDto> {
    await this.healthService.assertDependenciesReady();
    return { status: 'ok' };
  }

  @Get('startup')
  async getStartup(): Promise<HealthStatusDto> {
    await this.healthService.assertDependenciesReady();
    return { status: 'ok' };
  }
}
