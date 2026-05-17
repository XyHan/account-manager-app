import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { of } from 'rxjs';
import { UpdateBankAccountCommandHandler } from './UpdateBankAccountCommandHandler';
import { UpdateBankAccountCommand } from './UpdateBankAccountCommand';
import { BankAccount } from '../../../domain/entities/BankAccount';
import { BankAccountId } from '../../../domain/value-objects/BankAccountId';
import { BankName } from '../../../domain/value-objects/BankName';
import { AccountType } from '../../../domain/value-objects/AccountType';
import { Balance } from '../../../domain/value-objects/Balance';
import type { IBankAccountRepository } from '../../../domain/repositories/IBankAccountRepository';
import type { EventBus } from '../../../../_shared/infrastructure/message-bus/bridge/bus/event.bus';

const OWNER_ID = '550e8400-e29b-41d4-a716-446655440000';
const OTHER_USER_ID = '660e8400-e29b-41d4-a716-446655440001';
const ACCOUNT_ID = '770e8400-e29b-41d4-a716-446655440002';

function makeAccount(userId = OWNER_ID): BankAccount {
  return BankAccount.reconstitute(
    BankAccountId.from(ACCOUNT_ID),
    userId,
    BankName.from('Compte courant'),
    BankName.from('BNP Paribas'),
    AccountType.from('CHECKING'),
    Balance.from(0),
    new Date('2024-01-01'),
    new Date('2024-01-01'),
  );
}

function makeCommand(overrides: Partial<{ userId: string; name: string | undefined; bank: string | undefined; type: string | undefined }> = {}): UpdateBankAccountCommand {
  return new UpdateBankAccountCommand(
    overrides.userId ?? OWNER_ID,
    ACCOUNT_ID,
    'name' in overrides ? overrides.name : 'Nouveau nom',
    'bank' in overrides ? overrides.bank : 'Société Générale',
    'type' in overrides ? overrides.type : 'SAVINGS',
  );
}

describe('UpdateBankAccountCommandHandler', () => {
  let handler: UpdateBankAccountCommandHandler;
  let repository: jest.Mocked<IBankAccountRepository>;
  let eventBus: { execute: jest.Mock };

  beforeEach(() => {
    repository = { save: jest.fn(), findById: jest.fn(), delete: jest.fn() };
    eventBus = { execute: jest.fn().mockReturnValue(of(undefined)) };
    handler = new UpdateBankAccountCommandHandler(repository, eventBus as unknown as EventBus);
  });

  it('updates name, bank and type then saves', async () => {
    repository.findById.mockResolvedValue(makeAccount());
    repository.save.mockResolvedValue(undefined);

    await handler.handle(makeCommand());

    const saved = repository.save.mock.calls[0][0];
    expect(saved.name.toString()).toBe('Nouveau nom');
    expect(saved.bank.toString()).toBe('Société Générale');
    expect(saved.type.toString()).toBe('SAVINGS');
  });

  it('dispatches BankAccountUpdated event', async () => {
    repository.findById.mockResolvedValue(makeAccount());
    repository.save.mockResolvedValue(undefined);

    await handler.handle(makeCommand());

    expect(eventBus.execute).toHaveBeenCalledTimes(1);
    const event = eventBus.execute.mock.calls[0][0];
    expect(event.constructor.name).toBe('BankAccountUpdated');
    expect(event.bankAccountId).toBe(ACCOUNT_ID);
  });

  it('throws NotFoundException when account does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(handler.handle(makeCommand())).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException when userId does not match', async () => {
    repository.findById.mockResolvedValue(makeAccount(OTHER_USER_ID));

    await expect(handler.handle(makeCommand({ userId: OWNER_ID }))).rejects.toThrow(ForbiddenException);
  });

  it('throws when account type is invalid', async () => {
    repository.findById.mockResolvedValue(makeAccount());

    await expect(handler.handle(makeCommand({ type: 'INVALID' }))).rejects.toThrow('Invalid account type');
  });

  it('keeps current values when field is undefined (partial update)', async () => {
    repository.findById.mockResolvedValue(makeAccount());
    repository.save.mockResolvedValue(undefined);

    await handler.handle(makeCommand({ name: undefined, bank: undefined, type: undefined }));

    const saved = repository.save.mock.calls[0][0];
    expect(saved.name.toString()).toBe('Compte courant');
    expect(saved.bank.toString()).toBe('BNP Paribas');
    expect(saved.type.toString()).toBe('CHECKING');
  });

  it('returns the updated BankAccount entity', async () => {
    repository.findById.mockResolvedValue(makeAccount());
    repository.save.mockResolvedValue(undefined);

    const result = await handler.handle(makeCommand());

    expect(result.id.toString()).toBe(ACCOUNT_ID);
    expect(result.name.toString()).toBe('Nouveau nom');
    expect(result.bank.toString()).toBe('Société Générale');
    expect(result.type.toString()).toBe('SAVINGS');
  });
});
