import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { ProductImage } from './product-image.entity';
import { User } from 'src/auth/entities/user.entity';

@Entity({
  name: 'products',
})
export class Product {
  @ApiProperty({
    example: '64e58f46-cbd8-4cde-a2a4-202b118b6893',
    description: 'The id of the product',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'T-shirt',
    description: 'The title of the product',
    uniqueItems: true,
  })
  @Column('text', { unique: true })
  title: string;

  @ApiProperty({
    example: 10.99,
    description: 'The price of the product',
    default: 0,
  })
  @Column('float', { default: 0 })
  price: number;

  @ApiProperty({
    example: 'This is a T-shirt',
    description: 'The description of the product',
  })
  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @ApiProperty({
    example: 't-shirt',
    description: 'The slug of the product',
    uniqueItems: true,
  })
  @Column('text', { unique: true })
  slug: string;

  @ApiProperty({
    example: 10,
    description: 'The stock of the product',
    default: 0,
  })
  @Column('int', { default: 0 })
  stock: number;

  @ApiProperty({
    example: ['S', 'M', 'L'],
    description: 'The sizes of the product',
  })
  @Column('text', { array: true })
  sizes: string[];

  @ApiProperty({
    example: ['men', 'woman', 'unisex'],
    description: 'The gender of the product',
  })
  @Column({ length: 10 })
  gender: string;

  @ApiProperty()
  @Column('text', { array: true, default: [] })
  tags: string[];

  @ApiProperty()
  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true,
    eager: true,
  })
  images: ProductImage[];

  @ManyToOne(
    () => User, // type
    (user) => user.product, // property
    { onDelete: 'RESTRICT', eager: true }, // options
  )
  user: User;

  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) this.slug = this.title;
    this.slug = this.generateSlug(this.slug);
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    if (this.title) this.slug = this.generateSlug(this.title);
  }

  private generateSlug(title: string): string {
    return title.trim().toLowerCase().replaceAll(' ', '_').replaceAll("'", '');
  }
}
