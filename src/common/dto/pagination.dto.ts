import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    description: 'Number of items per page',
    default: 10,
    required: false,
    type: Number,
    minimum: 1,
  })
  @IsOptional()
  @IsPositive()
  @Type(() => Number) // enabledImplicitConversion: true | no se tendria que configurar en global
  limit?: number;

  @ApiProperty({
    description: 'Number of items to skip',
    default: 0,
    required: false,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @IsPositive()
  @Min(0)
  offset?: number;

  @ApiProperty({
    description: 'Sort order',
    default: 'asc',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsPositive()
  sort?: string;
}
