import { TransformToInt } from '@my-noodles/api-lib/transformers';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class AdminListQueryDto {
  @ApiProperty({ type: Number, minimum: 1, default: 1 })
  @TransformToInt()
  @IsInt()
  @Min(1)
  page!: number;

  @ApiProperty({ type: Number, minimum: 1, maximum: 100, default: 20 })
  @TransformToInt()
  @IsInt()
  @Min(1)
  @Max(100)
  limit!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;
}

export class AdminListMetaDto {
  @ApiProperty()
  total!: number;

  @ApiProperty()
  currentTotal!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;
}
