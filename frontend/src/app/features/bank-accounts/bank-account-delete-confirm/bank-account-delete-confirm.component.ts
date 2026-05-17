import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import type { BankAccountModel } from '../domain/models/bank-account.model';

export interface BankAccountDeleteConfirmDialogData {
  account: BankAccountModel;
}

@Component({
  selector: 'app-bank-account-delete-confirm',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './bank-account-delete-confirm.component.html',
  styleUrl: './bank-account-delete-confirm.component.scss',
})
export class BankAccountDeleteConfirmComponent {
  private readonly dialogRef = inject(MatDialogRef<BankAccountDeleteConfirmComponent>);
  protected readonly data: BankAccountDeleteConfirmDialogData = inject(MAT_DIALOG_DATA);

  confirm(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
