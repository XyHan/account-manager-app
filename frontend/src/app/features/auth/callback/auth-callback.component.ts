import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatProgressSpinnerModule, MatIconModule, MatButtonModule],
  template: `
    <div class="callback-container">
      @if (loading()) {
        <mat-spinner diameter="48" />
        <p>Connexion en cours…</p>
      } @else if (errorMessage()) {
        <mat-icon color="warn">error_outline</mat-icon>
        <p class="error">{{ errorMessage() }}</p>
        <button mat-stroked-button (click)="goToLogin()">Retourner à la connexion</button>
      }
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      gap: 1rem;
    }
    .error { color: var(--color-expense, #f87171); text-align: center; max-width: 400px; }
    mat-icon { font-size: 3rem; height: 3rem; width: 3rem; }
  `],
})
export class AuthCallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const code = this.route.snapshot.queryParamMap.get('code');
    const state = this.route.snapshot.queryParamMap.get('state');

    if (!code || !state) {
      this.fail('Paramètres de callback manquants.');
      return;
    }

    this.authService.exchangeCode(code, state).subscribe({
      next: () => this.redirectToDashboard(),
      error: (err: Error) => this.fail(err.message),
    });
  }

  private redirectToDashboard(): void {
    this.router.navigateByUrl('/dashboard', { replaceUrl: true }).then((navigated) => {
      if (!navigated) {
        window.location.replace('/dashboard');
      }
    }).catch(() => {
      window.location.replace('/dashboard');
    });
  }

  protected goToLogin(): void {
    void this.router.navigateByUrl('/login');
  }

  private fail(message: string): void {
    this.loading.set(false);
    this.errorMessage.set(message);
  }
}
