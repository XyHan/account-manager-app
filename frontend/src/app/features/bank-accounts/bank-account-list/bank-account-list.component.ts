import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BANK_ACCOUNT_REPOSITORY } from '../domain/repositories/IBankAccountRepository';
import { HttpBankAccountRepository } from '../infrastructure/repositories/HttpBankAccountRepository';
import type { BankAccountModel } from '../domain/models/bank-account.model';
import { BankAccountFormComponent } from '../bank-account-form/bank-account-form.component';

@Component({
  selector: 'app-bank-account-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule,
    MatChipsModule,
    TranslatePipe,
  ],
  providers: [
    { provide: BANK_ACCOUNT_REPOSITORY, useClass: HttpBankAccountRepository },
  ],
  templateUrl: './bank-account-list.component.html',
  styleUrl: './bank-account-list.component.scss',
})
export class BankAccountListComponent {
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  protected readonly accounts = signal<BankAccountModel[]>([]);

  openCreateDialog(): void {
    const ref = this.dialog.open(BankAccountFormComponent, { width: '480px' });

    ref.afterClosed().subscribe((created: BankAccountModel | undefined) => {
      if (!created) return;
      this.accounts.update((list) => [...list, created]);
      this.snackBar.open(
        this.translate.instant('bankAccounts.list.createSuccess'),
        this.translate.instant('common.confirm'),
        { duration: 3000 },
      );
    });
  }
}
