import { BankAccount } from '../entities/BankAccount';
import { BankAccountId } from '../value-objects/BankAccountId';

export const BANK_ACCOUNT_REPOSITORY = 'IBankAccountRepository';

export interface IBankAccountRepository {
  save(account: BankAccount): Promise<void>;
  findById(id: BankAccountId): Promise<BankAccount | null>;
}
