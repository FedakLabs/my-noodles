import { Module } from '@nestjs/common';

import { NovaPoshtaApi } from './nova-poshta.api';
import { NovaPoshtaService } from './nova-poshta.service';

@Module({
  providers: [NovaPoshtaApi, NovaPoshtaService],
  exports: [NovaPoshtaService],
})
export class NovaPoshtaModule {}
