import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/Roles.decorator';
import type { RoleEnum } from '../../domain/value-objects/Role';
import type { AuthenticatedRequest } from './OAuthGuard';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userRole = request.user?.userRole;

    if (!userRole || !requiredRoles.includes(userRole)) {
      throw new ForbiddenException('Insufficient role');
    }
    return true;
  }
}
