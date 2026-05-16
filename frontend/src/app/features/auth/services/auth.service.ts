import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { PkceService } from './pkce.service';
import type { MeView } from '../domain/models/MeView';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly pkceService = inject(PkceService);

  private get redirectUri(): string {
    return `${environment.frontUrl}/auth/callback`;
  }

  async login(): Promise<void> {
    const verifier = this.pkceService.generateCodeVerifier();
    const challenge = await this.pkceService.generateCodeChallenge(verifier);
    const state = this.pkceService.generateState();
    this.pkceService.storeSession(verifier, state);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: environment.oauthClientId,
      code_challenge: challenge,
      code_challenge_method: 'S256',
      redirect_uri: this.redirectUri,
      state,
    });

    window.location.href = `${environment.apiUrl}/auth/authorize?${params.toString()}`;
  }

  exchangeCode(code: string, returnedState: string): Observable<void> {
    const session = this.pkceService.consumeSession();

    if (!session) {
      return throwError(() => new Error('PKCE session introuvable — veuillez recommencer la connexion'));
    }
    if (session.state !== returnedState) {
      return throwError(() => new Error('État CSRF invalide — tentative de connexion rejetée'));
    }

    return this.http.post<void>(
      `${environment.apiUrl}/auth/token`,
      {
        grant_type: 'authorization_code',
        code,
        code_verifier: session.verifier,
        client_id: environment.oauthClientId,
        redirect_uri: this.redirectUri,
      },
    );
  }

  me(): Observable<MeView> {
    return this.http.get<MeView>(`${environment.apiUrl}/auth/me`);
  }

  isAuthenticated(): Observable<boolean> {
    return this.me().pipe(
      map(() => true),
      catchError(() => of(false)),
    );
  }

  logout(): void {
    void this.router.navigateByUrl('/login');
  }
}
