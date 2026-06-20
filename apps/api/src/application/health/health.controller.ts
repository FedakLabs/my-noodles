import { Controller, Get, Inject } from '@nestjs/common';

import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(@Inject(HealthService) private readonly healthService: HealthService) {}

  /** Liveness (livez) — process responds; K8s restarts the pod if this fails. */
  @Get('live')
  getLive(): { status: 'ok' } {
    return { status: 'ok' };
  }

  /** Readiness (readyz) — can accept traffic; checks dependencies (Postgres). Pod is removed from the Service if this fails. */
  @Get('ready')
  async getReady(): Promise<{ status: 'ok' }> {
    await this.healthService.assertDependenciesReady();
    return { status: 'ok' };
  }

  /** Startup (startupz) — boot finished; same checks as readiness, but only used until the first success so slow starts are not killed by liveness. */
  @Get('startup')
  async getStartup(): Promise<{ status: 'ok' }> {
    await this.healthService.assertDependenciesReady();
    return { status: 'ok' };
  }
}
