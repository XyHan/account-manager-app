import { ImportLogId } from '../value-objects/ImportLogId';

export type ImportFormat = 'CSV' | 'OFX';

export class ImportLog {
  private constructor(
    private readonly _id: ImportLogId,
    private readonly _userId: string,
    private readonly _bankAccountId: string,
    private readonly _filename: string,
    private readonly _format: ImportFormat,
    private readonly _addedCount: number,
    private readonly _skippedCount: number,
    private readonly _createdAt: Date,
  ) {}

  static create(
    id: ImportLogId,
    userId: string,
    bankAccountId: string,
    filename: string,
    format: ImportFormat,
    addedCount: number,
    skippedCount: number,
  ): ImportLog {
    return new ImportLog(id, userId, bankAccountId, filename, format, addedCount, skippedCount, new Date());
  }

  get id(): ImportLogId { return this._id; }
  get userId(): string { return this._userId; }
  get bankAccountId(): string { return this._bankAccountId; }
  get filename(): string { return this._filename; }
  get format(): ImportFormat { return this._format; }
  get addedCount(): number { return this._addedCount; }
  get skippedCount(): number { return this._skippedCount; }
  get createdAt(): Date { return this._createdAt; }
}
