import { Inject, Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import type { CommandHandlerInterface } from '../../../../_shared/infrastructure/message-bus/command/command-handler.interface';
import { EventBus } from '../../../../_shared/infrastructure/message-bus/bridge/bus/event.bus';
import type { IBankAccountRepository } from '../../../../bank-account/domain/repositories/IBankAccountRepository';
import { BANK_ACCOUNT_REPOSITORY } from '../../../../bank-account/domain/repositories/IBankAccountRepository';
import { BankAccountId } from '../../../../bank-account/domain/value-objects/BankAccountId';
import type { ITransactionRepository } from '../../../../transaction/domain/repositories/ITransactionRepository';
import { TRANSACTION_REPOSITORY } from '../../../../transaction/domain/repositories/ITransactionRepository';
import { Transaction } from '../../../../transaction/domain/entities/Transaction';
import { TransactionId } from '../../../../transaction/domain/value-objects/TransactionId';
import { TransactionHash } from '../../../../transaction/domain/value-objects/TransactionHash';
import type { ITransactionCryptoService } from '../../../../transaction/domain/services/ITransactionCryptoService';
import { TRANSACTION_CRYPTO_SERVICE } from '../../../../transaction/domain/services/ITransactionCryptoService';
import type { ICsvParserService } from '../../../domain/services/ICsvParserService';
import { CSV_PARSER_SERVICE } from '../../../domain/services/ICsvParserService';
import type { IImportLogRepository } from '../../../domain/repositories/IImportLogRepository';
import { IMPORT_LOG_REPOSITORY } from '../../../domain/repositories/IImportLogRepository';
import { ImportLog } from '../../../domain/entities/ImportLog';
import { ImportLogId } from '../../../domain/value-objects/ImportLogId';
import { ImportCompleted } from '../../events/ImportCompleted';
import { uuidV7 } from '../../../../_shared/domain/uuid/uuid-v7';
import type { ImportTransactionsCommand } from './ImportTransactionsCommand';

@Injectable()
export class ImportTransactionsCommandHandler implements CommandHandlerInterface {
  constructor(
    @Inject(BANK_ACCOUNT_REPOSITORY)
    private readonly bankAccountRepository: IBankAccountRepository,
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
    @Inject(IMPORT_LOG_REPOSITORY)
    private readonly importLogRepository: IImportLogRepository,
    @Inject(CSV_PARSER_SERVICE)
    private readonly csvParser: ICsvParserService,
    @Inject(TRANSACTION_CRYPTO_SERVICE)
    private readonly crypto: ITransactionCryptoService,
    private readonly eventBus: EventBus,
  ) {}

  async handle(command: ImportTransactionsCommand): Promise<ImportLog> {
    const account = await this.bankAccountRepository.findById(BankAccountId.from(command.bankAccountId));

    if (!account) {
      throw new NotFoundException(`Bank account not found: ${command.bankAccountId}`);
    }

    if (account.userId !== command.userId) {
      throw new ForbiddenException('Access denied to this bank account');
    }

    let parsed;
    try {
      parsed = this.csvParser.parse(command.rawContent);
    } catch {
      throw new BadRequestException('Unable to parse CSV file');
    }

    const importLogId = uuidV7();
    const toSave: Transaction[] = [];
    let skippedCount = 0;

    for (const row of parsed) {
      const hash = TransactionHash.from(row.date, row.amount, row.label, command.bankAccountId);
      const isDuplicate = await this.transactionRepository.existsByHash(hash.toString(), command.bankAccountId);

      if (isDuplicate) {
        skippedCount++;
        continue;
      }

      const { encrypted, iv } = this.crypto.encrypt(row.label);
      toSave.push(
        Transaction.create(
          TransactionId.from(uuidV7()),
          command.userId,
          command.bankAccountId,
          row.date,
          row.amount,
          encrypted,
          iv,
          hash,
          importLogId,
        ),
      );
    }

    await this.transactionRepository.saveBatch(toSave);

    const importLog = ImportLog.create(
      ImportLogId.from(importLogId),
      command.userId,
      command.bankAccountId,
      command.filename,
      command.format,
      toSave.length,
      skippedCount,
    );

    await this.importLogRepository.save(importLog);

    const event = new ImportCompleted(
      importLogId,
      command.bankAccountId,
      command.userId,
      toSave.length,
      skippedCount,
    );

    await lastValueFrom(this.eventBus.execute(event));

    return importLog;
  }
}
