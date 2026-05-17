import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { ImportResultModel } from '../models/import.model';

export interface IImportRepository {
  importCsv(bankAccountId: string, file: File): Observable<ImportResultModel>;
}

export const IMPORT_REPOSITORY = new InjectionToken<IImportRepository>('IImportRepository');
