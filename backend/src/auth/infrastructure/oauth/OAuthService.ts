import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { lastValueFrom } from 'rxjs';
import { OAuthAuthorizationCodeOrmEntity } from '../persistence/orm-entities/OAuthAuthorizationCodeOrmEntity';
import { OAuthClientOrmEntity } from '../persistence/orm-entities/OAuthClientOrmEntity';
import { OAuthTokenOrmEntity } from '../persistence/orm-entities/OAuthTokenOrmEntity';
import { UserOrmEntity } from '../persistence/orm-entities/UserOrmEntity';
import { HashedPassword } from '../../domain/value-objects/HashedPassword';
import { UserLoggedIn } from '../../domain/events/UserLoggedIn';
import { EventBus } from '../../../_shared/infrastructure/message-bus/bridge/bus/event.bus';
import type { RoleEnum } from '../../domain/value-objects/Role';

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

@Injectable()
export class OAuthService {
  private static readonly ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;
  private static readonly REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
  private static readonly AUTH_CODE_TTL_MS = 5 * 60 * 1000;

  constructor(
    @InjectRepository(OAuthClientOrmEntity)
    private readonly clientRepo: Repository<OAuthClientOrmEntity>,
    @InjectRepository(OAuthAuthorizationCodeOrmEntity)
    private readonly authCodeRepo: Repository<OAuthAuthorizationCodeOrmEntity>,
    @InjectRepository(OAuthTokenOrmEntity)
    private readonly tokenRepo: Repository<OAuthTokenOrmEntity>,
    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,
    private readonly eventBus: EventBus,
  ) {}

  async getClient(clientId: string): Promise<ClientData | null> {
    const client = await this.clientRepo.findOne({ where: { clientId } });
    if (!client) return null;
    return {
      clientId: client.clientId,
      redirectUris: client.redirectUris,
      grants: client.grants,
      scopes: client.scopes,
    };
  }

  async validateCredentials(email: string, password: string): Promise<UserOrmEntity | null> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) return null;
    const hashedPassword = HashedPassword.fromHash(user.passwordHash);
    const valid = await hashedPassword.verify(password);
    return valid ? user : null;
  }

  async generateAuthorizationCode(
    userId: string,
    clientId: string,
    redirectUri: string,
    scope: string,
    codeChallenge: string,
    codeChallengeMethod: string,
  ): Promise<string> {
    const code = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + OAuthService.AUTH_CODE_TTL_MS);

    await this.authCodeRepo.save(
      this.authCodeRepo.create({
        code,
        codeChallenge,
        codeChallengeMethod,
        redirectUri,
        scope,
        expiresAt,
        userId,
        clientId,
        used: false,
      }),
    );

    return code;
  }

  async exchangeCodeForToken(
    code: string,
    codeVerifier: string,
    clientId: string,
    redirectUri: string,
    ip: string,
  ): Promise<TokenResult> {
    const authCode = await this.authCodeRepo.findOne({ where: { code } });

    if (!authCode || authCode.used || authCode.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired authorization code');
    }
    if (authCode.clientId !== clientId) {
      throw new UnauthorizedException('Client ID mismatch');
    }
    if (authCode.redirectUri !== redirectUri) {
      throw new UnauthorizedException('Redirect URI mismatch');
    }
    if (!this.verifyPkce(codeVerifier, authCode.codeChallenge, authCode.codeChallengeMethod)) {
      throw new UnauthorizedException('PKCE verification failed');
    }

    await this.authCodeRepo.update(authCode.id, { used: true });

    const user = await this.userRepo.findOne({ where: { id: authCode.userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const accessToken = randomBytes(32).toString('hex');
    const refreshToken = randomBytes(32).toString('hex');
    const now = Date.now();
    const accessTokenExpiresAt = new Date(now + OAuthService.ACCESS_TOKEN_TTL_MS);
    const refreshTokenExpiresAt = new Date(now + OAuthService.REFRESH_TOKEN_TTL_MS);

    await this.tokenRepo.save(
      this.tokenRepo.create({
        accessToken,
        accessTokenExpiresAt,
        refreshToken,
        refreshTokenExpiresAt,
        scope: authCode.scope,
        userId: authCode.userId,
        userRole: user.role,
        clientId: authCode.clientId,
        revoked: false,
      }),
    );

    const event = new UserLoggedIn(authCode.userId, ip);
    await lastValueFrom(this.eventBus.execute(event));

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
      scope: authCode.scope,
      userId: authCode.userId,
    };
  }

  async refreshAccessToken(refreshToken: string, ip: string): Promise<TokenResult> {
    const token = await this.tokenRepo.findOne({ where: { refreshToken } });

    if (!token) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (token.revoked) {
      // Refresh token reuse detected — revoke all active tokens for this user (theft containment)
      await this.tokenRepo.update({ userId: token.userId, revoked: false }, { revoked: true });
      throw new UnauthorizedException('Refresh token reuse detected — all sessions have been revoked');
    }

    if (!token.refreshTokenExpiresAt || token.refreshTokenExpiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // Revoke old token before issuing new ones (rotation)
    await this.tokenRepo.update(token.id, { revoked: true });

    const user = await this.userRepo.findOne({ where: { id: token.userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const newAccessToken = randomBytes(32).toString('hex');
    const newRefreshToken = randomBytes(32).toString('hex');
    const now = Date.now();
    const accessTokenExpiresAt = new Date(now + OAuthService.ACCESS_TOKEN_TTL_MS);
    const refreshTokenExpiresAt = new Date(now + OAuthService.REFRESH_TOKEN_TTL_MS);

    await this.tokenRepo.save(
      this.tokenRepo.create({
        accessToken: newAccessToken,
        accessTokenExpiresAt,
        refreshToken: newRefreshToken,
        refreshTokenExpiresAt,
        scope: token.scope,
        userId: token.userId,
        userRole: token.userRole,
        clientId: token.clientId,
        revoked: false,
      }),
    );

    const event = new UserLoggedIn(token.userId, ip);
    await lastValueFrom(this.eventBus.execute(event));

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
      scope: token.scope,
      userId: token.userId,
    };
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.tokenRepo.update({ userId, revoked: false }, { revoked: true });
  }

  async revokeToken(accessToken: string): Promise<void> {
    const token = await this.tokenRepo.findOne({ where: { accessToken } });
    if (!token) throw new UnauthorizedException('Token not found');
    if (!token.revoked) {
      await this.tokenRepo.update(token.id, { revoked: true });
    }
  }

  async validateAccessToken(accessToken: string): Promise<TokenData | null> {
    const token = await this.tokenRepo.findOne({ where: { accessToken } });
    if (!token || token.revoked || token.accessTokenExpiresAt < new Date()) {
      return null;
    }
    return { userId: token.userId, scope: token.scope, userRole: token.userRole };
  }

  private verifyPkce(codeVerifier: string, codeChallenge: string, method: string): boolean {
    if (method !== 'S256') return false;
    const hash = createHash('sha256').update(codeVerifier).digest('base64url');
    const hashBuffer = Buffer.from(hash);
    const challengeBuffer = Buffer.from(codeChallenge);
    if (hashBuffer.length !== challengeBuffer.length) return false;
    return timingSafeEqual(hashBuffer, challengeBuffer);
  }
}
