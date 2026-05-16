import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import type { UserView } from '../models/UserView';
import type { MeView } from '../models/MeView';

export interface IAuthRepository {
  register(id: string, email: string, password: string): Observable<UserView>;
  exchangeCode(code: string, codeVerifier: string, clientId: string, redirectUri: string): Observable<void>;
  refreshToken(): Observable<void>;
  logout(): Observable<void>;
  me(): Observable<MeView>;
}

export const AUTH_REPOSITORY = new InjectionToken<IAuthRepository>('IAuthRepository');
