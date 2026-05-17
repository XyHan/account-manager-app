import type { Transaction } from '../entities/Transaction';

export const TRANSACTION_REPOSITORY = 'ITransactionRepository';

export interface ITransactionRepository {
  saveBatch(transactions: Transaction[]): Promise<void>;
  existsByHash(hash: string, bankAccountId: string): Promise<boolean>;
  sumByBankAccount(bankAccountId: string): Promise<number>;
}
