import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductsService } from 'src/products/products.service';
import { Repository } from 'typeorm';
import { initialData } from './data/seed-data';
import { User } from 'src/auth/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async runSeed() {
    // delete all data
    await this.deleteData();

    // insert new user
    const firstUser = await this.insertNewUser();

    // insert new products
    return {
      message: 'Data seeded successfully',
      tables: {
        users: firstUser ? true : false,
        products: await this.insertNewProducts(firstUser),
      },
    };
  }

  private async deleteData() {
    await this.productsService.deleteAllProducts();
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete().execute();
    return true;
  }

  private async insertNewUser() {
    try {
      const seedUser = initialData.users;
      const users: User[] = [];
      seedUser.forEach((user) => {
        const { password, ...userData } = user;
        users.push(
          this.userRepository.create({
            ...userData,
            password: bcrypt.hashSync(password, 10),
          }),
        );
      });
      const usersDB = await this.userRepository.save(users);
      return usersDB[1];
    } catch (error) {
      throw new Error('Error while inserting new user');
    }
  }

  private async insertNewProducts(user: User) {
    await this.productsService.deleteAllProducts();
    const products = initialData.products;
    const insertPromises: Promise<any>[] = [];

    products.forEach((product) => {
      insertPromises.push(this.productsService.create(product, user));
    });

    Promise.all(insertPromises);
    return true;
  }
}
