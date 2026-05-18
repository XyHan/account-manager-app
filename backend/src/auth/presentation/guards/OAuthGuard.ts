import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { OAUTH_SERVICE, type IOAuthService } from '../../domain/services/IOAuthService';
import type { RoleEnum } from '../../domain/value-objects/Role';

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    scope: string;
    userRole: RoleEnum;
  };
}

@Injectable()
export class OAuthGuard implements CanActivate {
  constructor(@Inject(OAUTH_SERVICE) private readonly oauthService: IOAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedRequest['user'] }>();
    const cookies = request.cookies as Record<string, string> | undefined;
    const accessToken = cookies?.['X-Access-Token'];

    if (!accessToken) {
      throw new UnauthorizedException('No access token');
    }

    const tokenData = await this.oauthService.validateAccessToken(accessToken);
    if (!tokenData) {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    request.user = tokenData;
    return true;
  }
}
