import { ApiProperty } from '@nestjs/swagger';

export class SupportSessionResponseDto {
  @ApiProperty({ type: String, format: 'uuid' })
  visitorSessionId!: string;

  @ApiProperty({ description: 'Secure session credential for the chat provider.' })
  sessionHash!: string;
}
