import type { ImportLog } from '../entities/ImportLog';

export const IMPORT_LOG_REPOSITORY = 'IImportLogRepository';

export interface IImportLogRepository {
  save(log: ImportLog): Promise<void>;
}
