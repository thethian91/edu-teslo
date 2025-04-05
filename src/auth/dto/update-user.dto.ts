import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ValidRoles } from '../interfaces';
import { IsArray, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsArray()
  @IsEnum(ValidRoles, { each: true }) // Valida cada item del array
  @Type(() => String)
  roles?: ValidRoles[];
}
