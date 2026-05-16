import { SetMetadata } from '@nestjs/common';
import type { RoleEnum } from '../../domain/value-objects/Role';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleEnum[]): ReturnType<typeof SetMetadata> =>
  SetMetadata(ROLES_KEY, roles);
