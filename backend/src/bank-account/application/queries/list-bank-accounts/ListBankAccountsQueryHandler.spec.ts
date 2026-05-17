import { ListBankAccountsQueryHandler } from './ListBankAccountsQueryHandler';
import { ListBankAccountsQuery } from './ListBankAccountsQuery';
import { BankAccountCollection } from '../../../domain/collection/BankAccountCollection';
import { BankAccountReadModel } from '../../../domain/models/BankAccountReadModel';
import type { IBankAccountFinder } from '../../../domain/finders/IBankAccountFinder';

const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

function makeReadModel(id: string): BankAccountReadModel {
  return new BankAccountReadModel(id, 'Compte courant', 'BNP Paribas', 'CHECKING', 1500, new Date('2024-01-01'));
}

describe('ListBankAccountsQueryHandler', () => {
  let handler: ListBankAccountsQueryHandler;
  let bankAccountFinder: jest.Mocked<IBankAccountFinder>;

  beforeEach(() => {
    bankAccountFinder = {
      findAll: jest.fn(),
      consolidatedBalance: jest.fn(),
    };
    handler = new ListBankAccountsQueryHandler(bankAccountFinder);
  });

  it('returns a BankAccountCollection for the given userId', async () => {
    const collection = new BankAccountCollection([makeReadModel('account-1'), makeReadModel('account-2')]);
    bankAccountFinder.findAll.mockResolvedValue(collection);

    const result = await handler.handle(new ListBankAccountsQuery(TEST_USER_ID));

    expect(result).toBe(collection);
    expect(result.count()).toBe(2);
    expect(bankAccountFinder.findAll).toHaveBeenCalledTimes(1);
  });

  it('passes userId through WithUserId criterion', async () => {
    const collection = new BankAccountCollection([]);
    bankAccountFinder.findAll.mockResolvedValue(collection);

    await handler.handle(new ListBankAccountsQuery(TEST_USER_ID));

    const [criteria] = bankAccountFinder.findAll.mock.calls[0];
    const criterion = criteria.toArray()[0];
    expect(criterion.getValue()).toBe(TEST_USER_ID);
  });

  it('returns an empty collection when user has no accounts', async () => {
    const empty = new BankAccountCollection([]);
    bankAccountFinder.findAll.mockResolvedValue(empty);

    const result = await handler.handle(new ListBankAccountsQuery(TEST_USER_ID));

    expect(result.isEmpty()).toBe(true);
  });

  it('totalBalance() sums balances of all accounts in the collection', async () => {
    const items = [
      new BankAccountReadModel('a', 'C1', 'BNP', 'CHECKING', 1000, new Date()),
      new BankAccountReadModel('b', 'C2', 'LCL', 'SAVINGS', 500.50, new Date()),
      new BankAccountReadModel('c', 'C3', 'CA', 'OTHER', -200, new Date()),
    ];
    bankAccountFinder.findAll.mockResolvedValue(new BankAccountCollection(items));

    const result = await handler.handle(new ListBankAccountsQuery(TEST_USER_ID));

    expect(result.totalBalance()).toBeCloseTo(1300.50);
  });
});
