import { createHash } from 'crypto';

export class TransactionHash {
  private constructor(private readonly value: string) {}

  static from(date: Date, amount: number, label: string, bankAccountId: string): TransactionHash {
    const raw = `${date.toISOString().slice(0, 10)}|${amount.toFixed(2)}|${label.trim().toLowerCase()}|${bankAccountId}`;
    const hash = createHash('sha256').update(raw).digest('hex');
    return new TransactionHash(hash);
  }

  static fromString(value: string): TransactionHash {
    return new TransactionHash(value);
  }

  toString(): string {
    return this.value;
  }
}
