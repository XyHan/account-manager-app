import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BankAccountService } from '../services/bank-account.service';
import type { BankAccountModel, AccountType } from '../domain/models/bank-account.model';

@Component({
  selector: 'app-bank-account-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    TranslatePipe,
  ],
  templateUrl: './bank-account-form.component.html',
})
export class BankAccountFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<BankAccountFormComponent>);
  private readonly bankAccountService = inject(BankAccountService);

  protected readonly loading = signal(false);
  protected readonly apiError = signal<string | null>(null);

  protected readonly accountTypes: AccountType[] = ['CHECKING', 'SAVINGS', 'OTHER'];

  protected readonly form = this.fb.group({
    name: ['', [Validators.required]],
    bank: ['', [Validators.required]],
    type: ['' as AccountType, [Validators.required]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.apiError.set(null);

    const { name, bank, type } = this.form.getRawValue();

    this.bankAccountService.create({ name: name!, bank: bank!, type: type! }).subscribe({
      next: (account: BankAccountModel) => this.dialogRef.close(account),
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.apiError.set(err.status >= 500 ? 'common.error' : 'bankAccounts.form.errors.generic');
      },
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
