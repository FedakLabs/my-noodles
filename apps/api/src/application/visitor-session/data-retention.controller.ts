import { Controller, HttpCode, Inject, Post } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { DataRetentionService, type DataRetentionSummary } from './data-retention.service';

@ApiExcludeController()
@Controller('internal/data-retention')
export class DataRetentionController {
  constructor(@Inject(DataRetentionService) private readonly dataRetentionService: DataRetentionService) {}

  @Post()
  @HttpCode(200)
  async run(): Promise<DataRetentionSummary> {
    return await this.dataRetentionService.run();
  }
}
