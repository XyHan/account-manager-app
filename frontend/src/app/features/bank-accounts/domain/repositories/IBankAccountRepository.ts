import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import type { BankAccountListResponse, BankAccountModel, CreateBankAccountPayload, UpdateBankAccountPayload } from '../models/bank-account.model';

export interface IBankAccountRepository {
  findAll(): Observable<BankAccountListResponse>;
  create(payload: CreateBankAccountPayload): Observable<BankAccountModel>;
  update(id: string, payload: UpdateBankAccountPayload): Observable<BankAccountModel>;
  delete(id: string): Observable<void>;
}

export const BANK_ACCOUNT_REPOSITORY = new InjectionToken<IBankAccountRepository>('IBankAccountRepository');
