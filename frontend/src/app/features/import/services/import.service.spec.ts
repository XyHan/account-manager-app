import { TestBed } from '@angular/core/testing';
import { of, throwError, firstValueFrom } from 'rxjs';
import { ImportService } from './import.service';
import { IMPORT_REPOSITORY } from '../domain/repositories/IImportRepository';
import type { ImportResultModel } from '../domain/models/import.model';

const mockResult: ImportResultModel = {
  filename: 'test.csv',
  format: 'CSV',
  addedCount: 5,
  skippedCount: 2,
};

const importCsvSpy = vi.fn().mockReturnValue(of(mockResult));
const repositoryStub = { importCsv: importCsvSpy };

describe('ImportService', () => {
  let service: ImportService;

  beforeEach(() => {
    importCsvSpy.mockReset().mockReturnValue(of(mockResult));

    TestBed.configureTestingModule({
      providers: [
        ImportService,
        { provide: IMPORT_REPOSITORY, useValue: repositoryStub },
      ],
    });

    service = TestBed.inject(ImportService);
  });

  describe('importCsv', () => {
    it('delegates to repository with the correct bankAccountId and file', async () => {
      const file = new File(['content'], 'test.csv', { type: 'text/csv' });
      const result = await firstValueFrom(service.importCsv('account-123', file));

      expect(importCsvSpy).toHaveBeenCalledWith('account-123', file);
      expect(result).toEqual(mockResult);
      expect(result.addedCount).toBe(5);
      expect(result.skippedCount).toBe(2);
    });

    it('propagates repository errors', async () => {
      importCsvSpy.mockReturnValue(throwError(() => new Error('Network error')));
      const file = new File(['content'], 'test.csv', { type: 'text/csv' });

      await expect(firstValueFrom(service.importCsv('account-123', file))).rejects.toThrow('Network error');
    });
  });
});
