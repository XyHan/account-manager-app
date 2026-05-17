import { GetConsolidatedBalanceQueryHandler } from './GetConsolidatedBalanceQueryHandler';
import { GetConsolidatedBalanceQuery } from './GetConsolidatedBalanceQuery';
import type { IBankAccountFinder } from '../../../domain/finders/IBankAccountFinder';

const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

describe('GetConsolidatedBalanceQueryHandler', () => {
  let handler: GetConsolidatedBalanceQueryHandler;
  let bankAccountFinder: jest.Mocked<IBankAccountFinder>;

  beforeEach(() => {
    bankAccountFinder = {
      findAll: jest.fn(),
      consolidatedBalance: jest.fn(),
    };
    handler = new GetConsolidatedBalanceQueryHandler(bankAccountFinder);
  });

  it('returns the consolidated balance from the finder', async () => {
    bankAccountFinder.consolidatedBalance.mockResolvedValue(4250.75);

    const result = await handler.handle(new GetConsolidatedBalanceQuery(TEST_USER_ID));

    expect(result).toBe(4250.75);
    expect(bankAccountFinder.consolidatedBalance).toHaveBeenCalledTimes(1);
  });

  it('passes userId through WithUserId criterion', async () => {
    bankAccountFinder.consolidatedBalance.mockResolvedValue(0);

    await handler.handle(new GetConsolidatedBalanceQuery(TEST_USER_ID));

    const [criteria] = bankAccountFinder.consolidatedBalance.mock.calls[0];
    const criterion = criteria.toArray()[0];
    expect(criterion.getValue()).toBe(TEST_USER_ID);
  });

  it('returns 0 when user has no accounts', async () => {
    bankAccountFinder.consolidatedBalance.mockResolvedValue(0);

    const result = await handler.handle(new GetConsolidatedBalanceQuery(TEST_USER_ID));

    expect(result).toBe(0);
  });

  it('returns negative balance when sum of accounts is negative', async () => {
    bankAccountFinder.consolidatedBalance.mockResolvedValue(-350.00);

    const result = await handler.handle(new GetConsolidatedBalanceQuery(TEST_USER_ID));

    expect(result).toBe(-350.00);
  });
});
