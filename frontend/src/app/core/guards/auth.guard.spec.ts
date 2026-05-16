import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import type { Observable } from 'rxjs';
import type { UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AUTH_REPOSITORY } from '../../features/auth/domain/repositories/IAuthRepository';
import { HttpAuthRepository } from '../../features/auth/infrastructure/repositories/HttpAuthRepository';
import { environment } from '../../../environments/environment';

describe('authGuard', () => {
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AUTH_REPOSITORY, useClass: HttpAuthRepository },
        provideRouter([
          { path: 'dashboard', component: class {} as never, canActivate: [authGuard] },
          { path: 'login', component: class {} as never },
        ]),
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => httpMock.verify());

  it('returns true when /auth/me succeeds', async () => {
    const result$ = TestBed.runInInjectionContext(
      () => authGuard({} as never, {} as never) as Observable<boolean | UrlTree>,
    );

    const resultPromise = firstValueFrom(result$);
    httpMock.expectOne(`${environment.apiUrl}/auth/me`).flush({ userId: 'uid', role: 'USER', scope: 'app' });

    expect(await resultPromise).toBe(true);
  });

  it('returns UrlTree to /login when /auth/me returns 401', async () => {
    const result$ = TestBed.runInInjectionContext(
      () => authGuard({} as never, {} as never) as Observable<boolean | UrlTree>,
    );

    const resultPromise = firstValueFrom(result$);
    httpMock.expectOne(`${environment.apiUrl}/auth/me`).flush('', { status: 401, statusText: 'Unauthorized' });

    const tree = await resultPromise;
    expect(router.serializeUrl(tree as UrlTree)).toBe('/login');
  });
});
