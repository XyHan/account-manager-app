import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpAuthRepository } from './HttpAuthRepository';
import { environment } from '../../../../../environments/environment';

describe('HttpAuthRepository', () => {
  let repo: HttpAuthRepository;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HttpAuthRepository,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    repo = TestBed.inject(HttpAuthRepository);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('register', () => {
    it('POSTs to /auth/register with correct payload', () => {
      repo.register('uid', 'a@b.com', 'pass').subscribe();
      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ id: 'uid', email: 'a@b.com', password: 'pass' });
      req.flush({ id: 'uid', email: 'a@b.com' });
    });
  });

  describe('exchangeCode', () => {
    it('POSTs to /auth/token with authorization_code grant', () => {
      repo.exchangeCode('auth-code', 'verifier', 'app', 'http://localhost:4200/auth/callback').subscribe();
      const req = httpMock.expectOne(`${environment.apiUrl}/auth/token`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        grant_type: 'authorization_code',
        code: 'auth-code',
        code_verifier: 'verifier',
        client_id: 'app',
        redirect_uri: 'http://localhost:4200/auth/callback',
      });
      req.flush({});
    });
  });

  describe('refreshToken', () => {
    it('POSTs to /auth/token with refresh_token grant', () => {
      repo.refreshToken().subscribe();
      const req = httpMock.expectOne(`${environment.apiUrl}/auth/token`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ grant_type: 'refresh_token' });
      req.flush({});
    });
  });

  describe('me', () => {
    it('GETs /auth/me and returns the response', async () => {
      const payload = { userId: 'uid', role: 'USER', scope: 'app' };
      let result: unknown;
      repo.me().subscribe((v) => (result = v));
      httpMock.expectOne(`${environment.apiUrl}/auth/me`).flush(payload);
      expect(result).toEqual(payload);
    });
  });
});
