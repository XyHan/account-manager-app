import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ScopesGuard } from './ScopesGuard';
import { SCOPES_KEY } from '../decorators/Scopes.decorator';

function makeContext(scope: string): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user: { scope } }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('ScopesGuard', () => {
  let guard: ScopesGuard;
  let reflector: jest.Mocked<Pick<Reflector, 'getAllAndOverride'>>;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    guard = new ScopesGuard(reflector as unknown as Reflector);
  });

  it('returns true when no scopes are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    expect(guard.canActivate(makeContext(''))).toBe(true);
  });

  it('returns true when user has the required scope', () => {
    reflector.getAllAndOverride.mockReturnValue(['app']);
    expect(guard.canActivate(makeContext('app'))).toBe(true);
  });

  it('returns true when user has multiple scopes including the required one', () => {
    reflector.getAllAndOverride.mockReturnValue(['app']);
    expect(guard.canActivate(makeContext('app read'))).toBe(true);
  });

  it('throws ForbiddenException when user is missing required scope', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);
    expect(() => guard.canActivate(makeContext('app'))).toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when user has no scope', () => {
    reflector.getAllAndOverride.mockReturnValue(['app']);
    const ctx = {
      switchToHttp: () => ({ getRequest: () => ({ user: {} }) }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('reads scopes from the correct metadata key', () => {
    reflector.getAllAndOverride.mockReturnValue([]);
    guard.canActivate(makeContext('app'));
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(SCOPES_KEY, expect.any(Array));
  });
});
