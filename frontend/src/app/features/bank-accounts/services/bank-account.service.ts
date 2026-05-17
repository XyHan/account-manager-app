import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BANK_ACCOUNT_REPOSITORY } from '../domain/repositories/IBankAccountRepository';
import type { BankAccountListResponse, BankAccountModel, CreateBankAccountPayload, UpdateBankAccountPayload } from '../domain/models/bank-account.model';

@Injectable({ providedIn: 'root' })
export class BankAccountService {
  private readonly repository = inject(BANK_ACCOUNT_REPOSITORY);

  findAll(): Observable<BankAccountListResponse> {
    return this.repository.findAll();
  }

  create(payload: CreateBankAccountPayload): Observable<BankAccountModel> {
    return this.repository.create(payload);
  }

  update(id: string, payload: UpdateBankAccountPayload): Observable<BankAccountModel> {
    return this.repository.update(id, payload);
  }

  delete(id: string): Observable<void> {
    return this.repository.delete(id);
  }
}
