import type { RoleEnum } from '../value-objects/Role';
import type { ClientData, TokenData, TokenResult } from '../models/OAuthModels';

export const OAUTH_SERVICE = Symbol('OAUTH_SERVICE');

export interface IOAuthService {
  getClient(clientId: string): Promise<ClientData | null>;
  validateCredentials(email: string, password: string): Promise<{ id: string; role: RoleEnum } | null>;
  generateAuthorizationCode(
    userId: string,
    clientId: string,
    redirectUri: string,
    scope: string,
    codeChallenge: string,
    codeChallengeMethod: string,
  ): Promise<string>;
  exchangeCodeForToken(
    code: string,
    codeVerifier: string,
    clientId: string,
    redirectUri: string,
    ip: string,
  ): Promise<TokenResult>;
  refreshAccessToken(refreshToken: string, ip: string): Promise<TokenResult>;
  revokeAllUserTokens(userId: string): Promise<void>;
  revokeToken(accessToken: string): Promise<void>;
  validateAccessToken(accessToken: string): Promise<TokenData | null>;
}
