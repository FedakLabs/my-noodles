import { Module } from '@nestjs/common';

import { MeestApi } from './meest.api';
import { MeestService } from './meest.service';

@Module({
  providers: [MeestApi, MeestService],
  exports: [MeestService],
})
export class MeestModule {}
