export type AccountType = 'CHECKING' | 'SAVINGS' | 'OTHER';

export interface BankAccountModel {
  id: string;
  name: string;
  bank: string;
  type: AccountType;
  balance: number;
}

export interface CreateBankAccountPayload {
  name: string;
  bank: string;
  type: AccountType;
}
