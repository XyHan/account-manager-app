import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { IBankAccountRepository } from '../../domain/repositories/IBankAccountRepository';
import type { BankAccountListResponse, BankAccountModel, CreateBankAccountPayload, UpdateBankAccountPayload } from '../../domain/models/bank-account.model';
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

  update(id: string, payload: UpdateBankAccountPayload): Observable<BankAccountModel> {
    return this.http.patch<BankAccountModel>(`${environment.apiUrl}/bank-accounts/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/bank-accounts/${id}`);
  }
}
