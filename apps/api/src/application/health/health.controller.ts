import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { HealthStatusDto } from './health.dto';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(@Inject(HealthService) private readonly healthService: HealthService) {}

  /** Liveness (livez) — process responds; K8s restarts the pod if this fails. */
  @Get('live')
  @ApiOperation({ summary: 'Liveness probe' })
  @ApiOkResponse({ type: HealthStatusDto })
  getLive(): HealthStatusDto {
    return { status: 'ok' };
  }

  /** Readiness (readyz) — can accept traffic; checks dependencies (Postgres). Pod is removed from the Service if this fails. */
  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe' })
  @ApiOkResponse({ type: HealthStatusDto })
  async getReady(): Promise<HealthStatusDto> {
    await this.healthService.assertDependenciesReady();
    return { status: 'ok' };
  }

  /** Startup (startupz) — boot finished; same checks as readiness, but only used until the first success so slow starts are not killed by liveness. */
  @Get('startup')
  @ApiOperation({ summary: 'Startup probe' })
  @ApiOkResponse({ type: HealthStatusDto })
  async getStartup(): Promise<HealthStatusDto> {
    await this.healthService.assertDependenciesReady();
    return { status: 'ok' };
  }
}
