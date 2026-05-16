import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import type { BankAccountModel, CreateBankAccountPayload } from '../models/bank-account.model';

export interface IBankAccountRepository {
  create(payload: CreateBankAccountPayload): Observable<BankAccountModel>;
}

export const BANK_ACCOUNT_REPOSITORY = new InjectionToken<IBankAccountRepository>('IBankAccountRepository');
