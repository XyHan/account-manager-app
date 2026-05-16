import { of } from 'rxjs';
import { CreateBankAccountCommandHandler } from './CreateBankAccountCommandHandler';
import { CreateBankAccountCommand } from './CreateBankAccountCommand';
import type { IBankAccountRepository } from '../../../domain/repositories/IBankAccountRepository';
import type { EventBus } from '../../../../_shared/infrastructure/message-bus/bridge/bus/event.bus';

const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440000';
const TEST_ACCOUNT_ID = '660e8400-e29b-41d4-a716-446655440001';

function makeCommand(): CreateBankAccountCommand {
  return new CreateBankAccountCommand(
    TEST_USER_ID,
    TEST_ACCOUNT_ID,
    'Compte courant',
    'BNP Paribas',
    'CHECKING',
  );
}

describe('CreateBankAccountCommandHandler', () => {
  let handler: CreateBankAccountCommandHandler;
  let bankAccountRepository: jest.Mocked<IBankAccountRepository>;
  let eventBus: { execute: jest.Mock };

  beforeEach(() => {
    bankAccountRepository = { save: jest.fn(), findById: jest.fn() };
    eventBus = { execute: jest.fn().mockReturnValue(of(undefined)) };

    handler = new CreateBankAccountCommandHandler(
      bankAccountRepository,
      eventBus as unknown as EventBus,
    );
  });

  it('saves a new bank account with balance zero', async () => {
    bankAccountRepository.save.mockResolvedValue(undefined);

    await handler.handle(makeCommand());

    expect(bankAccountRepository.save).toHaveBeenCalledTimes(1);
    const saved = bankAccountRepository.save.mock.calls[0][0];
    expect(saved.id.toString()).toBe(TEST_ACCOUNT_ID);
    expect(saved.userId).toBe(TEST_USER_ID);
    expect(saved.name.toString()).toBe('Compte courant');
    expect(saved.bank.toString()).toBe('BNP Paribas');
    expect(saved.type.toString()).toBe('CHECKING');
    expect(saved.balance.toNumber()).toBe(0);
  });

  it('dispatches BankAccountCreated event', async () => {
    bankAccountRepository.save.mockResolvedValue(undefined);

    await handler.handle(makeCommand());

    expect(eventBus.execute).toHaveBeenCalledTimes(1);
    const event = eventBus.execute.mock.calls[0][0];
    expect(event.constructor.name).toBe('BankAccountCreated');
    expect(event.bankAccountId).toBe(TEST_ACCOUNT_ID);
    expect(event.userId).toBe(TEST_USER_ID);
  });

  it('throws when account type is invalid', async () => {
    const command = new CreateBankAccountCommand(TEST_USER_ID, TEST_ACCOUNT_ID, 'Nom', 'Banque', 'INVALID');
    await expect(handler.handle(command)).rejects.toThrow('Invalid account type');
  });

  it('throws when account name is empty', async () => {
    const command = new CreateBankAccountCommand(TEST_USER_ID, TEST_ACCOUNT_ID, '', 'Banque', 'CHECKING');
    await expect(handler.handle(command)).rejects.toThrow('BankName cannot be empty');
  });
});
