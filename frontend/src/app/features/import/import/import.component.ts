import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, EMPTY } from 'rxjs';
import { BankAccountService } from '../../bank-accounts/services/bank-account.service';
import { ImportService } from '../services/import.service';
import type { BankAccountModel } from '../../bank-accounts/domain/models/bank-account.model';
import type { ImportResultModel } from '../domain/models/import.model';

@Component({
  selector: 'app-import',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatCardModule,
    TranslatePipe,
  ],
  templateUrl: './import.component.html',
  styleUrl: './import.component.scss',
})
export class ImportComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly bankAccountService = inject(BankAccountService);
  private readonly importService = inject(ImportService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly accounts = signal<BankAccountModel[]>([]);
  protected readonly loadingAccounts = signal(true);
  protected readonly uploading = signal(false);
  protected readonly result = signal<ImportResultModel | null>(null);
  protected readonly uploadError = signal<string | null>(null);
  protected readonly selectedFile = signal<File | null>(null);

  protected readonly form = this.fb.group({
    bankAccountId: ['', Validators.required],
  });

  ngOnInit(): void {
    this.bankAccountService.findAll()
      .pipe(
        catchError(() => {
          this.loadingAccounts.set(false);
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((response) => {
        this.accounts.set(response.accounts);
        this.loadingAccounts.set(false);
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedFile.set(file);
    this.result.set(null);
    this.uploadError.set(null);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0] ?? null;
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      this.selectedFile.set(file);
      this.result.set(null);
      this.uploadError.set(null);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  submit(): void {
    const file = this.selectedFile();
    const bankAccountId = this.form.value.bankAccountId;

    if (this.form.invalid || !file || !bankAccountId) return;

    this.uploading.set(true);
    this.result.set(null);
    this.uploadError.set(null);

    this.importService.importCsv(bankAccountId, file)
      .pipe(
        catchError(() => {
          this.uploading.set(false);
          this.uploadError.set('error');
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        this.uploading.set(false);
        this.result.set(res);
        this.selectedFile.set(null);
        this.form.reset();
      });
  }
}
