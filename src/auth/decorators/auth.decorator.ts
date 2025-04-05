import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ValidRoles } from '../interfaces';
import { RoleProtected } from './role-protected.decorator';
import { UseRoleGuard } from '../guards/use-role/use-role.guard';

export function Auth(...roles: ValidRoles[]) {
  return applyDecorators(RoleProtected(ValidRoles.user), UseGuards(AuthGuard(), UseRoleGuard));
}
