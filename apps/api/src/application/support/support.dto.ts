import { ApiProperty } from '@nestjs/swagger';

export class SupportSessionResponseDto {
  @ApiProperty({ type: String, format: 'uuid' })
  visitorSessionId!: string;

  @ApiProperty({ description: 'Secure session credential for the chat provider.' })
  sessionHash!: string;

  @ApiProperty({ description: 'Tawk property ID for the embed script path.' })
  propertyId!: string;

  @ApiProperty({ description: 'Tawk widget ID for the embed script path.' })
  widgetId!: string;
}
