import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthCallbackComponent } from './auth-callback.component';
import { AuthService } from '../services/auth.service';

const exchangeCodeSpy = vi.fn().mockReturnValue(of(undefined));

const authServiceStub = { exchangeCode: exchangeCodeSpy };

function makeActivatedRoute(params: Record<string, string | null>) {
  return {
    snapshot: {
      queryParamMap: { get: (key: string) => params[key] ?? null },
    },
  };
}

describe('AuthCallbackComponent', () => {
  beforeEach(() => {
    exchangeCodeSpy.mockReset();
    exchangeCodeSpy.mockReturnValue(of(undefined));

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'dashboard', component: class {} as never },
          { path: 'login', component: class {} as never },
        ]),
        { provide: AuthService, useValue: authServiceStub },
      ],
    });
    // No inject() here — would instantiate the module and block overrideProvider
  });

  // overrideProvider must be called before any inject() to avoid "module already instantiated" error
  function setupModule(params: Record<string, string | null>): Router {
    TestBed.overrideProvider(ActivatedRoute, { useValue: makeActivatedRoute(params) });
    return TestBed.inject(Router);
  }

  function createFixture() {
    const fixture = TestBed.createComponent(AuthCallbackComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('shows error when code param is missing', () => {
    setupModule({ code: null, state: 'state' });
    const fixture = createFixture();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.error')?.textContent).toContain('Paramètres');
  });

  it('shows error when state param is missing', () => {
    setupModule({ code: 'abc', state: null });
    const fixture = createFixture();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.error')?.textContent).toContain('Paramètres');
  });

  it('navigates to /dashboard on successful exchange', async () => {
    const router = setupModule({ code: 'auth-code', state: 'my-state' });
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const fixture = createFixture();
    await fixture.whenStable();

    expect(navigateSpy).toHaveBeenCalledWith('/dashboard', { replaceUrl: true });
  });


  it('shows error message when exchangeCode fails', async () => {
    exchangeCodeSpy.mockReturnValue(throwError(() => new Error('CSRF invalide')));

    setupModule({ code: 'auth-code', state: 'bad-state' });
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.error')?.textContent).toContain('CSRF invalide');
  });

  it('calls exchangeCode with correct params from query string', async () => {
    const router = setupModule({ code: 'my-code', state: 'my-state' });
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const fixture = createFixture();
    await fixture.whenStable();

    expect(exchangeCodeSpy).toHaveBeenCalledWith('my-code', 'my-state');
  });
});
