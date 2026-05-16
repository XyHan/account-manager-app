import { Injectable, Inject, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, filter, map, of, take, tap, throwError } from 'rxjs';
import { PkceService } from './pkce.service';
import { AUTH_REPOSITORY, type IAuthRepository } from '../domain/repositories/IAuthRepository';
import type { MeView } from '../domain/models/MeView';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly pkceService = inject(PkceService);

  private isRefreshing = false;
  private readonly tokenRefreshed$ = new BehaviorSubject<boolean>(false);

  constructor(@Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository) {}

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

    return this.authRepository.exchangeCode(
      code,
      session.verifier,
      environment.oauthClientId,
      this.redirectUri,
    );
  }

  refresh(): Observable<void> {
    if (this.isRefreshing) {
      return this.tokenRefreshed$.pipe(
        filter(Boolean),
        take(1),
        map(() => undefined as void),
      );
    }

    this.isRefreshing = true;
    this.tokenRefreshed$.next(false);

    return this.authRepository.refreshToken().pipe(
      tap(() => {
        this.isRefreshing = false;
        this.tokenRefreshed$.next(true);
      }),
      catchError((err: unknown) => {
        this.isRefreshing = false;
        this.tokenRefreshed$.next(false);
        return throwError(() => err);
      }),
    );
  }

  me(): Observable<MeView> {
    return this.authRepository.me();
  }

  isAuthenticated(): Observable<boolean> {
    return this.me().pipe(
      map(() => true),
      catchError(() => of(false)),
    );
  }

  logout(): void {
    this.authRepository.logout().pipe(
      catchError(() => of(undefined)),
    ).subscribe(() => {
      void this.router.navigateByUrl('/login');
    });
  }
}
