import type { RoleEnum } from '../value-objects/Role';

export interface ClientData {
  clientId: string;
  redirectUris: string[];
  grants: string[];
  scopes: string[];
}

export interface TokenData {
  userId: string;
  scope: string;
  userRole: RoleEnum;
}

export interface TokenResult {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
  scope: string;
  userId: string;
}
