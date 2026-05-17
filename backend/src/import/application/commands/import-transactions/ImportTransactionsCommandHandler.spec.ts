import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { of } from 'rxjs';
import { ImportTransactionsCommandHandler } from './ImportTransactionsCommandHandler';
import { ImportTransactionsCommand } from './ImportTransactionsCommand';
import { BankAccount } from '../../../../bank-account/domain/entities/BankAccount';
import { BankAccountId } from '../../../../bank-account/domain/value-objects/BankAccountId';
import { BankName } from '../../../../bank-account/domain/value-objects/BankName';
import { AccountType } from '../../../../bank-account/domain/value-objects/AccountType';
import { Balance } from '../../../../bank-account/domain/value-objects/Balance';
import type { IBankAccountRepository } from '../../../../bank-account/domain/repositories/IBankAccountRepository';
import type { ITransactionRepository } from '../../../../transaction/domain/repositories/ITransactionRepository';
import type { IImportLogRepository } from '../../../domain/repositories/IImportLogRepository';
import type { ICsvParserService } from '../../../domain/services/ICsvParserService';
import type { EventBus } from '../../../../_shared/infrastructure/message-bus/bridge/bus/event.bus';
import type { ITransactionCryptoService } from '../../../../transaction/domain/services/ITransactionCryptoService';

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

function makeCommand(): ImportTransactionsCommand {
  return new ImportTransactionsCommand(OWNER_ID, ACCOUNT_ID, 'test.csv', 'CSV', 'raw-content');
}

describe('ImportTransactionsCommandHandler', () => {
  let handler: ImportTransactionsCommandHandler;
  let bankAccountRepository: jest.Mocked<IBankAccountRepository>;
  let transactionRepository: jest.Mocked<ITransactionRepository>;
  let importLogRepository: jest.Mocked<IImportLogRepository>;
  let csvParser: jest.Mocked<ICsvParserService>;
  let crypto: jest.Mocked<ITransactionCryptoService>;
  let eventBus: { execute: jest.Mock };

  beforeEach(() => {
    bankAccountRepository = { save: jest.fn(), findById: jest.fn(), delete: jest.fn() };
    transactionRepository = { saveBatch: jest.fn(), existsByHash: jest.fn(), sumByBankAccount: jest.fn() };
    importLogRepository = { save: jest.fn() };
    csvParser = { parse: jest.fn() };
    crypto = { encrypt: jest.fn().mockReturnValue({ encrypted: 'enc', iv: 'iv' }), decrypt: jest.fn() } as jest.Mocked<ITransactionCryptoService>;
    eventBus = { execute: jest.fn().mockReturnValue(of(undefined)) };

    handler = new ImportTransactionsCommandHandler(
      bankAccountRepository,
      transactionRepository,
      importLogRepository,
      csvParser,
      crypto,
      eventBus as unknown as EventBus,
    );
  });

  it('imports new transactions, skips duplicates, saves import log and dispatches ImportCompleted', async () => {
    bankAccountRepository.findById.mockResolvedValue(makeAccount());
    csvParser.parse.mockReturnValue([
      { date: new Date('2024-01-15'), amount: -800, label: 'Loyer' },
      { date: new Date('2024-01-20'), amount: 2500, label: 'Salaire' },
    ]);
    transactionRepository.existsByHash
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    transactionRepository.saveBatch.mockResolvedValue(undefined);
    importLogRepository.save.mockResolvedValue(undefined);

    const result = await handler.handle(makeCommand());

    expect(transactionRepository.saveBatch).toHaveBeenCalledTimes(1);
    const saved = transactionRepository.saveBatch.mock.calls[0][0];
    expect(saved).toHaveLength(1);
    expect(result.addedCount).toBe(1);
    expect(result.skippedCount).toBe(1);
    expect(importLogRepository.save).toHaveBeenCalledTimes(1);
    expect(eventBus.execute).toHaveBeenCalledTimes(1);
    const event = eventBus.execute.mock.calls[0][0];
    expect(event.constructor.name).toBe('ImportCompleted');
    expect(event.bankAccountId).toBe(ACCOUNT_ID);
  });

  it('throws NotFoundException when bank account does not exist', async () => {
    bankAccountRepository.findById.mockResolvedValue(null);

    await expect(handler.handle(makeCommand())).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException when userId does not match', async () => {
    bankAccountRepository.findById.mockResolvedValue(makeAccount(OTHER_USER_ID));

    await expect(handler.handle(makeCommand())).rejects.toThrow(ForbiddenException);
  });

  it('throws BadRequestException when CSV parsing fails', async () => {
    bankAccountRepository.findById.mockResolvedValue(makeAccount());
    csvParser.parse.mockImplementation(() => { throw new Error('parse error'); });

    await expect(handler.handle(makeCommand())).rejects.toThrow(BadRequestException);
  });

  it('saves an empty batch when all transactions are duplicates', async () => {
    bankAccountRepository.findById.mockResolvedValue(makeAccount());
    csvParser.parse.mockReturnValue([
      { date: new Date('2024-01-15'), amount: -800, label: 'Loyer' },
    ]);
    transactionRepository.existsByHash.mockResolvedValue(true);
    transactionRepository.saveBatch.mockResolvedValue(undefined);
    importLogRepository.save.mockResolvedValue(undefined);

    const result = await handler.handle(makeCommand());

    expect(result.addedCount).toBe(0);
    expect(result.skippedCount).toBe(1);
  });
});
