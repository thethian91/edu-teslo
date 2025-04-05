import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product title',
    example: 'Product Title',
    nullable: false,
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({
    description: 'Product price',
    example: 100,
    nullable: false,
    minimum: 0,
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @ApiProperty({
    description: 'Product description',
    example: 'Product Description',
    nullable: true,
    minLength: 10,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Product slug',
    example: 'product-slug',
    nullable: true,
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({
    description: 'Product stock',
    example: 10,
    nullable: true,
    minimum: 0,
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  stock?: number;

  @ApiProperty({
    description: 'Product sizes',
    example: `[ 'S', 'M' , 'L']`,
    nullable: false,
    type: 'array',
    items: { type: 'string' },
  })
  @IsString({ each: true })
  @IsArray()
  sizes: string[];

  @ApiProperty({
    description: 'Product gender',
  })
  @IsString()
  @IsIn(['men', 'women', 'kid', 'unisex'])
  gender: string;

  @ApiProperty({
    description: 'Product tags',
    example: `[ 'tag1', 'tag2' ]`,
  })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: 'Product images',
    example: `[ 'image1.jpg', 'image2.jpg' ]`,
  })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  images?: string[];
}
