import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './RolesGuard';
import { ROLES_KEY } from '../decorators/Roles.decorator';
import { RoleEnum } from '../../domain/value-objects/Role';

function makeContext(userRole: RoleEnum): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user: { userRole } }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Pick<Reflector, 'getAllAndOverride'>>;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it('returns true when no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    expect(guard.canActivate(makeContext(RoleEnum.USER))).toBe(true);
  });

  it('returns true when user has the required role', () => {
    reflector.getAllAndOverride.mockReturnValue([RoleEnum.USER]);
    expect(guard.canActivate(makeContext(RoleEnum.USER))).toBe(true);
  });

  it('returns true when admin accesses a USER-required route', () => {
    reflector.getAllAndOverride.mockReturnValue([RoleEnum.USER, RoleEnum.ADMIN]);
    expect(guard.canActivate(makeContext(RoleEnum.ADMIN))).toBe(true);
  });

  it('throws ForbiddenException when user does not have required role', () => {
    reflector.getAllAndOverride.mockReturnValue([RoleEnum.ADMIN]);
    expect(() => guard.canActivate(makeContext(RoleEnum.USER))).toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when user is not attached to request', () => {
    reflector.getAllAndOverride.mockReturnValue([RoleEnum.USER]);
    const ctx = {
      switchToHttp: () => ({ getRequest: () => ({}) }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('reads roles from the correct metadata key', () => {
    reflector.getAllAndOverride.mockReturnValue([]);
    guard.canActivate(makeContext(RoleEnum.USER));
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, expect.any(Array));
  });
});
