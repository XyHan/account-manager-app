export class BankAccountView {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly bank: string,
    public readonly type: string,
    public readonly balance: number,
  ) {}

  static create(id: string, name: string, bank: string, type: string, balance: number): BankAccountView {
    return new BankAccountView(id, name, bank, type, balance);
  }

  serialize(): object {
    return { id: this.id, name: this.name, bank: this.bank, type: this.type, balance: this.balance };
  }
}
