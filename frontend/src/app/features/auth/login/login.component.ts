import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <mat-icon class="logo-icon">account_balance_wallet</mat-icon>
        <h1>Account Manager</h1>
        <p class="subtitle">Gérez vos finances personnelles</p>

        @if (errorMessage()) {
          <p class="error">{{ errorMessage() }}</p>
        }

        <button
          mat-flat-button
          [disabled]="loading()"
          (click)="login()"
        >
          @if (loading()) {
            <mat-spinner diameter="20" />
          } @else {
            <mat-icon>login</mat-icon>
            Se connecter
          }
        </button>

        <p class="register-link">
          Pas encore de compte&nbsp;?
          <a routerLink="/register">Créer un compte</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: var(--color-bg, #1a1b2e);
    }
    .login-card {
      background: var(--color-surface, #252641);
      border-radius: 12px;
      padding: 2.5rem;
      width: 360px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 4px 24px rgba(0,0,0,.3);
    }
    .logo-icon { font-size: 3rem; height: 3rem; width: 3rem; color: var(--color-primary, #6c63ff); }
    h1 { margin: 0; font-size: 1.5rem; font-weight: 600; color: var(--color-text, #e2e8f0); }
    .subtitle { margin: 0; color: var(--color-text-muted, #94a3b8); font-size: .875rem; }
    button[mat-flat-button] { width: 100%; display: flex; gap: .5rem; align-items: center; justify-content: center; }
    .register-link { font-size: .875rem; color: var(--color-text-muted, #94a3b8); text-align: center; }
    .register-link a { color: var(--color-primary, #6c63ff); text-decoration: none; }
    .error { color: var(--color-expense, #f87171); font-size: .875rem; text-align: center; }
  `],
})
export class LoginComponent {
  private readonly authService = inject(AuthService);

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  login(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.login().catch(() => {
      this.loading.set(false);
      this.errorMessage.set('Impossible de démarrer la connexion. Veuillez réessayer.');
    });
  }
}
