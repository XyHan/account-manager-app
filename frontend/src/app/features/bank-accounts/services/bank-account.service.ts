import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BANK_ACCOUNT_REPOSITORY } from '../domain/repositories/IBankAccountRepository';
import type { BankAccountModel, CreateBankAccountPayload } from '../domain/models/bank-account.model';

@Injectable({ providedIn: 'root' })
export class BankAccountService {
  private readonly repository = inject(BANK_ACCOUNT_REPOSITORY);

  create(payload: CreateBankAccountPayload): Observable<BankAccountModel> {
    return this.repository.create(payload);
  }
}
