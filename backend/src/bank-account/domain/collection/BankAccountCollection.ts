import { Collection } from '../../../_shared/domain/collection/Collection';
import { BankAccountReadModel } from '../models/BankAccountReadModel';

export class BankAccountCollection extends Collection<BankAccountReadModel> {
  constructor(items: BankAccountReadModel[]) {
    super(items);
  }

  totalBalance(): number {
    return this.items.reduce((sum, item) => sum + item.balance, 0);
  }
}
