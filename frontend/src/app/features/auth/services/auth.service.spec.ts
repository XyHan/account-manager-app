import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { PkceService } from './pkce.service';
import { AUTH_REPOSITORY } from '../domain/repositories/IAuthRepository';
import { environment } from '../../../../environments/environment';

const exchangeCodeSpy = vi.fn().mockReturnValue(of(undefined));
const refreshTokenSpy = vi.fn().mockReturnValue(of(undefined));
const meSpy = vi.fn().mockReturnValue(of({ userId: 'uid', role: 'USER', scope: 'app' }));

const authRepositoryStub = {
  register: vi.fn(),
  exchangeCode: exchangeCodeSpy,
  refreshToken: refreshTokenSpy,
  me: meSpy,
};

describe('AuthService', () => {
  let service: AuthService;
  let pkceService: PkceService;

  beforeEach(() => {
    exchangeCodeSpy.mockReset().mockReturnValue(of(undefined));
    refreshTokenSpy.mockReset().mockReturnValue(of(undefined));
    meSpy.mockReset().mockReturnValue(of({ userId: 'uid', role: 'USER', scope: 'app' }));

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AUTH_REPOSITORY, useValue: authRepositoryStub },
      ],
    });

    service = TestBed.inject(AuthService);
    pkceService = TestBed.inject(PkceService);
    sessionStorage.clear();
  });

  afterEach(() => sessionStorage.clear());

  describe('exchangeCode', () => {
    it('returns error when PKCE session is missing', async () => {
      await expect(firstValueFrom(service.exchangeCode('code', 'state'))).rejects.toThrow(
        /PKCE session introuvable/,
      );
    });

    it('returns error when state does not match', async () => {
      pkceService.storeSession('verifier', 'expected-state');
      await expect(firstValueFrom(service.exchangeCode('code', 'wrong-state'))).rejects.toThrow(
        /CSRF/,
      );
    });

    it('calls authRepository.exchangeCode with correct params when state matches', async () => {
      pkceService.storeSession('my-verifier', 'my-state');
      await firstValueFrom(service.exchangeCode('auth-code', 'my-state'));

      expect(exchangeCodeSpy).toHaveBeenCalledWith(
        'auth-code',
        'my-verifier',
        environment.oauthClientId,
        `${environment.frontUrl}/auth/callback`,
      );
    });

    it('clears the PKCE session after delegating to the repository', async () => {
      pkceService.storeSession('my-verifier', 'my-state');
      await firstValueFrom(service.exchangeCode('auth-code', 'my-state'));
      expect(pkceService.consumeSession()).toBeNull();
    });
  });

  describe('refresh', () => {
    it('delegates to authRepository.refreshToken', async () => {
      await firstValueFrom(service.refresh());
      expect(refreshTokenSpy).toHaveBeenCalledTimes(1);
    });

    it('propagates error when refreshToken fails', async () => {
      refreshTokenSpy.mockReturnValue(throwError(() => new Error('Unauthorized')));
      await expect(firstValueFrom(service.refresh())).rejects.toThrow('Unauthorized');
    });

    it('calls refreshToken only once when called concurrently', () => {
      const subject = new Subject<void>();
      refreshTokenSpy.mockReturnValue(subject.asObservable());

      service.refresh().subscribe();
      service.refresh().subscribe();
      expect(refreshTokenSpy).toHaveBeenCalledTimes(1);

      subject.next();
      subject.complete();
    });
  });

  describe('isAuthenticated', () => {
    it('returns true when me() succeeds', async () => {
      expect(await firstValueFrom(service.isAuthenticated())).toBe(true);
    });

    it('returns false when me() fails', async () => {
      meSpy.mockReturnValue(throwError(() => new Error('Unauthorized')));
      expect(await firstValueFrom(service.isAuthenticated())).toBe(false);
    });
  });
});
