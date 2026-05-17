import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BankAccountService } from '../services/bank-account.service';
import type { BankAccountModel, AccountType } from '../domain/models/bank-account.model';

export interface BankAccountFormDialogData {
  account?: BankAccountModel;
}

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
  protected readonly data: BankAccountFormDialogData = inject(MAT_DIALOG_DATA, { optional: true }) ?? {};

  protected readonly loading = signal(false);
  protected readonly apiError = signal<string | null>(null);

  protected readonly accountTypes: AccountType[] = ['CHECKING', 'SAVINGS', 'OTHER'];
  protected readonly isEditMode = !!this.data.account;

  protected readonly form = this.fb.group({
    name: [this.data.account?.name ?? '', [Validators.required]],
    bank: [this.data.account?.bank ?? '', [Validators.required]],
    type: [(this.data.account?.type ?? '') as AccountType, [Validators.required]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.apiError.set(null);

    const { name, bank, type } = this.form.getRawValue();

    if (this.isEditMode) {
      this.bankAccountService.update(this.data.account!.id, { name: name!, bank: bank!, type: type! }).subscribe({
        next: (updated: BankAccountModel) => this.dialogRef.close(updated),
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          this.apiError.set(err.status >= 500 ? 'common.error' : 'bankAccounts.form.errors.generic');
        },
      });
    } else {
      this.bankAccountService.create({ name: name!, bank: bank!, type: type! }).subscribe({
        next: (account: BankAccountModel) => this.dialogRef.close(account),
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          this.apiError.set(err.status >= 500 ? 'common.error' : 'bankAccounts.form.errors.generic');
        },
      });
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
