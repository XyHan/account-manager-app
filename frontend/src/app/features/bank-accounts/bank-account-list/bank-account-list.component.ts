import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { catchError, EMPTY } from 'rxjs';
import { BANK_ACCOUNT_REPOSITORY } from '../domain/repositories/IBankAccountRepository';
import { HttpBankAccountRepository } from '../infrastructure/repositories/HttpBankAccountRepository';
import { BankAccountService } from '../services/bank-account.service';
import type { BankAccountModel } from '../domain/models/bank-account.model';
import { BankAccountFormComponent, type BankAccountFormDialogData } from '../bank-account-form/bank-account-form.component';

@Component({
  selector: 'app-bank-account-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    TranslatePipe,
  ],
  providers: [
    { provide: BANK_ACCOUNT_REPOSITORY, useClass: HttpBankAccountRepository },
  ],
  templateUrl: './bank-account-list.component.html',
  styleUrl: './bank-account-list.component.scss',
})
export class BankAccountListComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly bankAccountService = inject(BankAccountService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly accounts = signal<BankAccountModel[]>([]);
  protected readonly consolidatedBalance = signal<number>(0);
  protected readonly loading = signal<boolean>(true);
  protected readonly error = signal<boolean>(false);

  ngOnInit(): void {
    this.load();
  }

  reload(): void {
    this.load();
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(BankAccountFormComponent, { width: '480px' });

    ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((created: BankAccountModel | undefined) => {
      if (!created) return;
      this.accounts.update((list) => [...list, created]);
      this.consolidatedBalance.update((total) => total + created.balance);
      this.snackBar.open(
        this.translate.instant('bankAccounts.list.createSuccess'),
        this.translate.instant('common.confirm'),
        { duration: 3000 },
      );
    });
  }

  openEditDialog(account: BankAccountModel): void {
    const data: BankAccountFormDialogData = { account };
    const ref = this.dialog.open(BankAccountFormComponent, { width: '480px', data });

    ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((updated: BankAccountModel | undefined) => {
      if (!updated) return;
      this.accounts.update((list) => list.map((a) => (a.id === updated.id ? updated : a)));
      this.snackBar.open(
        this.translate.instant('bankAccounts.list.editSuccess'),
        this.translate.instant('common.confirm'),
        { duration: 3000 },
      );
    });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(false);

    this.bankAccountService.findAll().pipe(
      catchError(() => {
        this.loading.set(false);
        this.error.set(true);
        return EMPTY;
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((response) => {
      this.accounts.set(response.accounts);
      this.consolidatedBalance.set(response.consolidatedBalance);
      this.loading.set(false);
    });
  }
}
