import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import type { UserView } from '../../domain/models/UserView';
import type { MeView } from '../../domain/models/MeView';
import { environment } from '../../../../../environments/environment';

@Injectable()
export class HttpAuthRepository implements IAuthRepository {
  private readonly http = inject(HttpClient);

  register(id: string, email: string, password: string): Observable<UserView> {
    return this.http.post<UserView>(`${environment.apiUrl}/auth/register`, { id, email, password });
  }

  exchangeCode(code: string, codeVerifier: string, clientId: string, redirectUri: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/token`, {
      grant_type: 'authorization_code',
      code,
      code_verifier: codeVerifier,
      client_id: clientId,
      redirect_uri: redirectUri,
    });
  }

  refreshToken(): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/token`, { grant_type: 'refresh_token' });
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/logout`, {});
  }

  me(): Observable<MeView> {
    return this.http.get<MeView>(`${environment.apiUrl}/auth/me`);
  }
}
