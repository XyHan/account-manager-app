import { uuidV7 } from '../../../_shared/domain/uuid/uuid-v7';

export class ImportLogId {
  private constructor(private readonly value: string) {}

  static generate(): ImportLogId {
    return new ImportLogId(uuidV7());
  }

  static from(value: string): ImportLogId {
    return new ImportLogId(value);
  }

  toString(): string {
    return this.value;
  }
}
