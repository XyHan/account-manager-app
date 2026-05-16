import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SCOPES_KEY } from '../decorators/Scopes.decorator';
import type { AuthenticatedRequest } from './OAuthGuard';

@Injectable()
export class ScopesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredScopes = this.reflector.getAllAndOverride<string[]>(SCOPES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredScopes || requiredScopes.length === 0) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userScopes = request.user?.scope?.split(' ') ?? [];

    const hasAllScopes = requiredScopes.every((scope) => userScopes.includes(scope));
    if (!hasAllScopes) {
      throw new ForbiddenException('Insufficient scope');
    }
    return true;
  }
}
