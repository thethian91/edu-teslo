import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto';
import { User } from './entities/user.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { create } from 'domain';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });
      const resp = await this.userRepository.save(user);
      delete (resp as Partial<User>).password;
      return {
        ...resp,
        token: this.getJwtToken({ id: resp.id, email: resp.email }),
      };
    } catch (err) {
      this.handleException(err);
    }
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const { ...userToUpdate } = updateUserDto;
    const userDB = await this.userRepository.preload({ id, ...userToUpdate });
    if (!userDB) throw new BadRequestException('User not found');
    try {
      return this.userRepository.save(userDB);
    } catch (error) {
      this.handleException(error);
    } finally {
    }
  }

  async findAll(paginationDto?: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto as PaginationDto;
    return await this.userRepository.find({
      skip: offset,
      take: limit,
    });
  }

  async loginUser(loginUserDto: LoginUserDto) {
    try {
      const { email, password } = loginUserDto;
      const userDB = await this.userRepository.findOne({
        where: { email },
        select: { id: true, email: true, password: true },
      });
      if (!userDB) throw new UnauthorizedException('credential no valid');
      if (!bcrypt.compareSync(password, userDB.password))
        throw new UnauthorizedException('password not valid');
      const token = this.getJwtToken({ id: userDB.id, email: userDB.email });
      return {
        ...userDB,
        token,
        createdAt: new Date(),
      };
    } catch (error) {
      this.handleException(error);
    }
  }

  async checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id, email: user.email }),
      createdAt: new Date(),
    };
  }

  async removeById(id: string) {}

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleException(error: any): never {
    const { code, detail } = error;

    this.logger.error(`${code} - ${detail}`);

    if (code === '23505') throw new BadRequestException(detail);

    throw new InternalServerErrorException('Unexpected error creating the product');
  }
}
