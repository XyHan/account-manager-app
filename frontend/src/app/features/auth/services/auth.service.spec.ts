import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { PkceService } from './pkce.service';
import { environment } from '../../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let pkceService: PkceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    pkceService = TestBed.inject(PkceService);
    sessionStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

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

    it('POSTs to /auth/token with correct payload when state matches', () => {
      pkceService.storeSession('my-verifier', 'my-state');

      service.exchangeCode('auth-code', 'my-state').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/token`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        grant_type: 'authorization_code',
        code: 'auth-code',
        code_verifier: 'my-verifier',
        client_id: environment.oauthClientId,
        redirect_uri: `${environment.frontUrl}/auth/callback`,
      });
      req.flush({});
    });

    it('clears the PKCE session after a successful exchange', () => {
      pkceService.storeSession('my-verifier', 'my-state');
      service.exchangeCode('auth-code', 'my-state').subscribe();
      httpMock.expectOne(`${environment.apiUrl}/auth/token`).flush({});
      expect(pkceService.consumeSession()).toBeNull();
    });
  });

  describe('refresh', () => {
    it('POSTs to /auth/token with grant_type=refresh_token', () => {
      service.refresh().subscribe();
      const req = httpMock.expectOne(`${environment.apiUrl}/auth/token`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ grant_type: 'refresh_token' });
      req.flush({});
    });

    it('returns an observable that completes on success', async () => {
      const resultPromise = firstValueFrom(service.refresh());
      httpMock.expectOne(`${environment.apiUrl}/auth/token`).flush({});
      // void observable — just assert it resolves without rejection
      await resultPromise;
      expect(true).toBe(true);
    });

    it('propagates error when refresh fails', async () => {
      const result = firstValueFrom(service.refresh());
      httpMock.expectOne(`${environment.apiUrl}/auth/token`).flush('', { status: 401, statusText: 'Unauthorized' });
      await expect(result).rejects.toBeTruthy();
    });

    it('does not make a second HTTP call when a refresh is already in progress', () => {
      // Start two parallel refreshes
      service.refresh().subscribe();
      service.refresh().subscribe();
      // Only one HTTP request should have been made
      httpMock.expectOne(`${environment.apiUrl}/auth/token`).flush({});
    });
  });

  describe('isAuthenticated', () => {
    it('returns true when GET /auth/me succeeds', async () => {
      const result = firstValueFrom(service.isAuthenticated());
      httpMock.expectOne(`${environment.apiUrl}/auth/me`).flush({
        userId: 'uid',
        role: 'USER',
        scope: 'app',
      });
      expect(await result).toBe(true);
    });

    it('returns false when GET /auth/me returns 401', async () => {
      const result = firstValueFrom(service.isAuthenticated());
      httpMock.expectOne(`${environment.apiUrl}/auth/me`).flush('', { status: 401, statusText: 'Unauthorized' });
      expect(await result).toBe(false);
    });
  });
});
