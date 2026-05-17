export class BankAccountReadModel {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly bank: string,
    public readonly type: string,
    public readonly balance: number,
    public readonly createdAt: Date,
  ) {}

  serialize(): object {
    return {
      id: this.id,
      name: this.name,
      bank: this.bank,
      type: this.type,
      balance: this.balance,
      createdAt: this.createdAt,
    };
  }
}
