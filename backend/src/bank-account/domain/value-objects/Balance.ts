export class Balance {
  private constructor(private readonly amount: number) {}

  static zero(): Balance {
    return new Balance(0);
  }

  static from(value: number): Balance {
    return new Balance(value);
  }

  toNumber(): number {
    return this.amount;
  }

  toString(): string {
    return this.amount.toFixed(2);
  }
}
