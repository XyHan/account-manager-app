import { uuidV7 } from '../../../_shared/domain/uuid/uuid-v7';

export class BankAccountId {
  private constructor(private readonly value: string) {}

  static generate(): BankAccountId {
    return new BankAccountId(uuidV7());
  }

  static from(value: string): BankAccountId {
    if (value.trim().length === 0) throw new Error('BankAccountId cannot be empty');
    return new BankAccountId(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: BankAccountId): boolean {
    return this.value === other.value;
  }
}
