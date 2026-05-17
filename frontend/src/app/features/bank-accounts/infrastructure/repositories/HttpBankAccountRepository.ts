import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { IBankAccountRepository } from '../../domain/repositories/IBankAccountRepository';
import type { BankAccountListResponse, BankAccountModel, CreateBankAccountPayload } from '../../domain/models/bank-account.model';
import { environment } from '../../../../../environments/environment';

@Injectable()
export class HttpBankAccountRepository implements IBankAccountRepository {
  private readonly http = inject(HttpClient);

  findAll(): Observable<BankAccountListResponse> {
    return this.http.get<BankAccountListResponse>(`${environment.apiUrl}/bank-accounts`);
  }

  create(payload: CreateBankAccountPayload): Observable<BankAccountModel> {
    return this.http.post<BankAccountModel>(`${environment.apiUrl}/bank-accounts`, payload);
  }
}
