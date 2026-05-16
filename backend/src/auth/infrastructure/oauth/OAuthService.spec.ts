import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { createHash } from 'crypto';
import { of } from 'rxjs';
import * as bcrypt from 'bcryptjs';
import { OAuthService } from './OAuthService';
import { OAuthClientOrmEntity } from '../persistence/orm-entities/OAuthClientOrmEntity';
import { OAuthAuthorizationCodeOrmEntity } from '../persistence/orm-entities/OAuthAuthorizationCodeOrmEntity';
import { OAuthTokenOrmEntity } from '../persistence/orm-entities/OAuthTokenOrmEntity';
import { UserOrmEntity } from '../persistence/orm-entities/UserOrmEntity';
import { EventBus } from '../../../_shared/infrastructure/message-bus/bridge/bus/event.bus';
import { RoleEnum } from '../../domain/value-objects/Role';

const makeRepo = <T>(overrides: Partial<Record<string, jest.Mock>> = {}): jest.Mocked<{
  findOne: jest.Mock;
  save: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
}> => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn((data) => data),
  update: jest.fn(),
  ...overrides,
});

const makeEventBus = (): { execute: jest.Mock } => ({
  execute: jest.fn().mockReturnValue({ toPromise: () => Promise.resolve(), subscribe: (fn: (v: unknown) => void) => fn(undefined) }),
});

describe('OAuthService', () => {
  let service: OAuthService;
  let clientRepo: ReturnType<typeof makeRepo>;
  let authCodeRepo: ReturnType<typeof makeRepo>;
  let tokenRepo: ReturnType<typeof makeRepo>;
  let userRepo: ReturnType<typeof makeRepo>;
  let eventBus: ReturnType<typeof makeEventBus>;

  beforeEach(async () => {
    clientRepo = makeRepo();
    authCodeRepo = makeRepo();
    tokenRepo = makeRepo();
    userRepo = makeRepo();
    eventBus = makeEventBus();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthService,
        { provide: getRepositoryToken(OAuthClientOrmEntity), useValue: clientRepo },
        { provide: getRepositoryToken(OAuthAuthorizationCodeOrmEntity), useValue: authCodeRepo },
        { provide: getRepositoryToken(OAuthTokenOrmEntity), useValue: tokenRepo },
        { provide: getRepositoryToken(UserOrmEntity), useValue: userRepo },
        { provide: EventBus, useValue: eventBus },
      ],
    }).compile();

    service = module.get(OAuthService);
  });

  describe('getClient', () => {
    it('returns null when client does not exist', async () => {
      clientRepo.findOne.mockResolvedValue(null);
      expect(await service.getClient('unknown')).toBeNull();
    });

    it('returns client data when found', async () => {
      clientRepo.findOne.mockResolvedValue({
        clientId: 'app',
        clientSecret: null,
        grants: ['authorization_code'],
        redirectUris: ['http://localhost:4200/auth/callback'],
        scopes: ['app'],
      });
      const result = await service.getClient('app');
      expect(result?.clientId).toBe('app');
      expect(result?.scopes).toContain('app');
    });
  });

  describe('validateCredentials', () => {
    it('returns null when user does not exist', async () => {
      userRepo.findOne.mockResolvedValue(null);
      expect(await service.validateCredentials('x@x.com', 'pass')).toBeNull();
    });

    it('returns null when password is wrong', async () => {
      const hash = await bcrypt.hash('correct-pass', 1);
      userRepo.findOne.mockResolvedValue({ id: 'uid', email: 'x@x.com', passwordHash: hash });
      expect(await service.validateCredentials('x@x.com', 'wrong-pass')).toBeNull();
    });

    it('returns user when credentials are valid', async () => {
      const hash = await bcrypt.hash('correct-pass', 1);
      const user = { id: 'uid', email: 'x@x.com', passwordHash: hash, role: RoleEnum.USER };
      userRepo.findOne.mockResolvedValue(user);
      expect(await service.validateCredentials('x@x.com', 'correct-pass')).toEqual(user);
    });
  });

  describe('verifyPkce (via exchangeCodeForToken)', () => {
    const buildValidCode = (codeVerifier: string) => ({
      id: 'cid',
      code: 'abc',
      codeChallenge: createHash('sha256').update(codeVerifier).digest('base64url'),
      codeChallengeMethod: 'S256',
      redirectUri: 'http://localhost:4200/auth/callback',
      scope: 'app',
      expiresAt: new Date(Date.now() + 60_000),
      userId: 'uid',
      clientId: 'app',
      used: false,
    });

    it('throws when PKCE verification fails', async () => {
      const verifier = 'correct-verifier-value-must-be-long-enough-xxxxx';
      authCodeRepo.findOne.mockResolvedValue(buildValidCode(verifier));
      await expect(
        service.exchangeCodeForToken('abc', 'wrong-verifier', 'app', 'http://localhost:4200/auth/callback', '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws when auth code is already used', async () => {
      authCodeRepo.findOne.mockResolvedValue({ ...buildValidCode('v'), used: true });
      await expect(
        service.exchangeCodeForToken('abc', 'v', 'app', 'http://localhost:4200/auth/callback', '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws when auth code is expired', async () => {
      const verifier = 'verifier-value-long-enough-xxxxxxxxxxxxxxxxx';
      authCodeRepo.findOne.mockResolvedValue({
        ...buildValidCode(verifier),
        expiresAt: new Date(Date.now() - 1000),
      });
      await expect(
        service.exchangeCodeForToken('abc', verifier, 'app', 'http://localhost:4200/auth/callback', '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns token result on valid exchange', async () => {
      const verifier = 'verifier-value-long-enough-xxxxxxxxxxxxxxxxx';
      authCodeRepo.findOne.mockResolvedValue(buildValidCode(verifier));
      authCodeRepo.update.mockResolvedValue(undefined);
      userRepo.findOne.mockResolvedValue({ id: 'uid', role: RoleEnum.USER });
      tokenRepo.save.mockImplementation((t) => Promise.resolve(t));
      eventBus.execute.mockReturnValue(of(undefined));

      const result = await service.exchangeCodeForToken(
        'abc', verifier, 'app', 'http://localhost:4200/auth/callback', '127.0.0.1',
      );

      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
      expect(result.scope).toBe('app');
    });
  });

  describe('validateAccessToken', () => {
    it('returns null when token not found', async () => {
      tokenRepo.findOne.mockResolvedValue(null);
      expect(await service.validateAccessToken('invalid')).toBeNull();
    });

    it('returns null when token is revoked', async () => {
      tokenRepo.findOne.mockResolvedValue({
        revoked: true,
        accessTokenExpiresAt: new Date(Date.now() + 60_000),
        userId: 'uid',
        scope: 'app',
        userRole: RoleEnum.USER,
      });
      expect(await service.validateAccessToken('token')).toBeNull();
    });

    it('returns null when token is expired', async () => {
      tokenRepo.findOne.mockResolvedValue({
        revoked: false,
        accessTokenExpiresAt: new Date(Date.now() - 1000),
        userId: 'uid',
        scope: 'app',
        userRole: RoleEnum.USER,
      });
      expect(await service.validateAccessToken('token')).toBeNull();
    });

    it('returns token data for valid token', async () => {
      tokenRepo.findOne.mockResolvedValue({
        revoked: false,
        accessTokenExpiresAt: new Date(Date.now() + 60_000),
        userId: 'uid',
        scope: 'app',
        userRole: RoleEnum.USER,
      });
      const result = await service.validateAccessToken('valid-token');
      expect(result).toEqual({ userId: 'uid', scope: 'app', userRole: RoleEnum.USER });
    });
  });
});
