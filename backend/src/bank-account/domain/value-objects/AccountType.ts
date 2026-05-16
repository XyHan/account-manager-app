export enum AccountTypeEnum {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
  OTHER = 'OTHER',
}

export class AccountType {
  private constructor(private readonly value: AccountTypeEnum) {}

  static from(value: string): AccountType {
    if (!Object.values(AccountTypeEnum).includes(value as AccountTypeEnum)) {
      throw new Error(`Invalid account type: ${value}`);
    }
    return new AccountType(value as AccountTypeEnum);
  }

  toString(): string {
    return this.value;
  }

  equals(other: AccountType): boolean {
    return this.value === other.value;
  }
}
