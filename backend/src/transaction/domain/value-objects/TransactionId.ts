import { uuidV7 } from '../../../_shared/domain/uuid/uuid-v7';

export class TransactionId {
  private constructor(private readonly value: string) {}

  static generate(): TransactionId {
    return new TransactionId(uuidV7());
  }

  static from(value: string): TransactionId {
    if (!value.trim()) throw new Error('TransactionId cannot be empty');
    return new TransactionId(value);
  }

  toString(): string {
    return this.value;
  }
}
