import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { of } from 'rxjs';
import { DeleteBankAccountCommandHandler } from './DeleteBankAccountCommandHandler';
import { DeleteBankAccountCommand } from './DeleteBankAccountCommand';
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
    Balance.from(1500),
    new Date('2024-01-01'),
    new Date('2024-01-01'),
  );
}

describe('DeleteBankAccountCommandHandler', () => {
  let handler: DeleteBankAccountCommandHandler;
  let repository: jest.Mocked<IBankAccountRepository>;
  let eventBus: { execute: jest.Mock };

  beforeEach(() => {
    repository = { save: jest.fn(), findById: jest.fn(), delete: jest.fn() };
    eventBus = { execute: jest.fn().mockReturnValue(of(undefined)) };
    handler = new DeleteBankAccountCommandHandler(repository, eventBus as unknown as EventBus);
  });

  it('finds the account, deletes it and dispatches BankAccountDeleted', async () => {
    repository.findById.mockResolvedValue(makeAccount());
    repository.delete.mockResolvedValue(undefined);

    await handler.handle(new DeleteBankAccountCommand(OWNER_ID, ACCOUNT_ID));

    expect(repository.delete).toHaveBeenCalledTimes(1);
    expect(eventBus.execute).toHaveBeenCalledTimes(1);
    const event = eventBus.execute.mock.calls[0][0];
    expect(event.constructor.name).toBe('BankAccountDeleted');
    expect(event.bankAccountId).toBe(ACCOUNT_ID);
    expect(event.userId).toBe(OWNER_ID);
  });

  it('throws NotFoundException when account does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      handler.handle(new DeleteBankAccountCommand(OWNER_ID, ACCOUNT_ID)),
    ).rejects.toThrow(NotFoundException);
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('throws ForbiddenException when userId does not match', async () => {
    repository.findById.mockResolvedValue(makeAccount(OTHER_USER_ID));

    await expect(
      handler.handle(new DeleteBankAccountCommand(OWNER_ID, ACCOUNT_ID)),
    ).rejects.toThrow(ForbiddenException);
    expect(repository.delete).not.toHaveBeenCalled();
  });
});
