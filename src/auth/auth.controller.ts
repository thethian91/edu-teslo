import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { GetUser, RawHeaders } from './decorators';
import { User } from './entities/user.entity';
import { UseRoleGuard } from './guards/use-role/use-role.guard';
import { METADATA_KEY, RoleProtected } from './decorators/role-protected.decorator';
import { Auth } from './decorators/auth.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.authService.findAll(paginationDto);
  }

  @Post('register')
  registerUser(@Body() createAuthDto: CreateUserDto) {
    return this.authService.createUser(createAuthDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }

  @Get('check-auth-status')
  @Auth()
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }

  @Patch('update/:id')
  updateUser(@Param('id') id: string, @Body() updateAuthDto: UpdateUserDto) {
    return this.authService.updateUser(id, updateAuthDto);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    //@GetUser() user: string,
    @GetUser('email') email: string,
    @RawHeaders() rawHeaders: string[],
  ) {
    return {
      ok: true,
      message: 'Hola Mundo!!!',
      //user,
      email,
      rawHeaders,
    };
  }

  /* test de roles */
  @Get('private2')
  @RoleProtected()
  @SetMetadata(METADATA_KEY, [['admin', 'super-user']]) // podemos definir metadata - roles
  @UseGuards(AuthGuard(), UseRoleGuard) // este contiene el usuario
  privateRoute2(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }

  // Servicio con un decorador personalizado que valida todo lo de arriba private2
  @Get('private3')
  @Auth()
  privateRoute3(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }
}
