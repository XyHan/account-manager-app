import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IImportLogRepository } from '../../../domain/repositories/IImportLogRepository';
import type { ImportLog } from '../../../domain/entities/ImportLog';
import { ImportLogOrmEntity, ImportFormatEnum } from '../orm-entities/ImportLogOrmEntity';

@Injectable()
export class ImportLogRepository implements IImportLogRepository {
  constructor(
    @InjectRepository(ImportLogOrmEntity)
    private readonly repository: Repository<ImportLogOrmEntity>,
  ) {}

  async save(log: ImportLog): Promise<void> {
    await this.repository.save({
      id: log.id.toString(),
      userId: log.userId,
      bankAccountId: log.bankAccountId,
      filename: log.filename,
      format: log.format as ImportFormatEnum,
      addedCount: log.addedCount,
      skippedCount: log.skippedCount,
    });
  }
}
