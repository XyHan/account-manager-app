import type { Criteria } from '../../../_shared/domain/criteria/Criteria';
import type { BankAccountCollection } from '../collection/BankAccountCollection';

export const BANK_ACCOUNT_FINDER = 'IBankAccountFinder';

export interface IBankAccountFinder {
  findAll(criteria: Criteria): Promise<BankAccountCollection>;
  consolidatedBalance(criteria: Criteria): Promise<number>;
}
