import { TransactionId } from '../value-objects/TransactionId';
import { TransactionHash } from '../value-objects/TransactionHash';

export class Transaction {
  private constructor(
    private readonly _id: TransactionId,
    private readonly _userId: string,
    private readonly _bankAccountId: string,
    private readonly _date: Date,
    private readonly _amount: number,
    private readonly _labelEncrypted: string,
    private readonly _labelIv: string,
    private readonly _hash: TransactionHash,
    private readonly _importLogId: string | null,
    private readonly _createdAt: Date,
  ) {}

  static create(
    id: TransactionId,
    userId: string,
    bankAccountId: string,
    date: Date,
    amount: number,
    labelEncrypted: string,
    labelIv: string,
    hash: TransactionHash,
    importLogId: string | null = null,
  ): Transaction {
    return new Transaction(id, userId, bankAccountId, date, amount, labelEncrypted, labelIv, hash, importLogId, new Date());
  }

  get id(): TransactionId { return this._id; }
  get userId(): string { return this._userId; }
  get bankAccountId(): string { return this._bankAccountId; }
  get date(): Date { return this._date; }
  get amount(): number { return this._amount; }
  get labelEncrypted(): string { return this._labelEncrypted; }
  get labelIv(): string { return this._labelIv; }
  get hash(): TransactionHash { return this._hash; }
  get importLogId(): string | null { return this._importLogId; }
  get createdAt(): Date { return this._createdAt; }
}
