import type { EventInterface } from '../../../_shared/infrastructure/message-bus/event/event.interface';
import { BankAccountId } from '../value-objects/BankAccountId';
import { BankName } from '../value-objects/BankName';
import { AccountType } from '../value-objects/AccountType';
import { Balance } from '../value-objects/Balance';
import { BankAccountCreated } from '../events/BankAccountCreated';

export class BankAccount {
  private readonly domainEvents: EventInterface[] = [];

  private constructor(
    private readonly _id: BankAccountId,
    private readonly _userId: string,
    private readonly _name: BankName,
    private readonly _bank: BankName,
    private readonly _type: AccountType,
    private _balance: Balance,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date,
  ) {}

  static create(
    id: BankAccountId,
    userId: string,
    name: BankName,
    bank: BankName,
    type: AccountType,
  ): BankAccount {
    const account = new BankAccount(id, userId, name, bank, type, Balance.zero(), new Date(), new Date());
    account.addDomainEvent(
      new BankAccountCreated(id.toString(), userId, name.toString(), bank.toString(), type.toString()),
    );
    return account;
  }

  static reconstitute(
    id: BankAccountId,
    userId: string,
    name: BankName,
    bank: BankName,
    type: AccountType,
    balance: Balance,
    createdAt: Date,
    updatedAt: Date,
  ): BankAccount {
    return new BankAccount(id, userId, name, bank, type, balance, createdAt, updatedAt);
  }

  get id(): BankAccountId { return this._id; }
  get userId(): string { return this._userId; }
  get name(): BankName { return this._name; }
  get bank(): BankName { return this._bank; }
  get type(): AccountType { return this._type; }
  get balance(): Balance { return this._balance; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  pullDomainEvents(): EventInterface[] {
    const events = [...this.domainEvents];
    this.domainEvents.length = 0;
    return events;
  }

  private addDomainEvent(event: EventInterface): void {
    this.domainEvents.push(event);
  }
}
