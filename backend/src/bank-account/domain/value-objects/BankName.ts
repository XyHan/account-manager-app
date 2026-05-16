export class BankName {
  private constructor(private readonly value: string) {}

  static from(value: string): BankName {
    if (value.trim().length === 0) throw new Error('BankName cannot be empty');
    return new BankName(value.trim());
  }

  toString(): string {
    return this.value;
  }

  equals(other: BankName): boolean {
    return this.value === other.value;
  }
}
