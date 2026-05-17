import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import type { BankAccountListResponse, BankAccountModel, CreateBankAccountPayload } from '../models/bank-account.model';

export interface IBankAccountRepository {
  findAll(): Observable<BankAccountListResponse>;
  create(payload: CreateBankAccountPayload): Observable<BankAccountModel>;
}

export const BANK_ACCOUNT_REPOSITORY = new InjectionToken<IBankAccountRepository>('IBankAccountRepository');
