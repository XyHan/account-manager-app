import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { PkceService } from './pkce.service';
import { AUTH_REPOSITORY } from '../domain/repositories/IAuthRepository';
import { environment } from '../../../../environments/environment';

const exchangeCodeSpy = vi.fn().mockReturnValue(of(undefined));
const refreshTokenSpy = vi.fn().mockReturnValue(of(undefined));
const logoutSpy = vi.fn().mockReturnValue(of(undefined));
const changePasswordSpy = vi.fn().mockReturnValue(of(undefined));
const meSpy = vi.fn().mockReturnValue(of({ userId: 'uid', role: 'USER', scope: 'app' }));

const authRepositoryStub = {
  register: vi.fn(),
  exchangeCode: exchangeCodeSpy,
  refreshToken: refreshTokenSpy,
  logout: logoutSpy,
  changePassword: changePasswordSpy,
  me: meSpy,
};

describe('AuthService', () => {
  let service: AuthService;
  let pkceService: PkceService;

  beforeEach(() => {
    exchangeCodeSpy.mockReset().mockReturnValue(of(undefined));
    refreshTokenSpy.mockReset().mockReturnValue(of(undefined));
    logoutSpy.mockReset().mockReturnValue(of(undefined));
    changePasswordSpy.mockReset().mockReturnValue(of(undefined));
    meSpy.mockReset().mockReturnValue(of({ userId: 'uid', role: 'USER', scope: 'app' }));

    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'login', component: class {} as never }]),
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

  describe('logout', () => {
    it('delegates to authRepository.logout', () => {
      service.logout();
      expect(logoutSpy).toHaveBeenCalledTimes(1);
    });

    it('navigates to /login after successful logout', async () => {
      const router = TestBed.inject(Router) as Router;
      const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
      service.logout();
      await new Promise<void>((r) => setTimeout(r, 0));
      expect(navigateSpy).toHaveBeenCalledWith('/login');
    });

    it('navigates to /login even when logout API fails', async () => {
      logoutSpy.mockReturnValue(throwError(() => new Error('Network error')));
      const router = TestBed.inject(Router) as Router;
      const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
      service.logout();
      await new Promise<void>((r) => setTimeout(r, 0));
      expect(navigateSpy).toHaveBeenCalledWith('/login');
    });
  });

  describe('changePassword', () => {
    it('delegates to authRepository.changePassword with correct params', async () => {
      await firstValueFrom(service.changePassword('OldPass1', 'NewPass2'));
      expect(changePasswordSpy).toHaveBeenCalledWith('OldPass1', 'NewPass2');
    });

    it('propagates error when changePassword fails', async () => {
      changePasswordSpy.mockReturnValue(throwError(() => new Error('Unauthorized')));
      await expect(firstValueFrom(service.changePassword('wrong', 'NewPass2'))).rejects.toThrow('Unauthorized');
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
