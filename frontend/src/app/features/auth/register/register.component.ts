import { ChangeDetectionStrategy, Component, Inject, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AUTH_REPOSITORY, type IAuthRepository } from '../domain/repositories/IAuthRepository';
import { HttpAuthRepository } from '../infrastructure/repositories/HttpAuthRepository';
import { uuidV7 } from '../../../shared/utils/uuid-v7';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const pw = control.get('password');
  const confirm = control.get('confirmPassword');
  if (!pw || !confirm) return null;
  return pw.value !== confirm.value ? { passwordsMismatch: true } : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe,
  ],
  providers: [
    { provide: AUTH_REPOSITORY, useClass: HttpAuthRepository },
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  constructor(@Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository) {}

  protected readonly loading = signal(false);
  protected readonly apiErrorKey = signal<Record<string, string>>({});
  protected readonly hidePassword = signal(true);
  protected readonly hideConfirm = signal(true);

  protected readonly form = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatchValidator },
  );

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.apiErrorKey.set({});

    const { email, password } = this.form.getRawValue();
    const id = uuidV7();

    this.authRepository.register(id, email!, password!).subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        if (err.status === 409) {
          this.apiErrorKey.set({ email: 'auth.errors.emailAlreadyUsed' });
        } else {
          this.apiErrorKey.set({ global: 'auth.errors.generic' });
        }
      },
    });
  }

  getErrorKey(field: string): string | null {
    const control = this.form.get(field);
    if (!control || (!control.dirty && !control.touched)) return null;

    if (field === 'email') {
      if (control.hasError('required')) return 'auth.errors.emailRequired';
      if (control.hasError('email')) return 'auth.errors.emailInvalid';
    }
    if (field === 'password') {
      if (control.hasError('required')) return 'auth.errors.passwordRequired';
      if (control.hasError('minlength')) return 'auth.errors.passwordMinLength';
    }
    if (field === 'confirmPassword') {
      if (control.hasError('required')) return 'auth.errors.confirmPasswordRequired';
      if (this.form.hasError('passwordsMismatch')) return 'auth.errors.passwordsMismatch';
    }
    return null;
  }
}
