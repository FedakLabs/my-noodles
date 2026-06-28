import { Module } from '@nestjs/common';

import { UkrposhtaApi } from './ukrposhta.api';
import { UkrposhtaService } from './ukrposhta.service';

@Module({
  providers: [UkrposhtaApi, UkrposhtaService],
  exports: [UkrposhtaService],
})
export class UkrposhtaModule {}
