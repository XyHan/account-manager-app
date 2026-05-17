import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { credentialsInterceptor } from './core/interceptors/credentials.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { AUTH_REPOSITORY } from './features/auth/domain/repositories/IAuthRepository';
import { HttpAuthRepository } from './features/auth/infrastructure/repositories/HttpAuthRepository';
import { BANK_ACCOUNT_REPOSITORY } from './features/bank-accounts/domain/repositories/IBankAccountRepository';
import { HttpBankAccountRepository } from './features/bank-accounts/infrastructure/repositories/HttpBankAccountRepository';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withFetch(), withInterceptors([credentialsInterceptor, errorInterceptor])),
    { provide: AUTH_REPOSITORY, useClass: HttpAuthRepository },
    { provide: BANK_ACCOUNT_REPOSITORY, useClass: HttpBankAccountRepository },
    provideTranslateService({ lang: 'fr' }),
    ...provideTranslateHttpLoader({ prefix: '/i18n/', suffix: '.json' }),
  ],
};
