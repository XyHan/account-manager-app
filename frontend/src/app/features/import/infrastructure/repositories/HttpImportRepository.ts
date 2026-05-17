import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { IImportRepository } from '../../domain/repositories/IImportRepository';
import type { ImportResultModel } from '../../domain/models/import.model';

@Injectable({ providedIn: 'root' })
export class HttpImportRepository implements IImportRepository {
  private readonly http = inject(HttpClient);

  importCsv(bankAccountId: string, file: File): Observable<ImportResultModel> {
    const form = new FormData();
    form.append('bankAccountId', bankAccountId);
    form.append('file', file);
    return this.http.post<ImportResultModel>('/api/import', form);
  }
}
