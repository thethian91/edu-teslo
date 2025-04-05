import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Product, ProductImage } from './entities/';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      // Ingresar un nuevo producto
      const { images = [], ...productDetails } = createProductDto;
      const product = this.productRepository.create({
        ...productDetails,
        // llena automaticamente la tabla de images
        images: images.map((image) => this.productImageRepository.create({ url: image })),
        user,
      });
      await this.productRepository.save(product);
      this.logger.log(`Product created: ${product.id} - ${product.title}`);
      return product;
    } catch (error) {
      this.handleException(error);
    }
  }

  async findAll(paginationDto?: PaginationDto) {
    try {
      const { limit = 10, offset = 0 } = paginationDto as PaginationDto;
      const products = await this.productRepository.find({
        skip: offset,
        take: limit,
        order: { title: 'ASC' },
        relations: { images: true },
      });

      return products.map((product) => ({
        ...product,
        images: product.images.map((img) => img.url),
      }));
    } catch (error) {
      this.handleException(error);
    }
  }

  async findOne(term: string) {
    let product: Product | null;
    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const qryBuilder = this.productRepository.createQueryBuilder('product');
      product = await qryBuilder
        .where('LOWER(product.title) LIKE :term', {
          term: `%${term.toLowerCase()}%`,
        })
        .orWhere('LOWER(product.slug) LIKE :term', {
          term: `%${term.toLowerCase()}%`,
        })
        .leftJoinAndSelect('product.images', 'images')
        .getOne();

      console.log(qryBuilder.getQuery());
    }

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    return product;
  }

  async findOnePlain(term: string) {
    const { images = [], ...product } = await this.findOne(term);
    return { ...product, images: images.map((img) => img.url) };
  }

  async findOneById(id: string) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new BadRequestException('Product not found');
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({ id, ...toUpdate });

    if (!product) throw new BadRequestException('Product not found');

    // create query runner
    const qryRunner = this.dataSource.createQueryRunner();
    await qryRunner.connect(); // connect to the database
    await qryRunner.startTransaction(); // start transaction

    try {
      // delete all images  of the product
      if (images) {
        await qryRunner.manager.delete(ProductImage, { product: { id } });
        product.images = images.map((image) => this.productImageRepository.create({ url: image }));
      }

      product.user = user;
      await qryRunner.manager.save(product);
      await qryRunner.commitTransaction();
      return product;
    } catch (error) {
      await qryRunner.rollbackTransaction();
      this.handleException(error);
    } finally {
      await qryRunner.release(); // release query runner
    }

    /*
    // forma vieja
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto,
      images: [],
      tags: updateProductDto.tags || [],
    });

    if (!product) {
      throw new BadRequestException('Product not found');
    }*/

    return await this.productRepository.save(product);
  }

  async remove(id: string) {
    try {
      await this.productRepository.delete(id);
    } catch (error) {
      this.handleException(error);
    }
  }

  async deleteById(id: string) {
    try {
      const product = await this.findOne(id);
      await this.productRepository.remove(product);
    } catch (error) {
      this.handleException(error);
    }
  }

  async deleteAllProducts() {
    const qry = this.productRepository.createQueryBuilder('product');
    try {
      return await qry.delete().where({}).execute();
    } catch (error) {
      this.handleException(error);
    }
  }

  private handleException(error: any) {
    const { code, detail } = error;
    this.logger.error(`${code} - ${detail}`);

    if (code === '23505') throw new BadRequestException(detail);

    throw new InternalServerErrorException('Unexpected error creating the product');
  }
}
