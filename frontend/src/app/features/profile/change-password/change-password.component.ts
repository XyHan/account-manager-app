import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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
import { AuthService } from '../../auth/services/auth.service';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPw = control.get('newPassword');
  const confirm = control.get('confirmNewPassword');
  if (!newPw || !confirm) return null;
  return newPw.value !== confirm.value ? { passwordsMismatch: true } : null;
}

@Component({
  selector: 'app-change-password',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe,
  ],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss',
})
export class ChangePasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  protected readonly loading = signal(false);
  protected readonly apiErrorKey = signal<string | null>(null);
  protected readonly hideCurrentPw = signal(true);
  protected readonly hideNewPw = signal(true);
  protected readonly hideConfirmPw = signal(true);

  protected readonly form = this.fb.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmNewPassword: ['', Validators.required],
    },
    { validators: passwordsMatchValidator },
  );

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.apiErrorKey.set(null);

    const { currentPassword, newPassword } = this.form.getRawValue();

    this.authService.changePassword(currentPassword!, newPassword!).subscribe({
      next: () => {
        this.authService.logout();
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        if (err.status === 401) {
          this.apiErrorKey.set('profile.changePassword.errors.wrongCurrentPassword');
        } else {
          this.apiErrorKey.set('common.error');
        }
      },
    });
  }

  getErrorKey(field: string): string | null {
    const control = this.form.get(field);
    if (!control || (!control.dirty && !control.touched)) return null;

    if (field === 'currentPassword') {
      if (control.hasError('required')) return 'profile.changePassword.errors.currentPasswordRequired';
    }
    if (field === 'newPassword') {
      if (control.hasError('required')) return 'profile.changePassword.errors.newPasswordRequired';
      if (control.hasError('minlength')) return 'auth.errors.passwordMinLength';
    }
    if (field === 'confirmNewPassword') {
      if (control.hasError('required')) return 'profile.changePassword.errors.confirmNewPasswordRequired';
      if (this.form.hasError('passwordsMismatch')) return 'auth.errors.passwordsMismatch';
    }
    return null;
  }
}
