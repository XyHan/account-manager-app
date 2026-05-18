import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { OAuthGuard } from './OAuthGuard';
import type { IOAuthService } from '../../domain/services/IOAuthService';
import { RoleEnum } from '../../domain/value-objects/Role';

function makeContext(cookies: Record<string, string>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ cookies }),
    }),
  } as unknown as ExecutionContext;
}

describe('OAuthGuard', () => {
  let guard: OAuthGuard;
  let oauthService: jest.Mocked<Pick<IOAuthService, 'validateAccessToken'>>;

  beforeEach(() => {
    oauthService = { validateAccessToken: jest.fn() };
    guard = new OAuthGuard(oauthService as unknown as IOAuthService);
  });

  it('throws UnauthorizedException when cookie is absent', async () => {
    const ctx = makeContext({});
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when token is invalid', async () => {
    oauthService.validateAccessToken.mockResolvedValue(null);
    const ctx = makeContext({ 'X-Access-Token': 'bad-token' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('returns true and attaches user when token is valid', async () => {
    const tokenData = { userId: 'uid-123', scope: 'app', userRole: RoleEnum.USER };
    oauthService.validateAccessToken.mockResolvedValue(tokenData);
    const request: Record<string, unknown> = { cookies: { 'X-Access-Token': 'valid-token' } };
    const ctx = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(request['user']).toEqual(tokenData);
  });
});
