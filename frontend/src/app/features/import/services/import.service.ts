import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { IMPORT_REPOSITORY } from '../domain/repositories/IImportRepository';
import type { ImportResultModel } from '../domain/models/import.model';

@Injectable({ providedIn: 'root' })
export class ImportService {
  private readonly repository = inject(IMPORT_REPOSITORY);

  importCsv(bankAccountId: string, file: File): Observable<ImportResultModel> {
    return this.repository.importCsv(bankAccountId, file);
  }
}
