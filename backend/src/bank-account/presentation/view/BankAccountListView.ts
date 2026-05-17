import type { BankAccountCollection } from '../../domain/collection/BankAccountCollection';

export class BankAccountListView {
  private constructor(
    public readonly accounts: object[],
    public readonly consolidatedBalance: number,
  ) {}

  static from(collection: BankAccountCollection, consolidatedBalance: number): BankAccountListView {
    return new BankAccountListView(collection.serialize(), consolidatedBalance);
  }

  serialize(): object {
    return { accounts: this.accounts, consolidatedBalance: this.consolidatedBalance };
  }
}
