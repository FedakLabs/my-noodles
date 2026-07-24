import { Controller, Inject, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { LocalizedStorefrontController } from '@/utils/localized-storefront.controller';

import { CurrentVisitorSession, type VisitorSession } from '../visitor-session';
import { SupportSessionResponseDto } from './support.dto';
import { SupportService } from './support.service';

@ApiTags('Support')
@Controller('support')
export class SupportController extends LocalizedStorefrontController {
  constructor(@Inject(SupportService) private readonly supportService: SupportService) {
    super();
  }

  @Post('sessions')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiOkResponse({ type: SupportSessionResponseDto })
  openSession(@CurrentVisitorSession() visitor: VisitorSession): SupportSessionResponseDto {
    return this.supportService.openSession(visitor);
  }
}
