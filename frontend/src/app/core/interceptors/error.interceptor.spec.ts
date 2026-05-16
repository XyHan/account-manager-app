import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { errorInterceptor } from './error.interceptor';
import { AuthService } from '../../features/auth/services/auth.service';
import { environment } from '../../../environments/environment';

const refreshSpy = vi.fn();
const authServiceStub = { refresh: refreshSpy };

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    refreshSpy.mockReset();
    refreshSpy.mockReturnValue(of(undefined));

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', component: class {} as never }]),
        { provide: AuthService, useValue: authServiceStub },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => httpMock.verify());

  it('does not intercept non-401 errors', () => {
    let errorStatus = 0;
    http.get(`${environment.apiUrl}/some-endpoint`).subscribe({ error: (e) => (errorStatus = e.status) });

    httpMock.expectOne(`${environment.apiUrl}/some-endpoint`).flush('', { status: 500, statusText: 'Server Error' });

    expect(refreshSpy).not.toHaveBeenCalled();
    expect(errorStatus).toBe(500);
  });

  it('does not intercept 401 on /auth/token (avoids infinite loop)', () => {
    let errorStatus = 0;
    http.post(`${environment.apiUrl}/auth/token`, {}).subscribe({ error: (e) => (errorStatus = e.status) });

    httpMock.expectOne(`${environment.apiUrl}/auth/token`).flush('', { status: 401, statusText: 'Unauthorized' });

    expect(refreshSpy).not.toHaveBeenCalled();
    expect(errorStatus).toBe(401);
  });

  it('calls refresh and replays the original request on 401', () => {
    let responseBody: unknown = null;
    http.get(`${environment.apiUrl}/auth/me`).subscribe({ next: (body) => (responseBody = body) });

    // First request fails with 401
    httpMock.expectOne(`${environment.apiUrl}/auth/me`).flush('', { status: 401, statusText: 'Unauthorized' });

    expect(refreshSpy).toHaveBeenCalledTimes(1);

    // Replayed request succeeds
    httpMock.expectOne(`${environment.apiUrl}/auth/me`).flush({ userId: 'uid' });

    expect(responseBody).toEqual({ userId: 'uid' });
  });

  it('redirects to /login when refresh fails', async () => {
    refreshSpy.mockReturnValue(throwError(() => new Error('Refresh failed')));
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    http.get(`${environment.apiUrl}/auth/me`).subscribe({ error: () => null });
    httpMock.expectOne(`${environment.apiUrl}/auth/me`).flush('', { status: 401, statusText: 'Unauthorized' });

    await Promise.resolve();

    expect(navigateSpy).toHaveBeenCalledWith('/login');
  });
});
